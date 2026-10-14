import { Video, Short, Channel, Playlist, NotificationItem } from '../types/youtube';

// High-fidelity generated image paths
const TECH_THUMB = '/src/assets/images/yt_tech_review_thumb_1791997282311.jpg';
const GAMING_THUMB = '/src/assets/images/yt_gaming_thumb_1791997290533.jpg';
const NATURE_THUMB = '/src/assets/images/yt_nature_thumb_1791997285193.jpg';
const CONCERT_THUMB = '/src/assets/images/yt_concert_thumb_1791997284201.jpg';
const SHORT_PARKOUR_THUMB = '/src/assets/images/yt_short_parkour_1791997286575.jpg';

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-tech',
    name: 'Android Next',
    handle: '@androidnext',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    subscribers: '4.82M',
    isVerified: true,
    isSubscribed: true,
    bellNotification: 'all',
    hasNewContent: true,
  },
  {
    id: 'ch-game',
    name: 'CyberWave Studio',
    handle: '@cyberwavestudio',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
    subscribers: '1.95M',
    isVerified: true,
    isSubscribed: true,
    bellNotification: 'personalized',
    hasNewContent: true,
  },
  {
    id: 'ch-nature',
    name: 'Earth Horizon 4K',
    handle: '@earthhorizon4k',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    subscribers: '8.4M',
    isVerified: true,
    isSubscribed: true,
    bellNotification: 'all',
    hasNewContent: false,
  },
  {
    id: 'ch-music',
    name: 'Prism Soundstage',
    handle: '@prismsoundstage',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    subscribers: '3.1M',
    isVerified: true,
    isSubscribed: false,
    bellNotification: 'none',
    hasNewContent: true,
    isLive: true,
  },
  {
    id: 'ch-dev',
    name: 'Android Developers',
    handle: '@androiddevelopers',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    subscribers: '1.2M',
    isVerified: true,
    isSubscribed: true,
    bellNotification: 'personalized',
    hasNewContent: false,
  },
  {
    id: 'ch-parkour',
    name: 'Urban Velocity',
    handle: '@urbanvelocity',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    subscribers: '720K',
    isVerified: false,
    isSubscribed: false,
    bellNotification: 'none',
    hasNewContent: false,
  },
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Flagship Android 2024 Ultimate Review: The Real Truth After 90 Days!',
    description: `We spent three straight months with the newest flagship Android phone. From the groundbreaking 120Hz LTPO display to the periscope camera zoom and thermal performance during heavy gaming, here is our uncensored verdict.

TIMESTAMPS:
0:00 - Introduction & Hardware
2:15 - Display & Material You Tweaks
5:40 - Camera Shootout (Day & Night)
10:15 - Battery Endurance Test
14:50 - Software Updates & AI Features
18:10 - Final Score & Verdict

Make sure to hit subscribe and leave your questions in the comments!`,
    thumbnail: TECH_THUMB,
    duration: '19:42',
    durationSeconds: 1182,
    views: '1.4M views',
    viewCountNum: 1420500,
    uploadedAt: '2 days ago',
    category: 'Tech',
    channel: INITIAL_CHANNELS[0],
    likes: '84K',
    likeCountNum: 84120,
    isLiked: false,
    isDisliked: false,
    isSaved: false,
    isDownloaded: false,
    chapters: [
      { time: 0, timeDisplay: '0:00', title: 'Introduction & Hardware' },
      { time: 135, timeDisplay: '2:15', title: 'Display & Material You' },
      { time: 340, timeDisplay: '5:40', title: 'Camera Shootout' },
      { time: 615, timeDisplay: '10:15', title: 'Battery Endurance Test' },
      { time: 890, timeDisplay: '14:50', title: 'Software & AI' },
      { time: 1090, timeDisplay: '18:10', title: 'Final Verdict' },
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        content: 'The battery optimization on Android 15 is actually remarkable. Getting 8+ hours SOT easily!',
        timestamp: '1 day ago',
        likes: 1240,
        isCreatorHearted: true,
        isPinned: true,
        replyCount: 38,
      },
      {
        id: 'c-2',
        authorName: 'TechEnthusiast99',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        content: 'That camera sample at 6:40 blew me away. Best dynamic range I have seen this year.',
        timestamp: '18 hours ago',
        likes: 412,
        replyCount: 9,
      },
      {
        id: 'c-3',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content: 'Great comparison with the previous generation. Super helpful for deciding whether to upgrade.',
        timestamp: '12 hours ago',
        likes: 85,
        replyCount: 2,
      },
    ],
    commentCount: '2.8K',
  },
  {
    id: 'vid-2',
    title: 'NEON OVERDRIVE - Cyberpunk Speedrun & Boss Battle [4K 60FPS RTX ON]',
    description: `High-octane Cyberpunk action gameplay featuring the latest Ray Tracing overdrive mode. Watch us tear through Chapter 7: Ascension with zero damage on Ultra Nightmare difficulty.

Gear used:
- Snapdragon 8 Gen 3 Mobile Rig
- Custom Pro Controller
- 144Hz AMOLED Display Sync`,
    thumbnail: GAMING_THUMB,
    duration: '24:18',
    durationSeconds: 1458,
    views: '890K views',
    viewCountNum: 890400,
    uploadedAt: '4 days ago',
    category: 'Gaming',
    channel: INITIAL_CHANNELS[1],
    likes: '62K',
    likeCountNum: 62400,
    isLiked: false,
    isDisliked: false,
    isSaved: false,
    isDownloaded: true,
    chapters: [
      { time: 0, timeDisplay: '0:00', title: 'Speedrun Launch' },
      { time: 420, timeDisplay: '7:00', title: 'Highway Chase' },
      { time: 980, timeDisplay: '16:20', title: 'Boss Arena' },
      { time: 1320, timeDisplay: '22:00', title: 'Final Cutscene' },
    ],
    comments: [
      {
        id: 'c-201',
        authorName: 'PixelKnight',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
        content: 'That bike drift around the skyscraper at 9:15 was insane timing!',
        timestamp: '3 days ago',
        likes: 915,
        isCreatorHearted: true,
        replyCount: 14,
      },
    ],
    commentCount: '1.4K',
  },
  {
    id: 'vid-3',
    title: 'Himalayan Ghost: The Rare Snow Leopard of Ladakh (4K Ultra Wildlife Doc)',
    description: `Follow a 3-week expedition into the frozen mountain passes of the Himalayas to document one of the planet's most elusive big cats. Filmed entirely in native 4K HDR.

Narrated by Dr. Elena Rostov. In partnership with the Wildlife Conservation Trust.`,
    thumbnail: NATURE_THUMB,
    duration: '38:05',
    durationSeconds: 2285,
    views: '3.2M views',
    viewCountNum: 3200000,
    uploadedAt: '1 week ago',
    category: 'Documentary',
    channel: INITIAL_CHANNELS[2],
    likes: '210K',
    likeCountNum: 210000,
    isLiked: true,
    isDisliked: false,
    isSaved: true,
    isDownloaded: false,
    chapters: [
      { time: 0, timeDisplay: '0:00', title: 'The High Altitude Wilderness' },
      { time: 540, timeDisplay: '9:00', title: 'Tracking Fresh Pawprints' },
      { time: 1200, timeDisplay: '20:00', title: 'The Ridge Encounter' },
      { time: 1980, timeDisplay: '33:00', title: 'Survival in the Blizzards' },
    ],
    comments: [
      {
        id: 'c-301',
        authorName: 'WildExplorer',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        content: 'The patience required to capture this footage is incomprehensible. Pure art.',
        timestamp: '5 days ago',
        likes: 3410,
        isCreatorHearted: true,
        isPinned: true,
        replyCount: 52,
      },
    ],
    commentCount: '4.6K',
  },
  {
    id: 'vid-4',
    title: 'Live at the Stadium Arena: Electric Symphony Tour [Full Concert Experience]',
    description: `Relive the unforgettable sold-out world tour concert with full spatial audio remaster. Over 65,000 fans singing every word under 200 laser arrays.

Tracklist:
1. Midnight Ignition
2. Neon Pulse
3. Starlight Horizon
4. Echoes in the Rain
5. Grand Finale (Encore)`,
    thumbnail: CONCERT_THUMB,
    duration: '1:12:40',
    durationSeconds: 4360,
    views: '2.1M views',
    viewCountNum: 2140000,
    uploadedAt: '3 days ago',
    category: 'Music',
    channel: INITIAL_CHANNELS[3],
    likes: '145K',
    likeCountNum: 145000,
    isLiked: false,
    isDisliked: false,
    isSaved: false,
    isDownloaded: false,
    comments: [
      {
        id: 'c-401',
        authorName: 'MelodySeeker',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content: 'I was in section 104 right next to the stage! Hearing the encore again gave me absolute chills.',
        timestamp: '2 days ago',
        likes: 1820,
        replyCount: 27,
      },
    ],
    commentCount: '3.1K',
  },
];

