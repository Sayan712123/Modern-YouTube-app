import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ThumbsUp, Share2, Clock, ExternalLink, Check } from 'lucide-react';
import { YTVideo, YTChannel, YTComment, channelInfo, comments as loadComments, useChannelThumbs } from '../services/ytApi';

interface WatchProps {
  video: YTVideo;
  upNext: YTVideo[];
  isSubscribed: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onClose: () => void;
  onOpen: (v: YTVideo) => void;
  onToggleSub: (c: YTChannel) => void;
  onToggleLike: (v: YTVideo) => void;
  onToggleSave: (v: YTVideo) => void;
}

export const Watch: React.FC<WatchProps> = ({
  video, upNext, isSubscribed, isLiked, isSaved, onClose, onOpen, onToggleSub, onToggleLike, onToggleSave,
}) => {
  const [channel, setChannel] = useState<YTChannel | null>(null);
  const [comments, setComments] = useState<YTComment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState('');
  const scroller = useRef<HTMLDivElement>(null);
  const thumbs = useChannelThumbs(upNext);
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  useEffect(() => {
    let alive = true;
    setChannel(null); setComments([]); setExpanded(false);
    scroller.current?.scrollTo({ top: 0 });
    channelInfo([video.channelId]).then((m) => alive && setChannel(m[video.channelId] || null));
    loadComments(video.id).then((c) => alive && setComments(c));
    return () => { alive = false; };
  }, [video.id, video.channelId]);

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };

  const share = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: video.title, url: watchUrl });
        return;
      }
    } catch { /* fall through to copy */ }
    try {
      await navigator.clipboard.writeText(watchUrl);
      flash('Link copied');
    } catch {
      window.open(watchUrl, '_blank');
    }
  };

  const chan: YTChannel = channel || { id: video.channelId, title: video.channelTitle, thumb: '' };

  return (
    <div className="absolute inset-0 z-30 bg-[#0f0f0f] flex flex-col">
      {/* Player */}
      <div className="w-full bg-black shrink-0 relative">
        <button onClick={onClose} className="absolute top-1 left-1 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Close player">
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="w-full aspect-video">
          <iframe
            key={video.id}
            title={video.title}
            className="w-full h-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto no-scrollbar">
        {/* Title + description */}
        <button onClick={() => setExpanded((e) => !e)} className="w-full text-left px-3 pt-3">
          <h1 className="text-white text-base font-semibold leading-snug">{video.title}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {[video.views, video.ago].filter(Boolean).join(' · ')} {!expanded && <span className="text-zinc-300 font-medium">…more</span>}
          </p>
        </button>
        {expanded && (
          <p className="px-3 pt-2 text-sm text-zinc-200 whitespace-pre-wrap break-words select-text">{video.description || 'No description.'}</p>
        )}

        {/* Channel row */}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0">
            {chan.thumb && <img src={chan.thumb} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-semibold truncate">{chan.title}</p>
            {chan.subs && <p className="text-xs text-zinc-400">{chan.subs}</p>}
          </div>
          <button
            onClick={() => onToggleSub(chan)}
            className={`px-4 h-9 rounded-full text-sm font-semibold ${isSubscribed ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-950'}`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto no-scrollbar">
          <button onClick={() => onToggleLike(video)} className={`h-9 px-4 rounded-full flex items-center gap-2 text-sm font-medium shrink-0 ${isLiked ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-white'}`}>
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {video.likes}
          </button>
          <button onClick={share} className="h-9 px-4 rounded-full bg-zinc-800 text-white flex items-center gap-2 text-sm font-medium shrink-0">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={() => onToggleSave(video)} className="h-9 px-4 rounded-full bg-zinc-800 text-white flex items-center gap-2 text-sm font-medium shrink-0">
            {isSaved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />} {isSaved ? 'Saved' : 'Save'}
          </button>
          <a href={watchUrl} target="_blank" rel="noreferrer" className="h-9 px-4 rounded-full bg-zinc-800 text-white flex items-center gap-2 text-sm font-medium shrink-0">
            <ExternalLink className="w-4 h-4" /> Open in YouTube
          </a>
        </div>

        {/* Comments */}
        <div className="mx-3 mb-3 rounded-xl bg-zinc-900 px-3 py-3">
          <p className="text-sm text-white font-semibold">Comments {video.commentCount && <span className="text-zinc-400 font-normal ml-1">{video.commentCount}</span>}</p>
          {comments.length === 0 && <p className="text-xs text-zinc-500 mt-2">No comments to show.</p>}
          <div className="mt-2 space-y-4">
            {comments.slice(0, 12).map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                  {c.avatar && <img src={c.avatar} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400">{c.author} · {c.ago}</p>
                  <p className="text-sm text-zinc-100 mt-0.5 whitespace-pre-wrap break-words select-text">{c.text}</p>
                  {c.likes && <p className="text-xs text-zinc-500 mt-1">👍 {c.likes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Up next */}
        <p className="px-3 pb-2 text-sm text-white font-semibold">Up next</p>
        {upNext.filter((v) => v.id !== video.id).slice(0, 15).map((v) => (
          <button key={v.id} onClick={() => onOpen(v)} className="w-full flex gap-3 px-3 py-2 text-left">
            <div className="relative w-40 aspect-video bg-zinc-900 rounded-lg overflow-hidden shrink-0">
              {v.thumb && <img src={v.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
              {v.duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 rounded">{v.duration}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium line-clamp-2">{v.title}</p>
              <p className="text-xs text-zinc-400 mt-1 truncate">{thumbs[v.channelId]?.title || v.channelTitle}</p>
              <p className="text-xs text-zinc-500 truncate">{[v.views, v.ago].filter(Boolean).join(' · ')}</p>
            </div>
          </button>
        ))}
        <div className="h-6" />
      </div>

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-900 text-sm font-medium px-4 py-2 rounded-full shadow-lg">{toast}</div>
      )}
    </div>
  );
};
