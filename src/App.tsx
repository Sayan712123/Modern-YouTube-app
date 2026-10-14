import React, { useState } from 'react';
import { 
  NavTab, 
  DeviceMode, 
  NavigationStyle, 
  Video, 
  Short, 
  Channel, 
  Playlist, 
  NotificationItem 
} from './types/youtube';
import { 
  INITIAL_VIDEOS, 
  INITIAL_SHORTS, 
  INITIAL_CHANNELS, 
  INITIAL_PLAYLISTS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

// Components
import { AndroidFrame } from './components/AndroidFrame';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MiniPlayer } from './components/MiniPlayer';
import { ShortsFeed } from './components/ShortsFeed';
import { SubscriptionsView } from './components/SubscriptionsView';
import { YouView } from './components/YouView';
import { SearchModal } from './components/SearchModal';
import { CastModal } from './components/CastModal';
import { CreateModal } from './components/CreateModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareSheetModal } from './components/ShareSheetModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { Android13MediaNotification } from './components/Android13MediaNotification';
import { GitHubPublishModal } from './components/GitHubPublishModal';

export default function App() {
  // Device & Navigation state
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone');
  const [navStyle, setNavStyle] = useState<NavigationStyle>('gestures');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isIncognito, setIsIncognito] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isMediaNotifOpen, setIsMediaNotifOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Application Data state
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [shorts, setShorts] = useState<Short[]>(INITIAL_SHORTS);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [historyVideos, setHistoryVideos] = useState<Video[]>([INITIAL_VIDEOS[0], INITIAL_VIDEOS[2]]);
  const [downloadedVideos, setDownloadedVideos] = useState<Video[]>([INITIAL_VIDEOS[1]]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([
    'ch-tech',
    'ch-game',
    'ch-nature',
    'ch-dev'
  ]);

  // Video Player state
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState<boolean>(false);
  const [isMiniPlaying, setIsMiniPlaying] = useState<boolean>(true);

  // Overlay Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCastOpen, setIsCastOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [shareTarget, setShareTarget] = useState<Video | Short | null>(null);

  // Select video handler
  const handleSelectVideo = (video: Video) => {
    setActiveVideo(video);
    setIsPlayerMinimized(false);
    setIsMiniPlaying(true);

    // Add to history if not incognito
    if (!isIncognito) {
      setHistoryVideos((prev) => {
        const filtered = prev.filter((v) => v.id !== video.id);
        return [video, ...filtered];
      });
    }
  };

  // Shorts select handler
  const handleSelectShort = (short: Short) => {
    setCurrentTab('shorts');
  };

  // Toggle Like on video
  const handleToggleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          return {
            ...v,
            isLiked,
            isDisliked: false,
            likeCountNum: isLiked ? v.likeCountNum + 1 : v.likeCountNum - 1,
          };
        }
        return v;
      })
    );

    if (activeVideo && activeVideo.id === videoId) {
      const isLiked = !activeVideo.isLiked;
      setActiveVideo({
        ...activeVideo,
        isLiked,
        isDisliked: false,
        likeCountNum: isLiked ? activeVideo.likeCountNum + 1 : activeVideo.likeCountNum - 1,
      });
    }
  };

  // Toggle Dislike on video
  const handleToggleDislike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            isDisliked: !v.isDisliked,
            isLiked: false,
          };
        }
        return v;
      })
    );
  };

  // Toggle channel subscription
  const handleToggleSubscribe = (channelId: string) => {
    setSubscribedChannelIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  // Save to Watch Later
  const handleSaveToWatchLater = (video: Video) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === 'pl-later') {
          const exists = pl.videos.some((v) => v.id === video.id);
          const updated = exists ? pl.videos : [video, ...pl.videos];
          return {
            ...pl,
            videoCount: updated.length,
            videos: updated,
          };
        }
        return pl;
      })
    );
  };

  // Download video
  const handleDownloadVideo = (video: Video) => {
    setDownloadedVideos((prev) => {
      if (prev.some((v) => v.id === video.id)) return prev;
      return [video, ...prev];
    });
  };

  // Add public comment to video
  const handleAddComment = (videoId: string, text: string) => {
    const newComment = {
      id: `c-user-${Date.now()}`,
      authorName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      content: text,
      timestamp: 'Just now',
      likes: 1,
      replyCount: 0,
    };

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              comments: [newComment, ...v.comments],
            }
          : v
      )
    );

    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo({
        ...activeVideo,
        comments: [newComment, ...activeVideo.comments],
      });
    }
  };

  // Create new playlist
  const handleCreatePlaylist = (title: string, isPrivate: boolean) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      isPrivate,
      videoCount: 0,
      thumbnail: '/src/assets/images/yt_tech_review_thumb_1791997282311.jpg',
      updatedAt: 'Created just now',
      videos: [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistoryVideos([]);
  };

  // Add new video from upload sheet
  const handleAddNewVideo = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Android System Navigation Handlers
  const handleSystemBack = () => {
    // 1. Close overlays
    if (isGitHubModalOpen) {
      setIsGitHubModalOpen(false);
      return;
    }
    if (isMediaNotifOpen) {
      setIsMediaNotifOpen(false);
      return;
    }
    if (isApkModalOpen) {
      setIsApkModalOpen(false);
      return;
    }
    if (shareTarget) {
      setShareTarget(null);
      return;
    }
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }
    if (isCastOpen) {
      setIsCastOpen(false);
      return;
    }
    if (isCreateOpen) {
      setIsCreateOpen(false);
      return;
    }
    if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    // 2. Minimize full video player
    if (activeVideo && !isPlayerMinimized) {
      setIsPlayerMinimized(true);
      return;
    }
    // 3. Return to Home tab if on another tab
    if (currentTab !== 'home') {
      setCurrentTab('home');
      return;
    }
  };

  const handleSystemHome = () => {
    // Android Home Button: closes overlays, minimizes player, switches to home
    setIsGitHubModalOpen(false);
    setIsMediaNotifOpen(false);
    setIsApkModalOpen(false);
    setShareTarget(null);
    setIsSearchOpen(false);
    setIsCastOpen(false);
    setIsCreateOpen(false);
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
    if (activeVideo && !isPlayerMinimized) {
      setIsPlayerMinimized(true);
    }
    setCurrentTab('home');
  };

  const handleSystemRecents = () => {
    // Toggle recent apps feel or minimize
    if (activeVideo && !isPlayerMinimized) {
      setIsPlayerMinimized(true);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AndroidFrame
      deviceMode={deviceMode}
      setDeviceMode={setDeviceMode}
      navStyle={navStyle}
      setNavStyle={setNavStyle}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      isIncognito={isIncognito}
      setIsIncognito={setIsIncognito}
      onOpenApkModal={() => setIsApkModalOpen(true)}
      onOpenMediaNotification={() => setIsMediaNotifOpen(true)}
      onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      onSystemBack={handleSystemBack}
      onSystemHome={handleSystemHome}
      onSystemRecents={handleSystemRecents}
    >
      {/* YouTube Android App Container */}
      <div className="w-full h-full flex flex-col bg-[#0f0f0f] relative overflow-hidden select-none">
        
        {/* Top App Bar (Hidden during full-bleed Shorts tab to match Android YouTube) */}
        {currentTab !== 'shorts' && (
          <TopBar
            onOpenCast={() => setIsCastOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenProfile={() => setCurrentTab('you')}
            onOpenApk={() => setIsApkModalOpen(true)}
            unreadCount={unreadNotifsCount}
            isIncognito={isIncognito}
            isPremium={true}
          />
        )}

        {/* Dynamic App Content Views */}
        <div className="flex-1 w-full overflow-hidden relative flex flex-col">
          {currentTab === 'home' && (
            <HomeFeed
              videos={videos}
              shorts={shorts}
              onSelectVideo={handleSelectVideo}
              onSelectShort={handleSelectShort}
              onSaveToWatchLater={handleSaveToWatchLater}
              onDownloadVideo={handleDownloadVideo}
              onShareVideo={(v) => setShareTarget(v)}
            />
          )}

          {currentTab === 'shorts' && (
            <ShortsFeed
              shorts={shorts}
              onToggleSubscribe={handleToggleSubscribe}
              onShare={(s) => setShareTarget(s)}
              subscribedChannelIds={subscribedChannelIds}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsView
              channels={channels}
              videos={videos}
              shorts={shorts}
              onSelectVideo={handleSelectVideo}
              onSelectShort={handleSelectShort}
              subscribedChannelIds={subscribedChannelIds}
              onToggleSubscribe={handleToggleSubscribe}
            />
          )}

          {currentTab === 'you' && (
            <YouView
              historyVideos={historyVideos}
              playlists={playlists}
              downloadedVideos={downloadedVideos}
              onSelectVideo={handleSelectVideo}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onCreatePlaylist={handleCreatePlaylist}
              onClearHistory={handleClearHistory}
              isIncognito={isIncognito}
              onToggleIncognito={() => setIsIncognito(!isIncognito)}
              onOpenApkModal={() => setIsApkModalOpen(true)}
              onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            />
          )}

          {/* Floating Android Mini-Player (when minimized) */}
          {activeVideo && isPlayerMinimized && (
            <MiniPlayer
              video={activeVideo}
              isPlaying={isMiniPlaying}
              onTogglePlay={() => setIsMiniPlaying(!isMiniPlaying)}
              onExpand={() => setIsPlayerMinimized(false)}
              onClose={() => {
                setActiveVideo(null);
                setIsPlayerMinimized(false);
              }}
            />
          )}

          {/* Full Screen Interactive Video Player Modal */}
          {activeVideo && !isPlayerMinimized && (
            <VideoPlayerModal
              video={activeVideo}
              allVideos={videos}
              onClose={() => setActiveVideo(null)}
              onMinimize={() => setIsPlayerMinimized(true)}
              onSelectRelatedVideo={handleSelectVideo}
              onToggleLike={handleToggleLike}
              onToggleDislike={handleToggleDislike}
              onToggleSubscribe={handleToggleSubscribe}
              onShare={(v) => setShareTarget(v)}
              onDownload={handleDownloadVideo}
              onAddComment={handleAddComment}
              isSubscribed={subscribedChannelIds.includes(activeVideo.channel.id)}
            />
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onOpenCreate={() => setIsCreateOpen(true)}
          hasUnreadSubs={true}
        />

        {/* Overlay Sheets & Modals */}
        {isSearchOpen && (
          <SearchModal
            videos={videos}
            onClose={() => setIsSearchOpen(false)}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {isCastOpen && (
          <CastModal onClose={() => setIsCastOpen(false)} />
        )}

        {isCreateOpen && (
          <CreateModal
            onClose={() => setIsCreateOpen(false)}
            onAddNewVideo={handleAddNewVideo}
            onOpenShortsCreator={() => setCurrentTab('shorts')}
          />
        )}

        {isNotificationsOpen && (
          <NotificationsModal
            notifications={notifications}
            onClose={() => setIsNotificationsOpen(false)}
            onSelectNotification={(n) => {
              const matched = videos.find((v) => v.title === n.videoTitle);
              if (matched) handleSelectVideo(matched);
              setIsNotificationsOpen(false);
            }}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isIncognito={isIncognito}
            setIsIncognito={setIsIncognito}
          />
        )}

        {shareTarget && (
          <ShareSheetModal
            item={shareTarget}
            onClose={() => setShareTarget(null)}
          />
        )}

        {/* Android APK Download & Installation Modal */}
        {isApkModalOpen && (
          <ApkDownloadModal 
            onClose={() => setIsApkModalOpen(false)} 
            onOpenGitHub={() => setIsGitHubModalOpen(true)}
          />
        )}

        {/* GitHub Publish & Actions APK Build Modal */}
        {isGitHubModalOpen && (
          <GitHubPublishModal onClose={() => setIsGitHubModalOpen(false)} />
        )}

        {/* Android 13 Signature Squiggly Media Player Notification Drawer */}
        {isMediaNotifOpen && (
          <Android13MediaNotification
            video={activeVideo || videos[0]}
            isPlaying={isMiniPlaying}
            onTogglePlay={() => setIsMiniPlaying(!isMiniPlaying)}
            onClose={() => setIsMediaNotifOpen(false)}
            onOpenVideo={() => {
              if (!activeVideo) setActiveVideo(videos[0]);
              setIsPlayerMinimized(false);
              setIsMediaNotifOpen(false);
            }}
          />
        )}

      </div>
    </AndroidFrame>
  );
}
