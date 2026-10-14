import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, MoreVertical, Bookmark, Trash2, KeyRound, History, Clock, Loader2, RefreshCw } from 'lucide-react';
import {
  YTVideo, YTChannel, trending, search, shorts as loadShorts, uploads, getKey, setKey, useChannelThumbs, useLocal,
} from '../services/ytApi';

// ---------- Small shared pieces ----------
export const Spinner: React.FC = () => (
  <div className="w-full flex justify-center py-8 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
);

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void; onKey?: () => void }> = ({ message, onRetry, onKey }) => (
  <div className="m-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300">
    <p className="font-semibold text-white mb-1">Couldn't load videos</p>
    <p className="text-zinc-400 break-words">{message}</p>
    <div className="flex gap-2 mt-3">
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1.5 rounded-full bg-white text-zinc-900 text-xs font-semibold flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      )}
      {onKey && (
        <button onClick={onKey} className="px-3 py-1.5 rounded-full bg-zinc-800 text-white text-xs font-semibold">Change API key</button>
      )}
    </div>
  </div>
);

interface CardProps {
  video: YTVideo;
  channel?: YTChannel;
  saved: boolean;
  onOpen: (v: YTVideo) => void;
  onToggleSave: (v: YTVideo) => void;
}

export const VideoCard: React.FC<CardProps> = ({ video, channel, saved, onOpen, onToggleSave }) => {
  const [menu, setMenu] = useState(false);
  return (
    <article className="w-full pb-4 relative">
      <button onClick={() => onOpen(video)} className="block w-full relative aspect-video bg-zinc-900">
        {video.thumb && <img src={video.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">{video.duration}</span>
        )}
      </button>
      <div className="flex gap-3 px-3 pt-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden shrink-0">
          {channel?.thumb && <img src={channel.thumb} alt="" className="w-full h-full object-cover" />}
        </div>
        <button onClick={() => onOpen(video)} className="flex-1 min-w-0 text-left">
          <h3 className="text-[15px] leading-5 font-medium text-white line-clamp-2">{video.title}</h3>
          <p className="text-xs text-zinc-400 mt-1 truncate">
            {[video.channelTitle, video.views, video.ago].filter(Boolean).join(' · ')}
          </p>
        </button>
        <button onClick={() => setMenu((m) => !m)} className="w-8 h-8 -mr-1 flex items-center justify-center text-zinc-300 shrink-0" aria-label="More">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      {menu && (
        <div className="absolute right-3 top-[calc(56.25vw+2.5rem)] z-10 bg-zinc-800 rounded-xl shadow-xl py-1 min-w-[190px]">
          <button
            onClick={() => { onToggleSave(video); setMenu(false); }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white text-left"
          >
            <Clock className="w-4 h-4" /> {saved ? 'Remove from Watch later' : 'Save to Watch later'}
          </button>
        </div>
      )}
    </article>
  );
};

// ---------- Home feed ----------
const CHIPS: { label: string; cat?: string }[] = [
  { label: 'All' },
  { label: 'Music', cat: '10' },
  { label: 'Gaming', cat: '20' },
  { label: 'Sports', cat: '17' },
  { label: 'Entertainment', cat: '24' },
  { label: 'Comedy', cat: '23' },
  { label: 'Tech', cat: '28' },
  { label: 'News', cat: '25' },
  { label: 'Education', cat: '27' },
];

interface FeedProps {
  savedIds: string[];
  onOpen: (v: YTVideo) => void;
  onToggleSave: (v: YTVideo) => void;
  onFeedLoaded: (v: YTVideo[]) => void;
  onChangeKey: () => void;
}

export const FeedScreen: React.FC<FeedProps> = ({ savedIds, onOpen, onToggleSave, onFeedLoaded, onChangeKey }) => {
  const [chip, setChip] = useState(0);
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState('');
  const thumbs = useChannelThumbs(videos);

  const load = async (idx: number) => {
    setLoading(true); setError('');
    try {
      const r = await trending(CHIPS[idx].cat);
      setVideos(r.items); setNext(r.next);
      if (idx === 0) onFeedLoaded(r.items);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(chip); /* eslint-disable-next-line */ }, [chip]);

  const loadMore = async () => {
    if (!next) return;
    setMore(true);
    try {
      const r = await trending(CHIPS[chip].cat, next);
      setVideos((p) => [...p, ...r.items]); setNext(r.next);
    } catch { /* ignore */ } finally { setMore(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0f0f0f]">
      <div className="sticky top-0 z-20 bg-[#0f0f0f]/95 backdrop-blur-md px-3 py-2 border-b border-zinc-800/40">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CHIPS.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setChip(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
                i === chip ? 'bg-white text-zinc-950 font-semibold' : 'bg-zinc-800/90 text-zinc-200'
              }`}
            >{c.label}</button>
          ))}
        </div>
      </div>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={() => load(chip)} onKey={onChangeKey} />}
      {!loading && !error && videos.length === 0 && (
        <p className="text-center text-zinc-500 text-sm py-10">No videos available for this category in your region.</p>
      )}
      <div className="flex flex-col">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} channel={thumbs[v.channelId]} saved={savedIds.includes(v.id)} onOpen={onOpen} onToggleSave={onToggleSave} />
        ))}
      </div>
      {!loading && next && (
        <div className="p-4 flex justify-center">
          <button onClick={loadMore} disabled={more} className="px-5 py-2 rounded-full bg-zinc-800 text-white text-sm font-medium">
            {more ? 'Loading…' : 'Show more'}
          </button>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
};

// ---------- Search ----------
interface SearchProps {
  savedIds: string[];
  onClose: () => void;
  onOpen: (v: YTVideo) => void;
  onToggleSave: (v: YTVideo) => void;
}

export const SearchScreen: React.FC<SearchProps> = ({ savedIds, onClose, onOpen, onToggleSave }) => {
  const [q, setQ] = useState('');
  const [active, setActive] = useState('');
  const [results, setResults] = useState<YTVideo[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useLocal<string[]>('yt_recent_searches', []);
  const thumbs = useChannelThumbs(results);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const run = async (term: string) => {
    const t = term.trim();
    if (!t) return;
    setQ(t); setActive(t); setLoading(true); setError(''); setResults([]);
    setRecent((p) => [t, ...p.filter((x) => x !== t)].slice(0, 12));
    try {
      const r = await search(t);
      setResults(r.items); setNext(r.next);
    } catch (e: any) { setError(e?.message || 'Search failed'); }
    finally { setLoading(false); }
  };

  const more = async () => {
    if (!next) return;
    try {
      const r = await search(active, next);
      setResults((p) => [...p, ...r.items]); setNext(r.next);
    } catch { /* ignore */ }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="h-14 px-2 flex items-center gap-1 border-b border-zinc-800/60 shrink-0">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white" aria-label="Back"><ArrowLeft className="w-5 h-5" /></button>
        <form className="flex-1" onSubmit={(e) => { e.preventDefault(); run(q); }}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search YouTube"
            enterKeyHint="search"
            className="w-full h-10 rounded-full bg-zinc-800 px-4 text-sm text-white placeholder-zinc-400 outline-none"
          />
        </form>
        {q && (
          <button onClick={() => { setQ(''); inputRef.current?.focus(); }} className="w-10 h-10 flex items-center justify-center text-zinc-300" aria-label="Clear"><X className="w-5 h-5" /></button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {!active && (
          <div className="py-2">
            {recent.map((r) => (
              <div key={r} className="flex items-center px-3">
                <button onClick={() => run(r)} className="flex-1 flex items-center gap-4 py-3 text-left text-white text-sm">
                  <History className="w-5 h-5 text-zinc-400" /> <span className="truncate">{r}</span>
                </button>
                <button onClick={() => setRecent((p) => p.filter((x) => x !== r))} className="p-2 text-zinc-500" aria-label="Remove"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {recent.length === 0 && <p className="text-center text-zinc-500 text-sm py-10">Search for videos, music, channels…</p>}
          </div>
        )}
        {loading && <Spinner />}
        {error && <ErrorBox message={error} onRetry={() => run(active)} />}
        <div className="flex flex-col">
          {results.map((v) => (
            <VideoCard key={v.id} video={v} channel={thumbs[v.channelId]} saved={savedIds.includes(v.id)} onOpen={onOpen} onToggleSave={onToggleSave} />
          ))}
        </div>
        {next && !loading && (
          <div className="p-4 flex justify-center">
            <button onClick={more} className="px-5 py-2 rounded-full bg-zinc-800 text-white text-sm font-medium">Show more</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Shorts ----------
export const ShortsScreen: React.FC = () => {
  const [items, setItems] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await loadShorts()); } catch (e: any) { setError(e?.message || 'Failed to load Shorts'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx) setIdx(i);
  };

  if (loading) return <div className="flex-1 bg-black flex items-center justify-center"><Spinner /></div>;
  if (error) return <div className="flex-1 bg-black"><ErrorBox message={error} onRetry={load} /></div>;

  return (
    <div ref={boxRef} onScroll={onScroll} className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {items.map((v, i) => (
        <section key={v.id} className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black" style={{ minHeight: '100%' }}>
          {Math.abs(i - idx) <= 0 ? (
            <iframe
              key={v.id + idx}
              title={v.title}
              className="w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&loop=1&playlist=${v.id}&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            v.thumb && <img src={v.thumb} alt="" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute left-3 right-3 bottom-3 pointer-events-none">
            <p className="text-white text-sm font-semibold drop-shadow line-clamp-2">{v.title}</p>
            <p className="text-zinc-200 text-xs drop-shadow mt-0.5">{v.channelTitle}</p>
          </div>
        </section>
      ))}
      {items.length === 0 && <p className="text-center text-zinc-500 text-sm py-10">No Shorts found.</p>}
    </div>
  );
};

// ---------- Subscriptions ----------
interface SubsProps {
  subs: YTChannel[];
  savedIds: string[];
  onOpen: (v: YTVideo) => void;
  onToggleSave: (v: YTVideo) => void;
  onGoHome: () => void;
}

export const SubsScreen: React.FC<SubsProps> = ({ subs, savedIds, onOpen, onToggleSave, onGoHome }) => {
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const thumbs = useChannelThumbs(videos);
  const sig = subs.map((s) => s.id).join(',');

  useEffect(() => {
    if (!subs.length) { setVideos([]); return; }
    let alive = true;
    setLoading(true); setError('');
    uploads(subs.map((s) => s.id))
      .then((v) => alive && setVideos(v))
      .catch((e) => alive && setError(e?.message || 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [sig]);

  if (!subs.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#0f0f0f]">
        <p className="text-white font-semibold">Don't miss new videos</p>
        <p className="text-zinc-400 text-sm mt-2">Open any video and tap Subscribe. New uploads from your channels will show up here.</p>
        <button onClick={onGoHome} className="mt-5 px-5 py-2 rounded-full bg-white text-zinc-900 text-sm font-semibold">Browse videos</button>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0f0f0f]">
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-3 py-3 border-b border-zinc-800/40">
        {subs.map((c) => (
          <div key={c.id} className="flex flex-col items-center w-16 shrink-0">
            <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden">{c.thumb && <img src={c.thumb} alt="" className="w-full h-full object-cover" />}</div>
            <span className="text-[11px] text-zinc-300 mt-1 w-full text-center truncate">{c.title}</span>
          </div>
        ))}
      </div>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} />}
      <div className="flex flex-col pt-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} channel={thumbs[v.channelId]} saved={savedIds.includes(v.id)} onOpen={onOpen} onToggleSave={onToggleSave} />
        ))}
      </div>
    </div>
  );
};

// ---------- You / Library ----------
interface LibProps {
  history: YTVideo[];
  saved: YTVideo[];
  liked: YTVideo[];
  onOpen: (v: YTVideo) => void;
  onClearHistory: () => void;
  onRemoveSaved: (v: YTVideo) => void;
  onChangeKey: () => void;
}

const Row: React.FC<{ v: YTVideo; onOpen: (v: YTVideo) => void; onRemove?: () => void }> = ({ v, onOpen, onRemove }) => (
  <div className="flex gap-3 px-3 py-2 items-start">
    <button onClick={() => onOpen(v)} className="relative w-40 aspect-video bg-zinc-900 rounded-lg overflow-hidden shrink-0">
      {v.thumb && <img src={v.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
      {v.duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 rounded">{v.duration}</span>}
    </button>
    <button onClick={() => onOpen(v)} className="flex-1 min-w-0 text-left">
      <p className="text-sm text-white font-medium line-clamp-2">{v.title}</p>
      <p className="text-xs text-zinc-400 mt-1 truncate">{v.channelTitle}</p>
    </button>
    {onRemove && <button onClick={onRemove} className="p-2 text-zinc-400" aria-label="Remove"><X className="w-4 h-4" /></button>}
  </div>
);

export const LibraryScreen: React.FC<LibProps> = ({ history, saved, liked, onOpen, onClearHistory, onRemoveSaved, onChangeKey }) => (
  <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0f0f0f] pb-6">
    <div className="flex items-center gap-4 px-4 py-5">
      <div className="w-16 h-16 rounded-full bg-red-900 flex items-center justify-center text-2xl font-bold text-white">Y</div>
      <div>
        <p className="text-white text-lg font-semibold">You</p>
        <p className="text-zinc-400 text-xs">History, saved and liked videos stay on this device</p>
      </div>
    </div>

    <div className="flex items-center justify-between px-4 pt-2 pb-1">
      <h2 className="text-white font-semibold text-base flex items-center gap-2"><History className="w-4 h-4" /> History</h2>
      {history.length > 0 && (
        <button onClick={onClearHistory} className="text-xs text-zinc-300 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      )}
    </div>
    {history.length === 0 && <p className="px-4 py-3 text-sm text-zinc-500">Videos you watch will appear here.</p>}
    {history.slice(0, 15).map((v) => <Row key={v.id} v={v} onOpen={onOpen} />)}

    <h2 className="text-white font-semibold text-base flex items-center gap-2 px-4 pt-5 pb-1"><Clock className="w-4 h-4" /> Watch later</h2>
    {saved.length === 0 && <p className="px-4 py-3 text-sm text-zinc-500">Use the ⋮ menu on a video to save it here.</p>}
    {saved.map((v) => <Row key={v.id} v={v} onOpen={onOpen} onRemove={() => onRemoveSaved(v)} />)}

    <h2 className="text-white font-semibold text-base flex items-center gap-2 px-4 pt-5 pb-1"><Bookmark className="w-4 h-4" /> Liked videos</h2>
    {liked.length === 0 && <p className="px-4 py-3 text-sm text-zinc-500">Videos you like will appear here.</p>}
    {liked.map((v) => <Row key={v.id} v={v} onOpen={onOpen} />)}

    <div className="px-4 pt-6">
      <button onClick={onChangeKey} className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm flex items-center justify-center gap-2">
        <KeyRound className="w-4 h-4" /> YouTube API key
      </button>
    </div>
  </div>
);

// ---------- API key screen ----------
export const KeyScreen: React.FC<{ onDone: () => void; onClose?: () => void }> = ({ onDone, onClose }) => {
  const [val, setVal] = useState(getKey());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    const k = val.trim();
    if (!k) { setErr('Paste your API key first.'); return; }
    setBusy(true); setErr('');
    const old = getKey();
    setKey(k);
    try {
      await trending(undefined);
      onDone();
    } catch (e: any) {
      setKey(old);
      setErr(e?.message || 'That key did not work.');
    } finally { setBusy(false); }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0f0f0f] overflow-y-auto">
      <div className="max-w-md mx-auto px-5 py-8">
        {onClose && (
          <button onClick={onClose} className="mb-4 w-10 h-10 -ml-2 flex items-center justify-center text-white" aria-label="Back"><ArrowLeft className="w-5 h-5" /></button>
        )}
        <div className="w-12 h-9 bg-red-600 rounded-xl flex items-center justify-center mb-4">
          <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-white ml-1" />
        </div>
        <h1 className="text-white text-xl font-semibold">Connect to YouTube</h1>
        <p className="text-zinc-400 text-sm mt-2">
          This app loads real videos with the free YouTube Data API. Paste your own API key below. It is stored only on this device.
        </p>
        <ol className="text-zinc-300 text-sm mt-4 space-y-1.5 list-decimal pl-5">
          <li>Open <span className="text-white">console.cloud.google.com</span> and create a project.</li>
          <li>Go to <span className="text-white">APIs &amp; Services → Library</span>, search "YouTube Data API v3" and tap Enable.</li>
          <li>Go to <span className="text-white">Credentials → Create credentials → API key</span> and copy it.</li>
        </ol>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="AIza…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full mt-5 h-12 rounded-xl bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none"
        />
        {err && <p className="text-red-400 text-xs mt-2 break-words">{err}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 h-12 rounded-full bg-white text-zinc-900 font-semibold text-sm">
          {busy ? 'Checking…' : 'Save and continue'}
        </button>
      </div>
    </div>
  );
};

