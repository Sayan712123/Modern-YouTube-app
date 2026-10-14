import React, { useState } from 'react';
import { ArrowLeft, Search, Mic, X, History, TrendingUp } from 'lucide-react';
import { Video } from '../types/youtube';

interface SearchModalProps {
  videos: Video[];
  onClose: () => void;
  onSelectVideo: (video: Video) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  videos,
  onClose,
  onSelectVideo,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Android 15 review',
    'Cyberpunk gaming 60fps',
    'Himalaya 4K snow leopard',
    'Pixel 9 camera test',
  ]);

  const trendingSuggestions = [
    'Best Android phones 2024',
    'Live stadium music concerts',
    'Tech desk setup minimal',
    'Google I/O highlights',
  ];

  const filteredResults = query.trim()
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.channel.name.toLowerCase().includes(query.toLowerCase()) ||
          v.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate Android Google Assistant voice transcription
    setTimeout(() => {
      setQuery('Android flagship review');
      setIsListening(false);
    }, 2200);
  };

  const handleSelectHistory = (item: string) => {
    setQuery(item);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0f0f0f] flex flex-col select-none">
      {/* Top Search Input Bar */}
      <div className="h-14 px-3 flex items-center gap-2 border-b border-zinc-800 bg-[#0f0f0f] shrink-0">
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center bg-zinc-800/80 rounded-full px-3.5 py-1.5 border border-zinc-700/60 focus-within:border-zinc-500">
          <input
            type="text"
            placeholder="Search YouTube"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            autoFocus
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Voice Search Button */}
        <button
          onClick={handleVoiceSearch}
          className={`min-h-[44px] min-w-[40px] flex items-center justify-center rounded-full transition-colors ${
            isListening ? 'bg-red-600 text-white animate-pulse' : 'text-zinc-300 hover:text-white bg-zinc-800/70'
          }`}
          title="Search with voice"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Assistant Wave Animation Overlay */}
      {isListening && (
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
            <span className="text-xs font-medium text-white">Listening... Speak now</span>
          </div>
          <span className="text-[10px] text-zinc-400">Android Voice Recognition</span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        {query.trim() ? (
          /* Search Results */
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 mb-1">
              Results for &quot;{query}&quot; ({filteredResults.length})
            </p>

            {filteredResults.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  onSelectVideo(video);
                  onClose();
                }}
                className="flex gap-3 cursor-pointer group py-1 border-b border-zinc-900"
              >
                <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white font-mono text-[9px] px-1 rounded">
                    {video.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">{video.channel.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 tabular-nums">
                    <span>{video.views}</span>
                    <span aria-hidden="true">·</span>
                    <span>{video.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No matches found. Try searching for &quot;Tech&quot;, &quot;Gaming&quot;, or &quot;Music&quot;.
              </div>
            )}
          </div>
        ) : (
          /* Search History & Trending Suggestions */
          <div className="flex flex-col gap-5">
            {/* Recent Searches */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Recent searches
              </p>
              <div className="flex flex-col">
                {searchHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectHistory(item)}
                    className="flex items-center justify-between py-2.5 text-left text-zinc-300 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                      <span className="text-xs">{item}</span>
                    </div>
                    <Search className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Suggestions */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Trending searches
              </p>
              <div className="flex flex-col">
                {trendingSuggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectHistory(item)}
                    className="flex items-center justify-between py-2.5 text-left text-zinc-300 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-xs">{item}</span>
                    </div>
                    <Search className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
