import React from 'react';
import { Cast, Bell, Search, EyeOff, User } from 'lucide-react';

interface TopBarProps {
  onOpenCast: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenApk?: () => void;
  unreadCount?: number;
  isIncognito?: boolean;
  isPremium?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCast,
  onOpenNotifications,
  onOpenSearch,
  onOpenProfile,
  onOpenApk,
  unreadCount = 2,
  isIncognito = false,
  isPremium = false,
}) => {
  return (
    <header className="w-full h-12 px-4 flex items-center justify-between bg-[#0f0f0f] border-b border-zinc-800/40 shrink-0 z-30 select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-1.5 cursor-pointer">
        {isIncognito ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
              <EyeOff className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">YouTube</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* YouTube Red Icon */}
            <div className="w-7 h-5 bg-red-600 rounded-[6px] flex items-center justify-center shadow-sm">
              <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6.5px] border-l-white ml-0.5"></div>
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-baseline">
              YouTube
              {isPremium && (
                <span className="text-[10px] uppercase font-semibold text-zinc-400 ml-1">Premium</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Action Zone: APK, Cast, Notifications, Search, Profile */}
      <div className="flex items-center gap-1">
        {onOpenApk && (
          <button
            onClick={onOpenApk}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold tracking-wider uppercase border border-zinc-700 active:scale-95 transition-transform mr-1"
            title="Download APK / Install"
          >
            APK
          </button>
        )}

        {/* Cast to TV */}
        <button
          onClick={onOpenCast}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform"
          aria-label="Cast to TV"
        >
          <Cast className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[16px] h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#0f0f0f]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Account & Settings"
        >
          {isIncognito ? (
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-zinc-700 bg-red-800 flex items-center justify-center text-white text-xs font-semibold">
              <User className="w-4 h-4 text-zinc-200" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
