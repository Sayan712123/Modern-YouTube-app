import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Bluetooth, X, ChevronDown } from 'lucide-react';
import { Video } from '../types/youtube';

interface Android13MediaNotificationProps {
  video: Video | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  onOpenVideo: () => void;
}

export const Android13MediaNotification: React.FC<Android13MediaNotificationProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onClose,
  onOpenVideo,
}) => {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-start p-3 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-auto mt-6 bg-[#252528] rounded-[28px] overflow-hidden shadow-2xl border border-zinc-700/60 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Notification Header */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 bg-red-600 rounded-xs flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent border-l-[3.5px] border-l-white ml-0.5"></div>
            </div>
            <span className="font-semibold text-zinc-300">YouTube · Android 13 Media</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Output Switcher (Android 13 feature) */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
              <Bluetooth className="w-2.5 h-2.5 text-blue-400" />
              <span>Pixel Buds Pro</span>
            </div>

            <button onClick={onClose} className="p-0.5 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Card Main Area */}
        <div className="flex items-center gap-3.5 my-1 cursor-pointer" onClick={onOpenVideo}>
          {/* Album / Video Artwork */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black shrink-0 shadow-md ring-1 ring-white/10">
            <img
              src={video.thumbnail}
              alt={video.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
              {video.title}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{video.channel.name}</p>
          </div>
        </div>

        {/* Android 13 Signature Squiggly Playback Scrubber Wave */}
        <div className="py-2.5">
          <div className="relative w-full h-4 flex items-center">
            {/* Squiggly SVG path */}
            <svg
              className="w-full h-4 overflow-visible"
              viewBox="0 0 300 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Played portion: iconic Android 13 squiggly wave */}
              <path
                d="M 0 8 Q 15 2, 30 8 T 60 8 T 90 8 T 120 8 T 150 8"
                stroke="#FF4B4B"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                className={isPlaying ? "animate-pulse" : ""}
              />
              {/* Scrubber thumb circle */}
              <circle cx="150" cy="8" r="4.5" fill="#FFFFFF" />
              {/* Remaining flat track */}
              <line
                x1="154"
                y1="8"
                x2="300"
                y2="8"
                stroke="#555558"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
            <span>04:12</span>
            <span>{video.duration}</span>
          </div>
        </div>

        {/* Android 13 Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button className="p-2 text-zinc-400 hover:text-white">
            <SkipBack className="w-5 h-5 fill-zinc-400" />
          </button>

          {/* Large Material 3 Play/Pause Pill Button */}
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          <button className="p-2 text-zinc-400 hover:text-white">
            <SkipForward className="w-5 h-5 fill-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
