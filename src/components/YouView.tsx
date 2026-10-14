import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Download, 
  Bookmark, 
  Film, 
  HelpCircle, 
  Plus, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Trash2,
  Lock,
  Globe,
  Github
} from 'lucide-react';
import { Video, Playlist } from '../types/youtube';

interface YouViewProps {
  historyVideos: Video[];
  playlists: Playlist[];
  downloadedVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onOpenSettings: () => void;
  onCreatePlaylist: (title: string, isPrivate: boolean) => void;
  onClearHistory: () => void;
  isIncognito: boolean;
  onToggleIncognito: () => void;
  onOpenApkModal?: () => void;
  onOpenGitHubModal?: () => void;
}

export const YouView: React.FC<YouViewProps> = ({
  historyVideos,
  playlists,
  downloadedVideos,
  onSelectVideo,
  onOpenSettings,
  onCreatePlaylist,
  onClearHistory,
  isIncognito,
  onToggleIncognito,
  onOpenApkModal,
  onOpenGitHubModal,
}) => {
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState<boolean>(false);
  const [playlistTitle, setPlaylistTitle] = useState<string>('');
  const [isPrivatePlaylist, setIsPrivatePlaylist] = useState<boolean>(true);

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    onCreatePlaylist(playlistTitle.trim(), isPrivatePlaylist);
    setPlaylistTitle('');
    setShowNewPlaylistModal(false);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-16 bg-[#0f0f0f] relative select-none">
      {/* Top Header / Profile Card */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-red-900 ring-2 ring-zinc-700 flex items-center justify-center text-white">
              <User className="w-8 h-8 text-zinc-200" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Alex Chen</h2>
              <p className="text-xs text-zinc-400">@alexchen_dev · View channel</p>
            </div>
          </div>

          {/* Settings Gear Button */}
          <button
            onClick={onOpenSettings}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-300 hover:text-white"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Account Actions */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={onToggleIncognito}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-colors ${
              isIncognito 
                ? 'bg-zinc-800 border-zinc-500 text-white' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>{isIncognito ? 'Turn off Incognito' : 'Turn on Incognito'}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white shrink-0">
            <span>Switch account</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white shrink-0">
            <span>Google Account</span>
          </button>
        </div>
      </div>

      {/* History Section */}
      <section className="py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-white">History</h3>
          </div>

          <div className="flex items-center gap-3">
            {historyVideos.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1"
                title="Clear history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-xs font-semibold text-blue-400 cursor-pointer">View all</span>
          </div>
        </div>

        {historyVideos.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
            {historyVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="w-36 shrink-0 cursor-pointer group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white font-mono text-[9px] px-1 rounded">
                    {video.duration}
                  </span>
                  {/* Watched progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                    <div className="h-full bg-red-600 w-3/4"></div>
                  </div>
                </div>
                <h4 className="text-xs font-medium text-white line-clamp-2 mt-1.5 leading-snug">
                  {video.title}
                </h4>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{video.channel.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 text-xs text-zinc-500 italic">
            No watched videos in history yet
          </div>
        )}
      </section>

      {/* Playlists Section */}
      <section className="py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-white">Playlists</h3>
          </div>

          <button
            onClick={() => setShowNewPlaylistModal(true)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New playlist</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
          {playlists.map((pl) => (
            <div key={pl.id} className="w-36 shrink-0 cursor-pointer group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                <img
                  src={pl.thumbnail}
                  alt={pl.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-white/90" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] px-1 rounded tabular-nums">
                  {pl.videoCount} videos
                </span>
              </div>
              <h4 className="text-xs font-medium text-white truncate mt-1.5">{pl.title}</h4>
              <p className="text-[10px] text-zinc-400">{pl.updatedAt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads Section (Offline Watching) */}
      <section className="py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-zinc-400" />
            <h3 className="font-bold text-sm text-white">Downloads</h3>
            <span className="text-xs text-zinc-500 tabular-nums">({downloadedVideos.length})</span>
          </div>
          <span className="text-[11px] text-zinc-400">Available offline</span>
        </div>

        {downloadedVideos.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
            {downloadedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="w-36 shrink-0 cursor-pointer group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 left-1 bg-red-600 rounded-full p-0.5 text-white">
                    <Download className="w-2.5 h-2.5" />
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white font-mono text-[9px] px-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <h4 className="text-xs font-medium text-white line-clamp-2 mt-1.5 leading-snug">
                  {video.title}
                </h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 text-xs text-zinc-500">
            No offline downloads. Tap &apos;Download&apos; on any video to watch offline.
          </div>
        )}
      </section>

      {/* Quick Menu Shortcuts List */}
      <div className="flex flex-col py-2">
        {onOpenApkModal && (
          <button 
            onClick={onOpenApkModal}
            className="flex items-center justify-between px-4 py-3 bg-red-950/20 hover:bg-red-950/40 border-y border-red-900/30 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm text-red-400 font-semibold">
              <Download className="w-5 h-5 text-red-500" />
              <span>Get Android APK & Install App</span>
            </div>
            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
              APK
            </span>
          </button>
        )}

        {onOpenGitHubModal && (
          <button 
            onClick={onOpenGitHubModal}
            className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 hover:bg-zinc-900 border-b border-zinc-800 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm text-zinc-200 font-medium">
              <Github className="w-5 h-5 text-white" />
              <span>Connect GitHub & Build APK on Actions</span>
            </div>
            <span className="text-[10px] bg-zinc-800 text-blue-400 border border-zinc-700 font-semibold px-2 py-0.5 rounded">
              CI/CD
            </span>
          </button>
        )}

        <button className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 text-left">
          <div className="flex items-center gap-3 text-sm text-zinc-200">
            <Film className="w-5 h-5 text-zinc-400" />
            <span>Your movies & TV</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 text-left">
          <div className="flex items-center gap-3 text-sm text-zinc-200">
            <Clock className="w-5 h-5 text-zinc-400" />
            <span>Time watched (5h 42m this week)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 text-left">
          <div className="flex items-center gap-3 text-sm text-zinc-200">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span>Help & feedback</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* New Playlist Modal */}
      {showNewPlaylistModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowNewPlaylistModal(false)}
        >
          <div
            className="w-full max-w-sm bg-zinc-900 rounded-2xl p-5 border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-white mb-4">New playlist</h3>

            <form onSubmit={handleCreatePlaylistSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                <input
                  type="text"
                  placeholder="Enter playlist title"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Privacy</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivatePlaylist(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border ${
                      isPrivatePlaylist
                        ? 'bg-red-600/20 border-red-500 text-red-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivatePlaylist(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border ${
                      !isPrivatePlaylist
                        ? 'bg-red-600/20 border-red-500 text-red-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlaylistModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!playlistTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-red-600 disabled:bg-zinc-800 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
