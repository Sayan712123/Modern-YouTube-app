import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Music2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { Short, Channel } from '../types/youtube';

interface ShortsFeedProps {
  shorts: Short[];
  onToggleSubscribe: (channelId: string) => void;
  onShare: (short: Short) => void;
  subscribedChannelIds: string[];
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  shorts,
  onToggleSubscribe,
  onShare,
  subscribedChannelIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [localShorts, setLocalShorts] = useState<Short[]>(shorts);

  const currentShort = localShorts[currentIndex] || localShorts[0];

  const handleNext = () => {
    if (currentIndex < localShorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const toggleLike = (shortId: string) => {
    setLikedShorts((prev) => ({
      ...prev,
      [shortId]: !prev[shortId],
    }));
  };

  const isCurrentLiked = likedShorts[currentShort?.id] || currentShort?.isLiked;

  const handleAddShortComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentShort) return;

    const newComment = {
      id: `sc-user-${Date.now()}`,
      authorName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      content: commentInput.trim(),
      timestamp: 'Just now',
      likes: 1,
    };

    setLocalShorts((prev) =>
      prev.map((s) =>
        s.id === currentShort.id
          ? {
              ...s,
              comments: [newComment, ...s.comments],
            }
          : s
      )
    );
    setCommentInput('');
  };

  if (!currentShort) return null;

  const isSubscribed = subscribedChannelIds.includes(currentShort.channel.id);

  return (
    <div className="relative w-full h-full flex-1 bg-black overflow-hidden flex flex-col select-none">
      {/* Full-Bleed Short Image / Video Area */}
      <div 
        className="relative w-full h-full cursor-pointer flex items-center justify-center"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        <img
          src={currentShort.thumbnail}
          alt={currentShort.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />

        {/* Ambient Dark Gradient Scrim for readable text and controls */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none"></div>

        {/* Pause/Play Center Indicator */}
        {!isPlaying && (
          <div className="absolute w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        )}

        {/* Top Control Bar: Audio Mute Toggle & Nav controls */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-red-500 uppercase bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
              Shorts
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="min-h-[44px] min-w-[44px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Next / Previous Quick Buttons */}
        <div className="absolute right-3 top-20 flex flex-col gap-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60"
            title="Previous Short"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === localShorts.length - 1}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60"
            title="Next Short"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Right-Side Vertical Action Strip (Android YouTube Shorts style) */}
        <div 
          className="absolute right-3 bottom-14 flex flex-col items-center gap-4 text-white z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={() => toggleLike(currentShort.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-75 ${
              isCurrentLiked ? 'bg-red-600/90 text-white' : 'bg-black/40 text-white backdrop-blur-sm'
            }`}>
              <ThumbsUp className={`w-5 h-5 ${isCurrentLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-medium drop-shadow tabular-nums">
              {isCurrentLiked ? 'Liked' : currentShort.likes}
            </span>
          </button>

          {/* Dislike */}
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-75 transition-transform">
              <ThumbsDown className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium drop-shadow">Dislike</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-75 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium drop-shadow tabular-nums">
              {currentShort.commentsCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(currentShort)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-75 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium drop-shadow">Share</span>
          </button>

          {/* Spinning Vinyl Audio Badge */}
          <div className="mt-2 relative flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full border-2 border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}>
              <div className="w-3.5 h-3.5 rounded-full bg-red-600"></div>
            </div>
            <Music2 className="w-3.5 h-3.5 absolute text-white pointer-events-none" />
          </div>
        </div>

        {/* Bottom Metadata & Creator Section */}
        <div 
          className="absolute left-4 right-18 bottom-8 flex flex-col gap-2.5 text-white z-20 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Creator Tag & Subscribe Button */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-white/50">
              <img
                src={currentShort.channel.avatar}
                alt={currentShort.channel.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-semibold drop-shadow truncate max-w-[140px]">
              {currentShort.channel.name}
            </span>
            <button
              onClick={() => onToggleSubscribe(currentShort.channel.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isSubscribed
                  ? 'bg-zinc-800/90 text-zinc-200 border border-zinc-700'
                  : 'bg-red-600 text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Caption & Title */}
          <p className="text-xs text-zinc-100 font-medium line-clamp-2 leading-relaxed drop-shadow">
            {currentShort.title}
          </p>

          {/* Sound / Music Audio Pill */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 drop-shadow overflow-hidden">
            <Music2 className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate">{currentShort.soundTitle} · {currentShort.soundAuthor}</span>
          </div>
        </div>

        {/* Video Bottom Progress Bar Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-red-600 w-2/3 transition-all"></div>
        </div>
      </div>

      {/* Shorts Comments Bottom Drawer */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowComments(false)}
        >
          <div
            className="w-full h-[65%] bg-[#1a1a1a] rounded-t-3xl flex flex-col border-t border-zinc-700 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Comments</span>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {currentShort.comments.length}
                </span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3.5">
              {currentShort.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.authorAvatar}
                    alt={c.authorName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{c.authorName}</span>
                      <span className="text-[10px] text-zinc-500">{c.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{c.content}</p>
                    <div className="flex items-center gap-3 text-zinc-400 mt-1.5 text-[10px]">
                      <span className="tabular-nums">{c.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form
              onSubmit={handleAddShortComment}
              className="p-3 border-t border-zinc-800 bg-[#141414] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Add a comment on this Short..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="min-h-[40px] min-w-[40px] rounded-full bg-red-600 disabled:bg-zinc-800 text-white flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
