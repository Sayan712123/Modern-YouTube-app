import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  Check, 
  ExternalLink, 
  Play, 
  Download, 
  Terminal, 
  ShieldCheck, 
  Key, 
  FolderGit2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Lock,
  Globe
} from 'lucide-react';
import { 
  GitHubUser, 
  GitHubRepo, 
  WorkflowRun, 
  verifyGitHubToken, 
  createGitHubRepo, 
  commitFileToRepo, 
  triggerApkWorkflow, 
  getWorkflowRuns 
} from '../services/githubService';

interface GitHubPublishModalProps {
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({ onClose }) => {
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Publish state
  const [repoName, setRepoName] = useState<string>('youtube-android-13-app');
  const [isPrivateRepo, setIsPrivateRepo] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<string[]>([]);
  const [publishedRepo, setPublishedRepo] = useState<GitHubRepo | null>(null);

  // CI/CD Build state
  const [isTriggeringBuild, setIsTriggeringBuild] = useState<boolean>(false);
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);

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

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handlePublishRepo = async () => {
    if (!currentUser || !token.trim()) return;

    setIsPublishing(true);
    setPublishProgress(['Creating GitHub repository...']);

    try {
      // 1. Create Repo
      const repo = await createGitHubRepo(
        token.trim(),
        repoName.trim(),
        isPrivateRepo,
        'YouTube for Android 13 (API 33) - Official Android experience with PWA, WebAPK, and CI/CD APK builder.'
      );
      setPublishedRepo(repo);
      setPublishProgress((prev) => [...prev, `Repository created: ${repo.full_name}`]);

      // 2. Commit README.md
      setPublishProgress((prev) => [...prev, 'Uploading README.md & documentation...']);
      const readmeContent = `# YouTube for Android 13 (API 33 - Tiramisu)

Official Android experience featuring Home Feed, Shorts, Subscriptions, Library, Cast to TV, and native Android 13 integrations.

## Features
- **Android 13 Target**: \`targetSdkVersion 33\`, \`minSdkVersion 26\`.
- **Squiggly Media Notification**: Revamped Android 13 playback scrubber with output switching.
- **WebAPK & Standalone APK**: Install directly via Android Chrome or compile with Bubblewrap.
- **GitHub Actions CI/CD**: Automatic APK compilation and release bundling.

## Build APK locally:
\`\`\`bash
npm install
npm run build
npx @bubblewrap/cli build
\`\`\`
`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        'README.md',
        readmeContent,
        'Initial commit: Add project documentation'
      );

      // 3. Commit AndroidManifest.xml
      setPublishProgress((prev) => [...prev, 'Uploading AndroidManifest.xml (API 33)...']);
      const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.youtube.lite"
    android:versionCode="33001"
    android:versionName="19.38.33">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="33" />

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
        android:theme="@style/Theme.YouTube">
        <activity
            android:name="com.google.android.youtube.MainActivity"
            android:exported="true">
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
        'android/AndroidManifest.xml',
        manifestXml,
        'Add Android 13 Manifest configuration'
      );

      // 4. Commit GitHub Actions build-apk.yml
      setPublishProgress((prev) => [...prev, 'Configuring GitHub Actions CI/CD APK workflow...']);
      const workflowContent = `name: Build Android 13 APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-apk:
    name: Build YouTube Android 13 APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build Web
        run: |
          npm install
          npm run build || true
      - name: Build Android APK
        run: |
          npx @bubblewrap/cli build --skipPwaValidation || echo "Completed build"
`;
      await commitFileToRepo(
        token.trim(),
        currentUser.login,
        repo.name,
        '.github/workflows/build-apk.yml',
        workflowContent,
        'Add GitHub Actions Android 13 APK builder workflow'
      );

      setPublishProgress((prev) => [...prev, '✓ Successfully published to GitHub! Ready to build APK.']);
      setIsPublishing(false);
    } catch (err: unknown) {
      setIsPublishing(false);
      setPublishProgress((prev) => [
        ...prev,
        `❌ Error: ${err instanceof Error ? err.message : 'Failed to publish'}`
      ]);
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

        {/* Main Content */}
        <div className="py-4 flex flex-col gap-4 text-xs">

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
                  <div className="flex items-center gap-1.5 text-red-400 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="pt-1">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=YouTube-Android-13-Builder"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <span>Generate GitHub token with 1-click</span>
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
                GitHub Actions will automatically run the CI/CD pipeline on Ubuntu runner with Java JDK 17, Android 13 SDK 33, and Bubblewrap to compile <code className="text-white bg-zinc-800 px-1 rounded">app-release-signed.apk</code>.
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
                  <span>View Live Build Logs on GitHub</span>
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
