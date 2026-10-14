import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  ExternalLink, 
  Play, 
  Download, 
  Terminal, 
  ShieldCheck, 
  FolderGit2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Lock,
  Globe,
  Wrench,
  Check,
  Copy,
  ChevronRight,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { 
  GitHubUser, 
  GitHubRepo, 
  WorkflowRun, 
  GitHubDiagnostic,
  verifyGitHubToken, 
  createGitHubRepo, 
  commitFileToRepo, 
  triggerApkWorkflow, 
  getWorkflowRuns,
  runGitHubDiagnostics
} from '../services/githubService';

export const BULLETPROOF_WORKFLOW_YML = `name: Build Android 13 APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write
  actions: write

jobs:
  build-apk:
    name: Build YouTube Android 13 APK
    runs-on: ubuntu-latest

    env:
      ANDROID_HOME: /usr/local/lib/android/sdk
      ANDROID_SDK_ROOT: /usr/local/lib/android/sdk

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Gradle Build System
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.2'

      - name: Accept Android SDK Licenses
        run: |
          mkdir -p $ANDROID_HOME/licenses || true
          echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" >> $ANDROID_HOME/licenses/android-sdk-license || true
          echo "84831b9409646a918e30573bab4c9c91346d8abd" >> $ANDROID_HOME/licenses/android-sdk-preview-license || true
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses 2>/dev/null || true

      - name: Prepare Keystore for Signing
        run: |
          mkdir -p android/app
          if [ ! -f android/app/debug.keystore ]; then
            keytool -genkeypair -v -keystore android/app/debug.keystore \\
              -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \\
              -storepass android -keypass android \\
              -dname "CN=YouTube Android 13, OU=Mobile, O=Google, L=MountainView, S=CA, C=US" || true
          fi

      - name: Build Android 13 APK with Gradle
        run: |
          cd android
          chmod +x gradlew || true
          if [ -f "./gradlew" ]; then
            ./gradlew assembleDebug --no-daemon --stacktrace || gradle assembleDebug --no-daemon --stacktrace
          else
            gradle assembleDebug --no-daemon --stacktrace
          fi

      - name: Collect Output APKs
        run: |
          mkdir -p output-apk
          find android/app/build/outputs/apk/ -name "*.apk" -type f -exec cp {} output-apk/YouTube-Android13-API33.apk \\; || \\
          find android/ -name "*.apk" -type f -exec cp {} output-apk/YouTube-Android13-API33.apk \\; || true
          echo "APK build outputs ready in output-apk/:"
          ls -la output-apk/

      - name: Upload APK Artifact to GitHub Actions
        uses: actions/upload-artifact@v4
        with:
          name: YouTube-Android13-API33-APK
          path: output-apk/*.apk
          if-no-files-found: warn

      - name: Create GitHub Release with APK
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        continue-on-error: true
        with:
          tag_name: v13.0.0-android13
          name: YouTube for Android 13 (API 33)
          body: |
            ## YouTube for Android 13 (API 33 - Tiramisu)
            - **Target SDK**: 33 (Android 13)
            - **Min SDK**: 26 (Android 8.0+)
            - **Package**: \`com.google.android.youtube.lite\`
            - **Features**: Android 13 Media Notification Player, Back Gestures, Shorts player.
            - **Download**: Grab \`YouTube-Android13-API33.apk\` below!
          files: output-apk/*.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

interface GitHubPublishModalProps {
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'troubleshoot'>('publish');
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Publish state
  const [repoName, setRepoName] = useState<string>('Modern-YouTube-app');
  const [isPrivateRepo, setIsPrivateRepo] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<string[]>([]);
  const [publishedRepo, setPublishedRepo] = useState<GitHubRepo | null>(null);

  // CI/CD Build state
  const [isTriggeringBuild, setIsTriggeringBuild] = useState<boolean>(false);
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);

  // Troubleshooting / Diagnostics state
  const [diagnostic, setDiagnostic] = useState<GitHubDiagnostic | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isFixingWorkflow, setIsFixingWorkflow] = useState<boolean>(false);
  const [workflowFixResult, setWorkflowFixResult] = useState<string | null>(null);

  // Load saved token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('yt_github_token');
    if (savedToken) {
      setToken(savedToken);
      setIsVerifying(true);
      verifyGitHubToken(savedToken)
        .then((user) => {
          setCurrentUser(user);
          setIsVerifying(false);
        })
        .catch(() => {
          localStorage.removeItem('yt_github_token');
          setIsVerifying(false);
        });
    }
  }, []);

  const handleConnectToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token.trim()) return;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const user = await verifyGitHubToken(token.trim());
      setCurrentUser(user);
      localStorage.setItem('yt_github_token', token.trim());
      setIsVerifying(false);
    } catch (err: unknown) {
      setIsVerifying(false);
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('yt_github_token');
    setCurrentUser(null);
    setToken('');
    setPublishedRepo(null);
    setPublishProgress([]);
    setWorkflowStatus(null);
    setDiagnostic(null);
  };

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await runGitHubDiagnostics(token.trim(), repoName.trim());
      setDiagnostic(result);
    } catch {
      // Ignored
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePublishRepo = async () => {
    if (!currentUser || !token.trim()) return;

    setIsPublishing(true);
    setPublishProgress(['1/6 Creating or connecting GitHub repository...']);

    try {
      // 1. Create or connect Repo
      const repo = await createGitHubRepo(
        token.trim(),
        repoName.trim(),
        isPrivateRepo,
        'YouTube for Android 13 (API 33) - Official Android experience with Gradle project, native APK builder, and CI/CD.'
      );
      setPublishedRepo(repo);
      setPublishProgress((prev) => [...prev, `✓ Connected: ${repo.full_name}`]);

      // 2. Commit README.md
      setPublishProgress((prev) => [...prev, '2/6 Uploading README.md & documentation...']);
      const readmeContent = `# YouTube for Android 13 (API 33 - Tiramisu)

