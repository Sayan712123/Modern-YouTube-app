import React, { useState } from 'react';
import { MoreVertical, CheckCircle2, Flame, Bookmark, Clock, Share2, Download, ThumbsDown, Sparkles } from 'lucide-react';
import { Video, Short } from '../types/youtube';
import { TOPIC_CHIPS } from '../data/mockData';

interface HomeFeedProps {
  videos: Video[];
  shorts: Short[];
  onSelectVideo: (video: Video) => void;
  onSelectShort: (short: Short) => void;
  onSaveToWatchLater: (video: Video) => void;
  onDownloadVideo: (video: Video) => void;
  onShareVideo: (video: Video) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  videos,
  shorts,
  onSelectVideo,
  onSelectShort,
  onSaveToWatchLater,
  onDownloadVideo,
  onShareVideo,
}) => {
  const [selectedChip, setSelectedChip] = useState<string>('All');
  const [activeMenuVideo, setActiveMenuVideo] = useState<Video | null>(null);

  const filteredVideos = videos.filter((vid) => {
    if (selectedChip === 'All') return true;
    if (selectedChip === 'Tech' && vid.category === 'Tech') return true;
    if (selectedChip === 'Gaming' && vid.category === 'Gaming') return true;
    if (selectedChip === 'Documentary' && vid.category === 'Documentary') return true;
    if (selectedChip === 'Music' && vid.category === 'Music') return true;
    return vid.title.toLowerCase().includes(selectedChip.toLowerCase()) || 
           vid.category.toLowerCase().includes(selectedChip.toLowerCase());
  });

  return (
    <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-16 bg-[#0f0f0f] relative">
      {/* Horizontal Topic Filter Chips (Android YouTube Style) */}
      <div className="sticky top-0 z-20 bg-[#0f0f0f]/95 backdrop-blur-md px-3 py-2 border-b border-zinc-800/40">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Explore / Compass Quick Button */}
          <button 
            onClick={() => setSelectedChip('All')}
            className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white shrink-0 text-xs font-medium"
            title="Explore"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-red-500" />
            <span>Trending</span>
          </button>

          {/* Divider line */}
          <div className="w-[1px] h-6 bg-zinc-800 shrink-0 mx-1"></div>

          {TOPIC_CHIPS.map((chip) => {
            const isActive = selectedChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Video Feed */}
      <div className="flex flex-col divide-y divide-zinc-900">
        {filteredVideos.map((video, index) => (
          <React.Fragment key={video.id}>
            {/* Standard YouTube Video Card */}
            <article className="w-full pb-5">
              {/* Thumbnail Container */}
              <div
                onClick={() => onSelectVideo(video)}
                className="relative w-full aspect-video bg-zinc-900 cursor-pointer overflow-hidden group"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to dark styled canvas
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/85 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wider">
                  {video.duration}
                </div>
              </div>

              {/* Video Meta Info Row */}
              <div className="flex items-start gap-3 px-3.5 pt-3">
                {/* Channel Avatar */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 cursor-pointer ring-1 ring-zinc-700/50 mt-0.5"
                >
                  <img
                    src={video.channel.avatar}
                    alt={video.channel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectVideo(video)}>
                  <h2 className="text-sm font-medium text-white line-clamp-2 leading-snug tracking-tight">
                    {video.title}
                  </h2>
                  <div className="flex items-center flex-wrap gap-1 text-[11px] text-zinc-400 mt-1">
                    <span className="font-normal text-zinc-300 truncate max-w-[140px]">
                      {video.channel.name}
                    </span>
                    {video.channel.isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-zinc-400 fill-zinc-400 shrink-0 inline" />
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{video.views}</span>
                    <span aria-hidden="true">·</span>
                    <span>{video.uploadedAt}</span>
                  </div>
                </div>

                {/* 3-Dots Action Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuVideo(video);
                  }}
                  className="min-h-[44px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-white"
                  aria-label="More video options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Embed Shorts Shelf after the 1st video */}
            {index === 0 && shorts.length > 0 && (
              <div className="py-4 my-2 border-y border-zinc-800/60 bg-zinc-950/40">
                <div className="flex items-center gap-2 px-3.5 mb-3">
                  <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                  <span className="font-bold text-sm tracking-tight text-white">Shorts</span>
                </div>

                {/* Horizontal Scrollable Shorts Cards */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-3.5">
                  {shorts.map((short) => (
                    <div
                      key={short.id}
                      onClick={() => onSelectShort(short)}
                      className="w-36 h-60 shrink-0 rounded-xl overflow-hidden relative bg-zinc-900 cursor-pointer group shadow-md"
                    >
                      <img
                        src={short.thumbnail}
                        alt={short.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                        <p className="text-xs font-semibold text-white line-clamp-2 leading-tight drop-shadow">
                          {short.title}
                        </p>
                        <span className="text-[10px] text-zinc-300 mt-1 tabular-nums">
                          {short.views} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {filteredVideos.length === 0 && (
          <div className="w-full py-16 px-4 text-center text-zinc-400">
            <p className="text-sm">No videos found for &quot;{selectedChip}&quot;</p>
            <button
              onClick={() => setSelectedChip('All')}
              className="mt-3 px-4 py-1.5 rounded-lg bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* Android Video Options Bottom Sheet Modal */}
      {activeMenuVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setActiveMenuVideo(null)}
        >
          <div
            className="w-full bg-[#1e1e1e] rounded-t-3xl p-4 flex flex-col gap-2 max-w-lg mx-auto border-t border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-2"></div>

            <div className="pb-2 border-b border-zinc-800 px-2">
              <p className="text-xs text-zinc-400 truncate">{activeMenuVideo.title}</p>
            </div>

            <button
              onClick={() => {
                onSaveToWatchLater(activeMenuVideo);
                setActiveMenuVideo(null);
              }}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-zinc-800 text-left"
            >
              <Clock className="w-5 h-5 text-zinc-400" />
              <span>Save to Watch later</span>
            </button>

            <button
              onClick={() => {
                onDownloadVideo(activeMenuVideo);
                setActiveMenuVideo(null);
              }}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-zinc-800 text-left"
            >
              <Download className="w-5 h-5 text-zinc-400" />
              <span>Download video (Offline)</span>
            </button>

            <button
              onClick={() => {
                onShareVideo(activeMenuVideo);
                setActiveMenuVideo(null);
              }}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-zinc-800 text-left"
            >
              <Share2 className="w-5 h-5 text-zinc-400" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setActiveMenuVideo(null)}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-zinc-800 text-left"
            >
              <ThumbsDown className="w-5 h-5 text-zinc-400" />
              <span>Not interested</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
