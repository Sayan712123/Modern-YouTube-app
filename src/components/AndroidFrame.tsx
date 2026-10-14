import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Sparkles, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  ArrowLeft, 
  Circle, 
  Square,
  Moon,
  Sun,
  EyeOff,
  Github
} from 'lucide-react';
import { DeviceMode, NavigationStyle } from '../types/youtube';

interface AndroidFrameProps {
  children: React.ReactNode;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  navStyle: NavigationStyle;
  setNavStyle: (style: NavigationStyle) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isIncognito: boolean;
  setIsIncognito: (incognito: boolean) => void;
  onOpenApkModal?: () => void;
  onOpenMediaNotification?: () => void;
  onOpenGitHubModal?: () => void;
  onSystemBack: () => void;
  onSystemHome: () => void;
  onSystemRecents: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  deviceMode,
  setDeviceMode,
  navStyle,
  setNavStyle,
  isDarkMode,
  setIsDarkMode,
  isIncognito,
  setIsIncognito,
  onOpenApkModal,
  onOpenMediaNotification,
  onOpenGitHubModal,
  onSystemBack,
  onSystemHome,
  onSystemRecents,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('10:09');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-200 text-zinc-900'
    } transition-colors duration-300`}>
      {/* Top Device Controls Toolbar */}
      <header className="w-full max-w-5xl py-2 px-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>YouTube Android 13 (API 33)</span>
          </div>

          {/* Direct APK Button */}
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title="Download Android 13 APK"
            >
              <span>Download APK (API 33)</span>
            </button>
          )}

          {/* Connect GitHub & Build APK Button */}
          {onOpenGitHubModal && (
            <button
              onClick={onOpenGitHubModal}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1.5 border border-zinc-700 shadow-sm active:scale-95 transition-all"
              title="Connect GitHub & Build APK via Actions"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Publish & Build APK</span>
            </button>
          )}

          {/* Android 13 Media Shade Quick Button */}
          {onOpenMediaNotification && (
            <button
              onClick={onOpenMediaNotification}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium px-2 py-1 rounded-md text-[11px] hidden sm:flex items-center gap-1 border border-zinc-700"
              title="Show Android 13 Media Player Notification"
            >
              <span>Android 13 Media Player</span>
            </button>
          )}

          {isIncognito && (
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <EyeOff className="w-3 h-3 text-zinc-400" />
              Incognito
            </span>
          )}
        </div>

        {/* Viewport & Hardware Switchers */}
        <div className="flex items-center gap-2">
          {/* Device Model Selector */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setDeviceMode('phone')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                deviceMode === 'phone' ? 'bg-red-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
              title="Google Pixel 7 Pro (Android 13 Flagship)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pixel 7 Pro</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                deviceMode === 'tablet' ? 'bg-red-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
              title="Pixel Tablet (Android 13 Large Screen)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('full')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                deviceMode === 'full' ? 'bg-red-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
              title="Full Window Responsive"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Responsive</span>
            </button>
          </div>

          {/* Navigation Bar Style Toggle */}
          <div className="hidden md:flex items-center bg-black/30 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setNavStyle('gestures')}
              className={`px-2 py-1 rounded-md transition-colors ${
                navStyle === 'gestures' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
              title="Gesture Navigation Bar"
            >
              Gestures
            </button>
            <button
              onClick={() => setNavStyle('buttons')}
              className={`px-2 py-1 rounded-md transition-colors ${
                navStyle === 'buttons' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
              title="3-Button Navigation"
            >
              3-Buttons
            </button>
          </div>

          {/* Incognito Toggle */}
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isIncognito 
                ? 'bg-zinc-800 border-zinc-600 text-white' 
                : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title={isIncognito ? "Turn off Incognito" : "Turn on Incognito"}
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Frame Canvas Area */}
      <main className="w-full flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {deviceMode === 'full' ? (
          // Full responsive window
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 relative">
            {children}
          </div>
        ) : (
          // Device Mockup Container (Phone or Tablet)
          <div
            className={`relative flex flex-col transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-black ring-1 ring-zinc-800 ${
              deviceMode === 'phone'
                ? 'w-[400px] h-[830px] max-h-[92vh] rounded-[48px] p-2.5'
                : 'w-[880px] h-[640px] max-h-[92vh] rounded-[36px] p-3'
            }`}
          >
            {/* Outer Matte Titanium/Aluminum Phone Bezel */}
            <div className="w-full h-full bg-[#0f0f0f] rounded-[40px] flex flex-col overflow-hidden relative border border-zinc-800/80">
              
              {/* Android System Status Bar (Click to open Android 13 Notification Shade) */}
              <div 
                onClick={onOpenMediaNotification}
                className="w-full h-9 px-6 flex items-center justify-between text-xs font-medium text-white/90 shrink-0 z-50 select-none bg-black/40 backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors"
                title="Tap to pull down Android 13 notification shade & media player"
              >
                {/* Left: Clock & Notifications */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight">{currentTime}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <div className="w-3.5 h-3.5 bg-red-600 rounded flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[2.5px] border-t-transparent border-b-[2.5px] border-b-transparent border-l-[4px] border-l-white ml-0.5"></div>
                  </div>
                </div>

                {/* Center: Camera Punch-Hole Cutout (on phone) */}
                {deviceMode === 'phone' && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-black rounded-full ring-1 ring-zinc-800/60 flex items-center justify-center shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a1420] ring-1 ring-blue-900/40"></div>
                    </div>
                  </div>
                )}

                {/* Right: Network, 5G & Battery */}
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-400">5G</span>
                  <Wifi className="w-3.5 h-3.5 text-zinc-300" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-zinc-300">94%</span>
                    <BatteryMedium className="w-4 h-4 text-zinc-200" />
                  </div>
                </div>
              </div>

              {/* App Application Viewport */}
              <div className="flex-1 w-full overflow-hidden relative flex flex-col">
                {children}
              </div>

              {/* Android Bottom System Navigation Bar */}
              <div className="w-full h-6 shrink-0 bg-black flex items-center justify-center z-50 select-none">
                {navStyle === 'gestures' ? (
                  /* Android Gesture Pill */
                  <button 
                    onClick={onSystemHome}
                    className="w-32 h-1 bg-white/60 hover:bg-white rounded-full transition-all active:scale-95 cursor-pointer"
                    title="Android Gesture Bar (Tap for Home)"
                  />
                ) : (
                  /* Classic 3-Button Navigation (Back, Home, Recents) */
                  <div className="w-full flex items-center justify-around px-12 text-zinc-400">
                    <button 
                      onClick={onSystemBack}
                      className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
                      title="Back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={onSystemHome}
                      className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
                      title="Home"
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={onSystemRecents}
                      className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
                      title="Recent apps"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};
