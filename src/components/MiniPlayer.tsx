import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Video } from '../types/youtube';

interface MiniPlayerProps {
  video: Video;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
}) => {
  return (
    <div 
      onClick={onExpand}
      className="absolute bottom-14 left-0 right-0 z-30 bg-[#212121] border-b border-zinc-800 shadow-2xl flex items-center justify-between px-3 py-2 cursor-pointer transition-all duration-200 select-none"
    >
      {/* Thumbnail + Video Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-16 h-10 rounded-md overflow-hidden bg-black shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-medium text-white truncate">{video.title}</h4>
          <p className="text-[11px] text-zinc-400 truncate">{video.channel.name}</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-white hover:text-zinc-300"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white"
          title="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Subtle Mini-Player Scrub Progress Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-700">
        <div className="h-full bg-red-600 w-1/3"></div>
      </div>
    </div>
  );
};