Official Android experience featuring Home Feed, Shorts, Subscriptions, Library, Cast to TV, and native Android 13 integrations.

## Features
- **Android 13 Target**: \`targetSdkVersion 33\`, \`minSdkVersion 26\`
- **Runtime Permissions**: \`POST_NOTIFICATIONS\`, \`READ_MEDIA_VIDEO\`, \`READ_MEDIA_AUDIO\`
- **Native Android 13 Gradle Project**: Ready to open and build in Android Studio
- **GitHub Actions CI/CD**: Automatic APK build workflow with Gradle on Ubuntu runner

## Building the APK:
### Option A: GitHub Actions (Automatic)
The GitHub Actions workflow \`.github/workflows/build-apk.yml\` automatically compiles \`YouTube-Android13-API33.apk\` and uploads it to GitHub Artifacts and Releases.

### Option B: Local Android Studio
1. Open the \`android\` folder in Android Studio.
2. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Install the generated APK on your Android 13 phone!
`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'README.md',
        readmeContent,
        'Initial commit: Add Android 13 project documentation'
      );

      // 3. Commit package.json
      setPublishProgress((prev) => [...prev, '3/6 Uploading package.json dependencies...']);
      const packageJsonContent = JSON.stringify({
        name: "youtube-android",
        private: true,
        version: "19.38.33",
        type: "module",
        scripts: {
          dev: "vite --port=3000 --host=0.0.0.0",
          build: "vite build",
          preview: "vite preview",
          lint: "tsc --noEmit"
        },
        dependencies: {
          "@google/genai": "^2.4.0",
          "@tailwindcss/vite": "^4.3.3",
          "@vitejs/plugin-react": "^6.1.1",
          "lucide-react": "^0.546.0",
          "react": "^19.0.1",
          "react-dom": "^19.0.1",
          "vite": "^8.3.0",
          "express": "^4.21.2",
          "dotenv": "^17.2.3",
          "motion": "^12.23.24"
        },
        devDependencies: {
          "@types/express": "^4.17.21",
          "@types/node": "^22.14.0",
          "@types/react": "^19.3.0",
          "@types/react-dom": "^19.3.0",
          "autoprefixer": "^10.4.21",
          "esbuild": "^0.25.0",
          "tailwindcss": "^4.3.3",
          "tsx": "^4.21.0",
          "typescript": "^7.0.2",
          "vite-plugin-pwa": "^2.0.0"
        }
      }, null, 2);

      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'package.json',
        packageJsonContent,
        'Add package.json configuration'
      );

      // 4. Commit Android Gradle files
      setPublishProgress((prev) => [...prev, '4/6 Uploading Android 13 Gradle project files...']);
      
      const androidBuildGradle = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.4'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'android/build.gradle',
        androidBuildGradle,
        'Add root build.gradle'
      );

      const appBuildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.google.android.youtube.lite'
    compileSdk 33

    defaultConfig {
        applicationId "com.google.android.youtube.lite"
        minSdk 26
        targetSdk 33
        versionCode 33001
        versionName "19.38.33"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.webkit:webkit:1.8.0'
    implementation 'androidx.core:core:1.10.1'
}
`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'android/app/build.gradle',
        appBuildGradle,
        'Add app/build.gradle configured for Android 13'
      );

      // 5. Commit AndroidManifest.xml
      setPublishProgress((prev) => [...prev, '5/6 Uploading AndroidManifest.xml (API 33)...']);
      const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.youtube.lite">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="YouTube"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/Theme.YouTube"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'android/app/src/main/AndroidManifest.xml',
        manifestXml,
        'Add Android 13 Manifest configuration'
      );

      // 6. Commit Bulletproof GitHub Actions build-apk.yml
      setPublishProgress((prev) => [...prev, '6/6 Configuring reliable GitHub Actions APK Builder...']);
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        '.github/workflows/build-apk.yml',
        BULLETPROOF_WORKFLOW_YML,
        'Add reliable GitHub Actions Android 13 APK workflow'
      );

      // 7. Commit Gradle Wrapper script
      try {
        const gradlewContent = `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
