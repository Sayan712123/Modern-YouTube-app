export type NavTab = 'home' | 'shorts' | 'subscriptions' | 'you';

export type DeviceMode = 'phone' | 'tablet' | 'full';

export type NavigationStyle = 'gestures' | 'buttons';

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: string;
  isVerified?: boolean;
  isSubscribed?: boolean;
  bellNotification?: 'all' | 'personalized' | 'none';
  banner?: string;
  hasNewContent?: boolean;
  isLive?: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isPinned?: boolean;
  isCreatorHearted?: boolean;
  replyCount?: number;
}

export interface VideoChapter {
  time: number; // in seconds
  timeDisplay: string;
  title: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string; // HTML5 video or simulation
  duration: string;
  durationSeconds: number;
  views: string;
  viewCountNum: number;
  uploadedAt: string;
  category: string;
  channel: Channel;
  likes: string;
  likeCountNum: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
  isDownloaded?: boolean;
  chapters?: VideoChapter[];
  comments: Comment[];
  commentCount: string;
}

export interface Short {
  id: string;
  title: string;
  videoUrl?: string;
  thumbnail: string;
  views: string;
  likes: string;
  likeCountNum: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  commentsCount: string;
  channel: Channel;
  soundTitle: string;
  soundAuthor: string;
  comments: Comment[];
}

export interface Playlist {
  id: string;
  title: string;
  videoCount: number;
  thumbnail: string;
  isPrivate?: boolean;
  updatedAt: string;
  videos: Video[];
}

export interface NotificationItem {
  id: string;
  channelName: string;
  channelAvatar: string;
  videoTitle: string;
  thumbnail: string;
  timeAgo: string;
  isRead: boolean;
  type: 'upload' | 'live' | 'reply';
}
