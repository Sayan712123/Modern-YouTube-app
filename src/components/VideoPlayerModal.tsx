import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Minimize, 
  Settings, 
  Subtitles, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Bookmark, 
  Scissors, 
  Bell, 
  Check, 
  X, 
  Send, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import { Video, Comment } from '../types/youtube';

interface VideoPlayerModalProps {
  video: Video;
  allVideos: Video[];
  onClose: () => void;
  onMinimize: () => void;
  onSelectRelatedVideo: (video: Video) => void;
  onToggleLike: (videoId: string) => void;
  onToggleDislike: (videoId: string) => void;
  onToggleSubscribe: (channelId: string) => void;
  onShare: (video: Video) => void;
  onDownload: (video: Video) => void;
  onAddComment: (videoId: string, text: string) => void;
  isSubscribed?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  allVideos,
  onClose,
  onMinimize,
  onSelectRelatedVideo,
  onToggleLike,
  onToggleDislike,
  onToggleSubscribe,
  onShare,
  onDownload,
  onAddComment,
  isSubscribed = false,
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(34); // starts at 34s
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [quality, setQuality] = useState<string>('1080p60');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(false);
  const [ambientMode, setAmbientMode] = useState<boolean>(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentsSort, setCommentsSort] = useState<'top' | 'newest'>('top');
  const [bellState, setBellState] = useState<'all' | 'personalized' | 'none'>('all');
  const [showBellMenu, setShowBellMenu] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(video.isDownloaded ? 100 : 0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback timer simulator
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= video.durationSeconds) {
            setIsPlaying(false);
            return video.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, video.durationSeconds]);

  // Hide HUD controls after 3 seconds of inactivity
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, isPlaying]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newSeconds: number) => {
    setCurrentTime(Math.min(Math.max(0, newSeconds), video.durationSeconds));
  };

  const handleDownloadClick = () => {
    if (video.isDownloaded || downloadProgress === 100) return;
    setIsDownloading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setDownloadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        onDownload(video);
      }
    }, 400);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(video.id, commentInput.trim());
    setCommentInput('');
  };

  const sortedComments = [...video.comments].sort((a, b) => {
    if (commentsSort === 'top') return b.likes - a.likes;
    return 0;
  });

  return (
    <div className="absolute inset-0 z-40 bg-[#0f0f0f] flex flex-col overflow-y-auto no-scrollbar">
      {/* Ambient Lighting Background Effect */}
      {ambientMode && (
        <div 
          className="absolute top-0 left-0 right-0 h-96 opacity-30 blur-3xl pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.45), rgba(30, 58, 138, 0.25), transparent 70%)`
          }}
        />
      )}

      {/* Video Viewport Container (Sticky top) */}
      <div 
        className="sticky top-0 z-30 w-full aspect-video bg-black relative select-none group"
        onClick={() => setShowControls((prev) => !prev)}
      >
        {/* Video Thumbnail Background */}
        <img
          src={video.thumbnail}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />

        {/* Ambient video subtle scanline effect */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

        {/* Captions Overlay Simulator */}
        {captionsEnabled && isPlaying && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded text-xs text-white tracking-wide font-sans text-center max-w-[85%] pointer-events-none">
            [Narrator]: &quot;{video.chapters?.[0]?.title || video.title.slice(0, 40)}...&quot;
          </div>
        )}

        {/* Video Controls Overlay HUD */}
        {showControls && (
          <div 
            className="absolute inset-0 bg-black/60 flex flex-col justify-between p-3 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar inside Player */}
            <div className="flex items-center justify-between text-white">
              {/* Minimize to Android Mini-Player Button */}
              <button
                onClick={onMinimize}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/10 rounded-full"
                title="Minimize player"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-1">
                {/* Ambient Mode Toggle */}
                <button
                  onClick={() => setAmbientMode(!ambientMode)}
                  className={`p-2 rounded-full ${ambientMode ? 'text-red-400 bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                  title="Ambient glow mode"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                {/* Closed Captions CC */}
                <button
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  className={`p-2 rounded-full font-bold text-xs ${
                    captionsEnabled ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'
                  }`}
                  title="Captions"
                >
                  <Subtitles className="w-4 h-4" />
                </button>

                {/* Quality & Speed Settings Cog */}
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="p-2 rounded-full text-zinc-300 hover:text-white relative"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Playback Action Controls */}
            <div className="flex items-center justify-center gap-8 text-white">
              {/* Rewind 10s */}
              <button
                onClick={() => handleSeek(currentTime - 10)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full hover:bg-white/20 active:scale-90 transition-transform"
                title="-10 seconds"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
              </button>

              {/* Fast Forward 10s */}
              <button
                onClick={() => handleSeek(currentTime + 10)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full hover:bg-white/20 active:scale-90 transition-transform"
                title="+10 seconds"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Timeline Scrubber & Timestamp */}
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-300 px-0.5">
                <span className="tabular-nums font-mono">
                  {formatSeconds(currentTime)} / {video.duration}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold">
                  {quality}
                </span>
              </div>

              {/* Scrubber Progress Slider */}
              <div className="relative w-full flex items-center py-1">
                <input
                  type="range"
                  min={0}
                  max={video.durationSeconds}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quality & Speed Drawer Menu */}
        {showQualityMenu && (
          <div 
            className="absolute inset-0 bg-black/90 z-40 p-4 flex flex-col justify-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-700">
              <span className="font-semibold text-sm">Video Preferences</span>
              <button onClick={() => setShowQualityMenu(false)} className="p-1">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Quality picker */}
            <div className="py-2.5">
              <p className="text-xs text-zinc-400 mb-1.5">Quality</p>
              <div className="flex flex-wrap gap-1.5">
                {['4K HDR', '1080p60', '720p', 'Auto'].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      quality === q ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed picker */}
            <div className="py-2.5">
              <p className="text-xs text-zinc-400 mb-1.5">Playback Speed</p>
              <div className="flex flex-wrap gap-1.5">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPlaybackSpeed(s);
                      setShowQualityMenu(false);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      playbackSpeed === s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Information & Engagement Area */}
      <div className="flex-1 px-4 py-3 bg-[#0f0f0f] relative z-10 flex flex-col gap-3">
        {/* Title */}
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight leading-snug">
            {video.title}
          </h1>

          {/* Views & Date info banner with expandable description */}
          <div 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 cursor-pointer hover:text-zinc-200"
          >
            <span className="tabular-nums">{video.views}</span>
            <span aria-hidden="true">·</span>
            <span>{video.uploadedAt}</span>
            <span className="text-zinc-300 font-medium ml-1">
              {isDescriptionExpanded ? '...less' : '...more'}
            </span>
          </div>

          {/* Expanded Description Box */}
          {isDescriptionExpanded && (
            <div className="mt-3 p-3 bg-zinc-900/90 rounded-xl text-xs text-zinc-300 whitespace-pre-line border border-zinc-800">
              <p>{video.description}</p>

              {/* Chapters List */}
              {video.chapters && video.chapters.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <p className="font-semibold text-white mb-2">Chapters ({video.chapters.length})</p>
                  <div className="flex flex-col gap-1.5">
                    {video.chapters.map((ch) => (
                      <button
                        key={ch.time}
                        onClick={() => handleSeek(ch.time)}
                        className="flex items-center gap-3 text-left py-1 hover:text-red-400 transition-colors"
                      >
                        <span className="font-mono text-red-500 font-semibold">{ch.timeDisplay}</span>
                        <span className="text-zinc-300">{ch.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Channel Row & Subscribe */}
        <div className="flex items-center justify-between py-2 border-y border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white">{video.channel.name}</span>
                {video.channel.isVerified && (
                  <CheckCircle2 className="w-3 h-3 text-zinc-400 fill-zinc-400 shrink-0" />
                )}
              </div>
              <span className="text-[11px] text-zinc-400 tabular-nums">
                {video.channel.subscribers} subscribers
              </span>
            </div>
          </div>

          {/* Subscribe & Notification Bell Button */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => onToggleSubscribe(video.channel.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isSubscribed
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>

            {isSubscribed && (
              <button
                onClick={() => setShowBellMenu(!showBellMenu)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300"
                title="Notification options"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}

            {/* Bell Options Menu */}
            {showBellMenu && (
              <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-700 rounded-xl p-1 z-30 shadow-xl w-36 text-xs text-zinc-200">
                <button
                  onClick={() => {
                    setBellState('all');
                    setShowBellMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    bellState === 'all' ? 'bg-zinc-800 font-semibold text-white' : ''
                  }`}
                >
                  <span>All</span>
                  {bellState === 'all' && <Check className="w-3.5 h-3.5 text-red-500" />}
                </button>
                <button
                  onClick={() => {
                    setBellState('personalized');
                    setShowBellMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    bellState === 'personalized' ? 'bg-zinc-800 font-semibold text-white' : ''
                  }`}
                >
                  <span>Personalized</span>
                  {bellState === 'personalized' && <Check className="w-3.5 h-3.5 text-red-500" />}
                </button>
                <button
                  onClick={() => {
                    setBellState('none');
                    setShowBellMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    bellState === 'none' ? 'bg-zinc-800 font-semibold text-white' : ''
                  }`}
                >
                  <span>None</span>
                  {bellState === 'none' && <Check className="w-3.5 h-3.5 text-red-500" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Pills Bar (Like, Dislike, Share, Remix, Download, Save) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Like & Dislike Segmented Pill */}
          <div className="flex items-center bg-zinc-800/90 rounded-full shrink-0">
            <button
              onClick={() => onToggleLike(video.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-xs font-medium hover:bg-zinc-700 transition-colors ${
                video.isLiked ? 'text-red-500 font-semibold' : 'text-zinc-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-red-500' : ''}`} />
              <span className="tabular-nums">
                {video.isLiked ? `${video.likeCountNum + 1}` : video.likes}
              </span>
            </button>
            <div className="w-[1px] h-4 bg-zinc-700"></div>
            <button
              onClick={() => onToggleDislike(video.id)}
              className={`px-2.5 py-1.5 rounded-r-full text-xs hover:bg-zinc-700 transition-colors ${
                video.isDisliked ? 'text-zinc-400' : 'text-zinc-300'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${video.isDisliked ? 'fill-zinc-400' : ''}`} />
            </button>
          </div>

          {/* Share */}
          <button
            onClick={() => onShare(video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-xs font-medium text-zinc-200 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Download (Offline) */}
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              video.isDownloaded || downloadProgress === 100
                ? 'bg-zinc-700 text-red-400'
                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isDownloading
                ? `Downloading (${downloadProgress}%)`
                : video.isDownloaded || downloadProgress === 100
                ? 'Downloaded'
                : 'Download'}
            </span>
          </button>

          {/* Remix */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-xs font-medium text-zinc-200 shrink-0">
            <Scissors className="w-3.5 h-3.5" />
            <span>Remix</span>
          </button>

          {/* Save / Bookmark */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-xs font-medium text-zinc-200 shrink-0">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        {/* Comments Preview Container (Tappable to expand drawer) */}
        <div
          onClick={() => setShowCommentsDrawer(true)}
          className="bg-zinc-900/80 hover:bg-zinc-900 p-3 rounded-2xl cursor-pointer border border-zinc-800/60 transition-colors"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Comments</span>
              <span className="text-zinc-400 tabular-nums">{video.commentCount}</span>
            </div>
            <span className="text-[11px] text-zinc-400">Tap to view</span>
          </div>

          {/* Top comment teaser */}
          {video.comments.length > 0 && (
            <div className="flex items-start gap-2.5">
              <img
                src={video.comments[0].authorAvatar}
                alt={video.comments[0].authorName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
              />
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {video.comments[0].content}
              </p>
            </div>
          )}
        </div>

        {/* Up Next / Recommended List */}
        <div className="mt-2 pb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Up next</p>
          <div className="flex flex-col gap-3">
            {allVideos
              .filter((v) => v.id !== video.id)
              .map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectRelatedVideo(rec)}
                  className="flex gap-3 cursor-pointer group"
                >
                  <div className="relative w-36 aspect-video bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/85 text-white font-mono text-[10px] px-1 rounded">
                      {rec.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 truncate">{rec.channel.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 tabular-nums">
                      <span>{rec.views}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Full Comments Drawer (Slide Up) */}
      {showCommentsDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowCommentsDrawer(false)}
        >
          <div
            className="w-full h-[75%] bg-[#1a1a1a] rounded-t-3xl flex flex-col border-t border-zinc-700 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-white">Comments</span>
                <span className="text-xs text-zinc-400 tabular-nums">{video.commentCount}</span>

                <button
                  onClick={() => setCommentsSort(commentsSort === 'top' ? 'newest' : 'top')}
                  className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 ml-2"
                >
                  Sort: {commentsSort === 'top' ? 'Top' : 'Newest'}
                </button>
              </div>

              <button
                onClick={() => setShowCommentsDrawer(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 text-xs">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{comment.authorName}</span>
                      <span className="text-[10px] text-zinc-500">{comment.timestamp}</span>
                      {comment.isPinned && (
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{comment.content}</p>

                    {/* Likes & Creator Heart */}
                    <div className="flex items-center gap-4 text-zinc-400 mt-2 text-[11px]">
                      <button className="flex items-center gap-1 hover:text-white">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="tabular-nums">{comment.likes}</span>
                      </button>
                      <button className="hover:text-white">
                        <ThumbsDown className="w-3 h-3" />
                      </button>

                      {comment.isCreatorHearted && (
                        <span className="flex items-center gap-1 text-red-500 text-[10px]">
                          <Heart className="w-3 h-3 fill-red-500" />
                          <span>Hearted by creator</span>
                        </span>
                      )}

                      {comment.replyCount && comment.replyCount > 0 ? (
                        <span className="text-blue-400 font-medium">
                          {comment.replyCount} replies
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input Footer */}
            <form
              onSubmit={handlePostComment}
              className="p-3 border-t border-zinc-800 bg-[#141414] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Add a public comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="min-h-[40px] min-w-[40px] rounded-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white flex items-center justify-center transition-colors"
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