export const INITIAL_SHORTS: Short[] = [
  {
    id: 'short-1',
    title: 'Insane 50ft rooftop leap during golden hour! 🏃💨 Never look down!',
    thumbnail: SHORT_PARKOUR_THUMB,
    views: '4.6M',
    likes: '382K',
    likeCountNum: 382000,
    isLiked: false,
    isDisliked: false,
    commentsCount: '1.9K',
    channel: INITIAL_CHANNELS[5],
    soundTitle: 'Adrenaline Rush (Original Speed Mix)',
    soundAuthor: 'Urban Beats Lab',
    comments: [
      {
        id: 'sc-1',
        authorName: 'AdrenalineJunkie',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        content: 'My palms are sweating just watching this through my phone screen 🤯',
        timestamp: '1 day ago',
        likes: 4200,
      },
      {
        id: 'sc-2',
        authorName: 'Chloe Parkour',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        content: 'Clean landing roll! Textbook precision on that concrete ledge.',
        timestamp: '18 hours ago',
        likes: 890,
      },
    ],
  },
  {
    id: 'short-2',
    title: 'Android 15 hidden gesture feature you definitely did not know! 📱✨',
    thumbnail: TECH_THUMB,
    views: '2.1M',
    likes: '194K',
    likeCountNum: 194000,
    isLiked: true,
    isDisliked: false,
    commentsCount: '840',
    channel: INITIAL_CHANNELS[0],
    soundTitle: 'Synthwave Chill Lo-Fi',
    soundAuthor: 'Tech Grooves',
    comments: [
      {
        id: 'sc-3',
        authorName: 'AndroidFanatic',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
        content: 'Just tried this on my Pixel and it works seamlessly! Thank you!',
        timestamp: '2 days ago',
        likes: 1200,
      },
    ],
  },
  {
    id: 'short-3',
    title: 'Cyberpunk Neon Boss 1-second parry combo! ⚔️🔥',
    thumbnail: GAMING_THUMB,
    views: '1.8M',
    likes: '142K',
    likeCountNum: 142000,
    isLiked: false,
    isDisliked: false,
    commentsCount: '620',
    channel: INITIAL_CHANNELS[1],
    soundTitle: 'Overdrive Cyber Bass',
    soundAuthor: 'Neon Wave Records',
    comments: [
      {
        id: 'sc-4',
        authorName: 'NeoGamer',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
        content: 'Frame-perfect parry! That boss gave me nightmares for 3 days.',
        timestamp: '3 days ago',
        likes: 540,
      },
    ],
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-liked',
    title: 'Liked videos',
    videoCount: 1,
    thumbnail: NATURE_THUMB,
    isPrivate: true,
    updatedAt: 'Updated today',
    videos: [INITIAL_VIDEOS[2]],
  },
  {
    id: 'pl-later',
    title: 'Watch later',
    videoCount: 2,
    thumbnail: TECH_THUMB,
    isPrivate: true,
    updatedAt: 'Updated 2 days ago',
    videos: [INITIAL_VIDEOS[0], INITIAL_VIDEOS[1]],
  },
  {
    id: 'pl-android',
    title: 'Android Dev & Architecture',
    videoCount: 4,
    thumbnail: TECH_THUMB,
    isPrivate: false,
    updatedAt: 'Updated 1 week ago',
    videos: [INITIAL_VIDEOS[0]],
  },
  {
    id: 'pl-synth',
    title: 'Cyberpunk & Night Drives',
    videoCount: 12,
    thumbnail: GAMING_THUMB,
    isPrivate: false,
    updatedAt: 'Updated 3 weeks ago',
    videos: [INITIAL_VIDEOS[1], INITIAL_VIDEOS[3]],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    channelName: 'Android Next',
    channelAvatar: INITIAL_CHANNELS[0].avatar,
    videoTitle: 'Flagship Android 2024 Ultimate Review: The Real Truth After 90 Days!',
    thumbnail: TECH_THUMB,
    timeAgo: '2 hours ago',
    isRead: false,
    type: 'upload',
  },
  {
    id: 'notif-2',
    channelName: 'Prism Soundstage',
    channelAvatar: INITIAL_CHANNELS[3].avatar,
    videoTitle: 'LIVE: Electronic Summer Festival Stage A Broadcasting Now in 4K',
    thumbnail: CONCERT_THUMB,
    timeAgo: '5 hours ago',
    isRead: false,
    type: 'live',
  },
  {
    id: 'notif-3',
    channelName: 'CyberWave Studio',
    channelAvatar: INITIAL_CHANNELS[1].avatar,
    videoTitle: 'Replied to your comment on NEON OVERDRIVE Boss Battle',
    thumbnail: GAMING_THUMB,
    timeAgo: '1 day ago',
    isRead: true,
    type: 'reply',
  },
];

export const TOPIC_CHIPS = [
  'All',
  'Tech',
  'Gaming',
  'Documentary',
  'Music',
  'Android 15',
  'Podcasts',
  'Live',
  'Wildlife',
  'Cyberpunk',
  'Camera',
  'Recently uploaded',
];
