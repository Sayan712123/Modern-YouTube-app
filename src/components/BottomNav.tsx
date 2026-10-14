import React from 'react';
import { Home, Layers, Plus, User, Flame } from 'lucide-react';
import { NavTab } from '../types/youtube';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCreate: () => void;
  hasUnreadSubs?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenCreate,
  hasUnreadSubs = true,
}) => {
  return (
    <nav className="w-full h-14 bg-[#0f0f0f] border-t border-zinc-800/80 flex items-center justify-around px-2 shrink-0 z-40 select-none">
      {/* Home */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'home' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </button>

      {/* Shorts */}
      <button
        onClick={() => onTabChange('shorts')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'shorts' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {/* Custom YouTube Shorts S-icon */}
        <div className="relative">
          <Flame className={`w-5 h-5 ${currentTab === 'shorts' ? 'fill-red-600 text-red-600 stroke-[2.5px]' : 'stroke-2'}`} />
        </div>
        <span className="text-[10px] font-medium mt-1">Shorts</span>
      </button>

      {/* Create Button (+) */}
      <button
        onClick={onOpenCreate}
        className="flex-1 min-h-[44px] flex items-center justify-center"
        aria-label="Create post, Short or upload video"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-white active:scale-95 transition-all shadow-md">
          <Plus className="w-6 h-6 stroke-[2]" />
        </div>
      </button>

      {/* Subscriptions */}
      <button
        onClick={() => onTabChange('subscriptions')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
          currentTab === 'subscriptions' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative">
          <Layers className={`w-5 h-5 ${currentTab === 'subscriptions' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          {hasUnreadSubs && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0f0f0f]"></span>
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">Subscriptions</span>
      </button>

      {/* You */}
      <button
        onClick={() => onTabChange('you')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-colors ${
          currentTab === 'you' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center transition-all ${
          currentTab === 'you' ? 'ring-2 ring-white' : 'ring-1 ring-zinc-600'
        }`}>
          <div className="w-full h-full bg-red-900 flex items-center justify-center text-[10px] font-bold text-white">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
        <span className="text-[10px] font-medium mt-1">You</span>
      </button>
    </nav>
  );
};
