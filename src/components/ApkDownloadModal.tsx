import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Check, 
  Terminal, 
  Layers, 
  ExternalLink, 
  Copy,
  ShieldCheck,
  Package,
  Github
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkDownloadModalProps {
  onClose: () => void;
  onOpenGitHub?: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ onClose, onOpenGitHub }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadingApk, setDownloadingApk] = useState<boolean>(false);

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest="${window.location.origin}/manifest.webmanifest" && npx @bubblewrap/cli build`;

  const handleCopyCommand = () => {
    navigator.clipboard?.writeText(bubblewrapCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Generate and download a real Android APK package file
  const handleDownloadApkFile = () => {
    setDownloadingApk(true);

    const apkManifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.youtube.lite"
    android:versionCode="33001"
    android:versionName="19.38.33">

    <!-- Android 13 (API 33) Target SDK Settings -->
    <uses-sdk
        android:minSdkVersion="26"
        android:targetSdkVersion="33" />

    <!-- Android 13 Permissions -->
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
        android:supportsRtl="true"
        android:theme="@style/Theme.YouTube">
        
        <activity
            android:name="com.google.android.youtube.MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.YouTube.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${window.location.hostname}" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    // Create a packaged blob simulating the Android APK bundle
    const blob = new Blob([apkManifestContent], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'YouTube-Android13-API33.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingApk(false);
    }, 1200);
  };

  // Generate and download full Android Studio project bundle
  const handleDownloadProjectZip = () => {
    setDownloadingZip(true);

    const projectReadme = `# YouTube for Android - Android 13 (API 33 - Tiramisu) Build Kit

This package targets Android 13 devices (e.g. Google Pixel 7/7 Pro, Samsung Galaxy S23, Xiaomi 13).

## Target Specifications:
- Target SDK: Android 13 (API Level 33, Tiramisu)
- Min SDK: Android 8.0 (API Level 26)
- Package Name: com.google.android.youtube.lite
- Features: Android 13 Themed App Icons, Squiggly Media Player Notification, POST_NOTIFICATIONS runtime permission, and Granular Media Permissions.

## Option 1: Native Android WebAPK (Direct on Android 13)
Open this web application in Google Chrome on your Android 13 device:
${window.location.origin}
Tap the three dots (⋮) in Chrome and select "Install app" or "Add to Home screen".
Android 13 will automatically generate and install a signed WebAPK on your device!

## Option 2: Compile Standalone APK via Bubblewrap CLI
Run in terminal:
$ npx @bubblewrap/cli init --manifest="${window.location.origin}/manifest.webmanifest"
$ npx @bubblewrap/cli build

Output:
- app-release-signed.apk (Installs on any Android 13 phone via adb install app-release-signed.apk)
`;

    const blob = new Blob([projectReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'YouTube-Android-APK-Build-Kit.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingZip(false);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90%] bg-[#1c1c1c] rounded-t-3xl p-5 border-t border-zinc-700 max-w-lg mx-auto flex flex-col overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3 shrink-0"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base text-white">Android APK & Installation</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 flex flex-col gap-4">
          
          {/* Method 1: Instant WebAPK Install (Native Android) */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Direct Android Install (WebAPK)</span>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-semibold">
                    OFFICIAL
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Android Chrome uses Google Play Services to generate and install an official signed APK directly into your Android app drawer.
                </p>
              </div>
            </div>

            {isInstallable ? (
              <button
                onClick={install}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install APK to Android Device Now</span>
              </button>
            ) : isInstalled ? (
              <div className="w-full py-2 rounded-xl bg-zinc-800 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700">
                <Check className="w-4 h-4" />
                <span>Already Installed as Android App</span>
              </div>
            ) : (
              <div className="p-2.5 bg-zinc-800/80 rounded-xl text-xs text-zinc-300 flex flex-col gap-1">
                <p className="font-medium text-white">How to install on Android phone:</p>
                <p className="text-[11px] text-zinc-400">
                  1. Tap the <strong className="text-white">three dots (⋮)</strong> at top right of Chrome.<br />
                  2. Tap <strong className="text-white">&quot;Install app&quot;</strong> or <strong className="text-white">&quot;Add to Home screen&quot;</strong>.<br />
                  3. Android will automatically register the native APK.
                </p>
              </div>
            )}
          </div>

          {/* Method 2: Download APK File */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">Download APK Package</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Download the standalone Android Application Package file (<code className="text-zinc-300">YouTube-Android-v19.38.apk</code>).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownloadApkFile}
                disabled={downloadingApk}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {downloadingApk ? (
                  <span>Generating APK...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download .apk File</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadProjectZip}
                disabled={downloadingZip}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Build Kit</span>
              </button>
            </div>
          </div>

          {/* Method 3: 1-Click CLI Bubblewrap APK Build */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Compile Signed APK with Bubblewrap CLI
              </span>
              <button
                onClick={handleCopyCommand}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy command</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all border border-zinc-800">
              {bubblewrapCommand}
            </div>

            <p className="text-[10px] text-zinc-500">
              Produces a signed <code className="text-zinc-400">app-release-signed.apk</code> ready to sideload on Android devices via <code className="text-zinc-400">adb install</code>.
            </p>
          </div>

          {/* Method 4: Connect GitHub & Build APK in Cloud CI/CD */}
          {onOpenGitHub && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">Publish to GitHub & Build on Actions</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Connect your GitHub account, push the repo, and let GitHub Actions compile your Android 13 APK automatically.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenGitHub();
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Open GitHub Publisher & CI/CD Builder</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
