import React, { useEffect, useState } from 'react';
import { Home, Layers, Search, User, Flame } from 'lucide-react';
import { YTVideo, YTChannel, getKey, useLocal } from './services/ytApi';
import { FeedScreen, SearchScreen, ShortsScreen, SubsScreen, LibraryScreen, KeyScreen } from './components/Screens';
import { Watch } from './components/Watch';

type Tab = 'home' | 'shorts' | 'subs' | 'you';
type Overlay = 'search' | 'watch' | 'key';

export default function App() {
  const [hasKey, setHasKey] = useState<boolean>(!!getKey());
  const [tab, setTab] = useState<Tab>('home');
  const [stack, setStack] = useState<Overlay[]>([]);
  const [video, setVideo] = useState<YTVideo | null>(null);
  const [feed, setFeed] = useState<YTVideo[]>([]);

  const [history, setHistory] = useLocal<YTVideo[]>('yt_history', []);
  const [saved, setSaved] = useLocal<YTVideo[]>('yt_saved', []);
  const [liked, setLiked] = useLocal<YTVideo[]>('yt_liked', []);
  const [subs, setSubs] = useLocal<YTChannel[]>('yt_subs', []);

  // Android back button: close the top overlay (history-based)
  useEffect(() => {
    const onPop = () => setStack((s) => s.slice(0, -1));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openOverlay = (o: Overlay) => {
    window.history.pushState({ o }, '');
    setStack((s) => [...s, o]);
  };
  const closeTop = () => window.history.back();

  const openVideo = (v: YTVideo) => {
    setVideo(v);
    setHistory((h) => [v, ...h.filter((x) => x.id !== v.id)].slice(0, 50));
    if (!stack.includes('watch')) openOverlay('watch');
  };

  const toggleSave = (v: YTVideo) =>
    setSaved((s) => (s.some((x) => x.id === v.id) ? s.filter((x) => x.id !== v.id) : [v, ...s]));
  const toggleLike = (v: YTVideo) =>
    setLiked((s) => (s.some((x) => x.id === v.id) ? s.filter((x) => x.id !== v.id) : [v, ...s]));
  const toggleSub = (c: YTChannel) =>
    setSubs((s) => (s.some((x) => x.id === c.id) ? s.filter((x) => x.id !== c.id) : [c, ...s]));

  const savedIds = saved.map((v) => v.id);

  if (!hasKey) return <KeyScreen onDone={() => setHasKey(true)} />;

  const navBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 min-h-[44px] flex flex-col items-center justify-center ${tab === t ? 'text-white' : 'text-zinc-400'}`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#0f0f0f] overflow-hidden select-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tab !== 'shorts' && (
        <header className="w-full h-12 px-4 flex items-center justify-between bg-[#0f0f0f] border-b border-zinc-800/40 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-5 bg-red-600 rounded-[6px] flex items-center justify-center">
              <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6.5px] border-l-white ml-0.5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">YouTube</span>
          </div>
          <button onClick={() => openOverlay('search')} className="w-10 h-10 flex items-center justify-center text-white" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
        </header>
      )}

      <div className="flex-1 min-h-0 relative flex flex-col">
        {tab === 'home' && (
          <FeedScreen savedIds={savedIds} onOpen={openVideo} onToggleSave={toggleSave} onFeedLoaded={setFeed} onChangeKey={() => openOverlay('key')} />
        )}
        {tab === 'shorts' && <ShortsScreen />}
        {tab === 'subs' && (
          <SubsScreen subs={subs} savedIds={savedIds} onOpen={openVideo} onToggleSave={toggleSave} onGoHome={() => setTab('home')} />
        )}
        {tab === 'you' && (
          <LibraryScreen
            history={history}
            saved={saved}
            liked={liked}
            onOpen={openVideo}
            onClearHistory={() => setHistory([])}
            onRemoveSaved={toggleSave}
            onChangeKey={() => openOverlay('key')}
          />
        )}

        {stack.includes('search') && (
          <SearchScreen savedIds={savedIds} onClose={closeTop} onOpen={openVideo} onToggleSave={toggleSave} />
        )}
        {stack.includes('watch') && video && (
          <Watch
            video={video}
            upNext={feed}
            isSubscribed={subs.some((s) => s.id === video.channelId)}
            isLiked={liked.some((v) => v.id === video.id)}
            isSaved={savedIds.includes(video.id)}
            onClose={closeTop}
            onOpen={openVideo}
            onToggleSub={toggleSub}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
          />
        )}
      </div>

      <nav className="w-full h-14 bg-[#0f0f0f] border-t border-zinc-800/80 flex items-center justify-around px-2 shrink-0 z-40">
        {navBtn('home', 'Home', <Home className={`w-5 h-5 ${tab === 'home' ? 'stroke-[2.5px]' : ''}`} />)}
        {navBtn('shorts', 'Shorts', <Flame className={`w-5 h-5 ${tab === 'shorts' ? 'fill-red-600 text-red-600' : ''}`} />)}
        <button onClick={() => openOverlay('search')} className="flex-1 min-h-[44px] flex items-center justify-center" aria-label="Search">
          <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800/80 flex items-center justify-center text-white active:scale-95">
            <Search className="w-5 h-5" />
          </div>
        </button>
        {navBtn('subs', 'Subscriptions', <Layers className={`w-5 h-5 ${tab === 'subs' ? 'stroke-[2.5px]' : ''}`} />)}
        {navBtn('you', 'You', <User className={`w-5 h-5 ${tab === 'you' ? 'stroke-[2.5px]' : ''}`} />)}
      </nav>

      {stack.includes('key') && <KeyScreen onDone={() => { setHasKey(true); closeTop(); }} onClose={closeTop} />}
    </div>
  );
}