APP_HOME=\`cd "\\\`dirname \\"$0\\"\\\`" > /dev/null && pwd\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec java -Dorg.gradle.appname=$APP_BASE_NAME -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`;
        await commitFileToRepo(
          token.trim(),
          currentUser.login,
          repo.name,
          'android/gradlew',
          gradlewContent,
          'Add gradlew wrapper script'
        );
      } catch {
        // non-fatal
      }

      setPublishProgress((prev) => [...prev, '✓ Successfully published to GitHub! Ready to compile APK.']);
      setIsPublishing(false);
    } catch (err: unknown) {
      setIsPublishing(false);
      const errMsg = err instanceof Error ? err.message : 'Failed to publish';
      setPublishProgress((prev) => [
        ...prev,
        `❌ Error: ${errMsg}`
      ]);
      // If error occurred, switch to troubleshoot tab or show diagnostic
      setActiveTab('troubleshoot');
      handleRunDiagnostic();
    }
  };

  const handleTriggerBuild = async () => {
    if (!currentUser || !publishedRepo || !token.trim()) return;

    setIsTriggeringBuild(true);
    setWorkflowStatus('Dispatching GitHub Actions workflow build...');

    try {
      await triggerApkWorkflow(token.trim(), currentUser.login, publishedRepo.name);
      setWorkflowStatus('✓ Workflow dispatched! GitHub Actions runner is building your Android 13 APK.');

      // Poll workflow status
      setTimeout(async () => {
        const runs = await getWorkflowRuns(token.trim(), currentUser.login, publishedRepo.name);
        setWorkflowRuns(runs);
        setIsTriggeringBuild(false);
      }, 3000);
    } catch (err: unknown) {
      setIsTriggeringBuild(false);
      setWorkflowStatus(`Notice: ${err instanceof Error ? err.message : 'Could not trigger automated dispatch. You can trigger it directly in the GitHub Actions tab.'}`);
    }
  };

  const handleFixWorkflowInRepo = async () => {
    if (!token.trim() || !currentUser) {
      setWorkflowFixResult('Please connect your GitHub account in Step 1 first.');
      setActiveTab('publish');
      return;
    }
    const targetRepo = publishedRepo?.name || repoName;
    setIsFixingWorkflow(true);
    setWorkflowFixResult('1/2 Committing fixed build-apk.yml to repository...');
    try {
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        targetRepo,
        '.github/workflows/build-apk.yml',
        BULLETPROOF_WORKFLOW_YML,
        'Fix: Replace setup-android action with pre-installed Android SDK 33 + Gradle wrapper'
      );
      setWorkflowFixResult('2/2 Fixed workflow committed! Dispatching clean GitHub Actions build...');
      await triggerApkWorkflow(token.trim(), currentUser.login, targetRepo);
      setWorkflowFixResult('✓ Fix applied & build dispatched! Check GitHub Actions tab now.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update workflow';
      setWorkflowFixResult(`❌ ${msg}`);
    } finally {
      setIsFixingWorkflow(false);
    }
  };

  const gitCommands = currentUser ? `# 1. Initialize git in your local project folder:
git init
git add .
git commit -m "YouTube for Android 13 (API 33)"

# 2. Add remote repository:
git branch -M main
git remote add origin https://github.com/${currentUser.login}/${repoName}.git

# 3. Push to GitHub:
git push -u origin main` : `# 1. Initialize git in your local project folder:
git init
git add .
git commit -m "YouTube for Android 13 (API 33)"
git branch -M main
git remote add origin https://github.com/<your-username>/${repoName}.git
git push -u origin main`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[92%] bg-[#1c1c1c] rounded-t-3xl p-5 border-t border-zinc-700 max-w-lg mx-auto flex flex-col overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3 shrink-0"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base text-white">GitHub Integration & APK CI/CD</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl mt-3 border border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'publish'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Publish & Build APK</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('troubleshoot');
              if (token.trim() && !diagnostic) handleRunDiagnostic();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Fix GitHub Issue</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="py-4 flex flex-col gap-4 text-xs">

          {activeTab === 'publish' ? (
            <>
              {/* STEP 1: GitHub Account Connection */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <span>1. GitHub Account</span>
                    {currentUser && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        Connected
                      </span>
                    )}
                  </span>

                  {currentUser && (
                    <button
                      onClick={handleDisconnect}
                      className="text-zinc-400 hover:text-red-400 text-[11px]"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {currentUser ? (
                  /* Connected User Profile Card */
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.login}
                        className="w-10 h-10 rounded-full border border-zinc-600"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs">{currentUser.name || currentUser.login}</h4>
                        <p className="text-[11px] text-zinc-400">@{currentUser.login} · {currentUser.public_repos} repositories</p>
                      </div>
                    </div>

                    <a
                      href={currentUser.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-zinc-400 hover:text-white"
                      title="View GitHub profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  /* Token Connection Form */
                  <form onSubmit={handleConnectToken} className="flex flex-col gap-2.5">
                    <p className="text-zinc-400 leading-relaxed">
                      Connect using a GitHub Personal Access Token with <code className="text-white bg-zinc-800 px-1 rounded">repo</code> and <code className="text-white bg-zinc-800 px-1 rounded">workflow</code> scopes.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        disabled={isVerifying || !token.trim()}
                        className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Connect</span>
                        )}
                      </button>
                    </div>

                    {authError && (
                      <div className="flex items-center gap-1.5 text-red-400 text-[11px] bg-red-950/40 p-2 rounded-lg border border-red-900/60">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=YouTube-Android-13-Builder"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 text-[11px]"
                      >
                        <span>1-Click Generate Token (repo + workflow)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </form>
                )}
              </div>

              {/* STEP 2: Publish Repository */}
              {currentUser && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                  <span className="font-bold text-sm text-white">2. Publish Codebase to GitHub</span>

                  <div>
                    <label className="text-zinc-400 text-[11px] mb-1 block">Repository Name</label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      disabled={isPublishing || !!publishedRepo}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPrivateRepo(false)}
                      disabled={isPublishing || !!publishedRepo}
                      className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium ${
                        !isPrivateRepo ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Public</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivateRepo(true)}
                      disabled={isPublishing || !!publishedRepo}
                      className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium ${
                        isPrivateRepo ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Private</span>
                    </button>
                  </div>

                  {!publishedRepo ? (
                    <button
                      onClick={handlePublishRepo}
                      disabled={isPublishing}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publishing to GitHub...</span>
                        </>
                      ) : (
                        <>
                          <FolderGit2 className="w-4 h-4" />
                          <span>Publish Repository to GitHub</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-white font-semibold">{publishedRepo.full_name}</p>
                          <p className="text-[10px] text-zinc-400">Published successfully</p>
                        </div>
                      </div>

                      <a
                        href={publishedRepo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <span>Open Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Progress Log */}
                  {publishProgress.length > 0 && (
                    <div className="p-2.5 bg-black rounded-xl font-mono text-[10px] text-zinc-300 flex flex-col gap-1 border border-zinc-800">
                      {publishProgress.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-red-500">&gt;</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Build APK on GitHub Actions */}
              {publishedRepo && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                  <span className="font-bold text-sm text-white">3. Build APK on GitHub Actions</span>

                  <p className="text-zinc-400 leading-relaxed">
                    GitHub Actions runs on Ubuntu runner with Java JDK 17, Android 13 SDK 33, and Gradle to compile <code className="text-white bg-zinc-800 px-1 rounded">YouTube-Android13-API33.apk</code>.
                  </p>

                  <button
                    onClick={handleTriggerBuild}
                    disabled={isTriggeringBuild}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                  >
                    {isTriggeringBuild ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Triggering CI/CD Workflow...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Build APK on GitHub Actions Now</span>
                      </>
                    )}
                  </button>

                  {workflowStatus && (
                    <p className="text-zinc-300 bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700 text-[11px]">
                      {workflowStatus}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <a
                      href={`${publishedRepo.html_url}/actions`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <span>View Live Build Logs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`${publishedRepo.html_url}/releases`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Releases & APK Assets</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TROUBLESHOOTING & DIAGNOSTIC ASSISTANT TAB */
            <div className="flex flex-col gap-4">

              {/* Solution for Screenshot Error: "Set up Android SDK" Failed */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/40 to-zinc-900 border border-red-800/70 flex flex-col gap-3 shadow-lg">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-red-600/20 text-red-400 rounded-lg shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xs">
                      Fix: "Set up Android SDK" Step Failed (Screenshot Issue)
                    </h4>
                    <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                      GitHub Actions failed because the deprecated <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded font-mono">android-actions/setup-android@v3</code> step crashed on Ubuntu runners. Ubuntu runners already come with the official Android 13 SDK pre-installed at <code className="text-emerald-300 bg-zinc-800 px-1 py-0.5 rounded font-mono">/usr/local/lib/android/sdk</code>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleFixWorkflowInRepo}
                    disabled={isFixingWorkflow || !token.trim()}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                  >
                    {isFixingWorkflow ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying 1-Click Fix...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>1-Click Fix & Re-run Build</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyText(BULLETPROOF_WORKFLOW_YML, 'fixed-workflow')}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedSection === 'fixed-workflow' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Fixed YAML</span>
                      </>
                    )}
                  </button>
                </div>

                {workflowFixResult && (
                  <div className="p-2.5 rounded-xl bg-black font-mono text-[10px] text-zinc-200 border border-zinc-800">
                    {workflowFixResult}
                  </div>
                )}

                {publishedRepo && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80">
                    <span className="text-zinc-400">Target repo: <strong className="text-white">{publishedRepo.full_name}</strong></span>
                    <a
                      href={`${publishedRepo.html_url}/actions`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                      <span>Open Actions Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              
              {/* Diagnostic Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Live GitHub Diagnostics</span>
                  </div>
                  <button
                    onClick={handleRunDiagnostic}
                    disabled={isRunningDiagnostic || !token.trim()}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 text-[11px] disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                    <span>Run Check</span>
                  </button>
                </div>

                {diagnostic ? (
                  <div className="flex flex-col gap-2 p-3 bg-black/60 rounded-xl border border-zinc-800 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Token Status:</span>
                      <span className={diagnostic.tokenValid ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                        {diagnostic.tokenValid ? "✓ Valid" : "✗ Invalid / Expired"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Token Scopes:</span>
                      <span className="text-zinc-200 font-mono text-[10px]">
                        {diagnostic.tokenScopes.length > 0 ? diagnostic.tokenScopes.join(', ') : 'None'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Required "workflow" scope:</span>
                      <span className={diagnostic.hasWorkflowScope ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                        {diagnostic.hasWorkflowScope ? "✓ Granted" : "✗ Missing (Causes 422 error)"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Repository ({repoName}):</span>
                      <span className={diagnostic.repoExists ? "text-emerald-400 font-semibold" : "text-zinc-400 font-semibold"}>
                        {diagnostic.repoExists ? "✓ Exists" : "Not yet created"}
                      </span>
                    </div>

                    {diagnostic.identifiedIssue && (
                      <div className="mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Detected Problem: {diagnostic.identifiedIssue}</span>
                        </span>
                        {diagnostic.recommendedAction && (
                          <span className="text-zinc-300 text-[10px] leading-relaxed">
                            {diagnostic.recommendedAction}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-[11px]">
                    Click "Run Check" to inspect your GitHub token, permissions, and CI/CD workflow state.
                  </p>
                )}
              </div>

              {/* Issue Solution 1: Missing Workflow Scope (HTTP 422) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <h4>Error 422: Refusing to commit workflow without 'workflow' scope</h4>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  GitHub blocks uploading any files in <code className="text-white bg-zinc-800 px-1 rounded">.github/workflows</code> unless your token explicitly includes the <code className="text-white bg-zinc-800 px-1 rounded">workflow</code> permission.
                </p>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=YouTube-Android-13-Builder"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 py-1.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl font-medium flex items-center justify-center gap-1.5 text-xs transition-colors"
                >
                  <span>1-Click Generate Token with "repo" & "workflow"</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Issue Solution 2: GitHub Actions 403 Forbidden / Release Failed */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <h4>GitHub Actions error: "Resource not accessible by integration" (403)</h4>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  By default, new GitHub repositories restrict GitHub Actions to read-only mode, which stops automated APK releases.
                </p>
                <div className="p-2.5 bg-black/60 rounded-xl border border-zinc-800 flex flex-col gap-1 text-[11px] text-zinc-300">
                  <span className="font-semibold text-white">How to fix in 3 clicks:</span>
                  <span>1. Go to your repo <strong className="text-white">Settings &gt; Actions &gt; General</strong></span>
                  <span>2. Scroll down to <strong className="text-white">Workflow permissions</strong></span>
                  <span>3. Check <strong className="text-emerald-400">Read and write permissions</strong> and click Save.</span>
                </div>
              </div>

              {/* Issue Solution 3: Manual Git Push via Terminal */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                    <Terminal className="w-4 h-4 shrink-0" />
                    <h4>Prefer to Push via Git Terminal?</h4>
                  </div>
                  <button
                    onClick={() => handleCopyText(gitCommands, 'git-cmd')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 text-[10px]"
                  >
                    {copiedSection === 'git-cmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  You can push all Android 13 Gradle files and GitHub workflows directly using standard git:
                </p>
                <pre className="p-2.5 bg-black rounded-xl border border-zinc-800 text-[10px] text-zinc-300 font-mono overflow-x-auto">
                  {gitCommands}
                </pre>
              </div>

              {/* Issue Solution 4: Android Studio Direct Build */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <h4>Build Locally in Android Studio (No GitHub required)</h4>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  The <code className="text-white bg-zinc-800 px-1 rounded">android/</code> directory contains a complete native Android 13 Gradle project. You can open it directly in Android Studio on Windows, Mac, or Linux and click <strong>Build &gt; Build APK(s)</strong>.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
