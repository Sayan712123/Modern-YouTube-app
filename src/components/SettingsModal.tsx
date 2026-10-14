import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Moon, Shield, Smartphone, HardDrive, Wifi } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isIncognito: boolean;
  setIsIncognito: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isDarkMode,
  setIsDarkMode,
  isIncognito,
  setIsIncognito,
}) => {
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [downloadWifiOnly, setDownloadWifiOnly] = useState<boolean>(true);
  const [dataSaver, setDataSaver] = useState<boolean>(false);

  return (
    <div className="absolute inset-0 z-50 bg-[#0f0f0f] flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <div className="h-14 px-3 flex items-center gap-3 border-b border-zinc-800 bg-[#0f0f0f] sticky top-0 z-20">
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-base text-white">Settings</h2>
      </div>

      {/* Settings Sections */}
      <div className="p-4 flex flex-col gap-6 text-sm text-zinc-300">
        {/* General & Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            General
          </h3>
          <div className="bg-zinc-900 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden">
            {/* Dark Theme Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Dark theme</p>
                <p className="text-[11px] text-zinc-400">Reduce glare and improve night viewing</p>
              </div>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>

            {/* Incognito Mode Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Turn on Incognito</p>
                <p className="text-[11px] text-zinc-400">Activity won&apos;t be saved to account history</p>
              </div>
              <input
                type="checkbox"
                checked={isIncognito}
                onChange={(e) => setIsIncognito(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>

            {/* Autoplay Next Video */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Autoplay next video</p>
                <p className="text-[11px] text-zinc-400">When you finish a video, another plays</p>
              </div>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Video Quality Preferences */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Video Quality Preferences
          </h3>
          <div className="bg-zinc-900 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Data saver mode</p>
                <p className="text-[11px] text-zinc-400">Lower video resolution to conserve cellular data</p>
              </div>
              <input
                type="checkbox"
                checked={dataSaver}
                onChange={(e) => setDataSaver(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Video quality on Wi-Fi</p>
                <p className="text-[11px] text-zinc-400">Higher picture quality (Up to 4K HDR)</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </div>

        {/* Downloads & Storage */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Downloads & Storage
          </h3>
          <div className="bg-zinc-900 rounded-2xl divide-y divide-zinc-800/80 p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Download over Wi-Fi only</p>
                <p className="text-[11px] text-zinc-400">Only save videos when connected to Wi-Fi</p>
              </div>
              <input
                type="checkbox"
                checked={downloadWifiOnly}
                onChange={(e) => setDownloadWifiOnly(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Internal storage</span>
                <span className="tabular-nums">1.2 GB of 128 GB</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[12%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Android 13 Per-App Language (Signature Android 13 Feature) */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Android 13 System Settings
          </h3>
          <div className="bg-zinc-900 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">App language</p>
                <p className="text-[11px] text-zinc-400">Android 13 per-app language selection</p>
              </div>
              <select className="bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-200 px-2 py-1">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Notification Permission</p>
                <p className="text-[11px] text-zinc-400">Android 13 POST_NOTIFICATIONS</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                Granted
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-xs">Media Permissions</p>
                <p className="text-[11px] text-zinc-400">READ_MEDIA_VIDEO & AUDIO</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                Allowed
              </span>
            </div>
          </div>
        </div>

        {/* About App */}
        <div className="text-center py-4 text-xs text-zinc-500">
          <p className="font-semibold text-zinc-400">YouTube Android</p>
          <p>Version 19.38.35 · Targeted for Android 13</p>
          <p className="text-[11px] text-zinc-500">API Level 33 (Tiramisu) · Material You</p>
          <p className="mt-1 text-[10px]">Google LLC</p>
        </div>
      </div>
    </div>
  );
};
