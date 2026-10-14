import React, { useState } from 'react';
import { Video, Channel, Short } from '../types/youtube';
import { CheckCircle2, Radio, MoreVertical, Flame, MessageCircle, Heart, Bell } from 'lucide-react';

interface SubscriptionsViewProps {
  channels: Channel[];
  videos: Video[];
  shorts: Short[];
  onSelectVideo: (video: Video) => void;
  onSelectShort: (short: Short) => void;
  subscribedChannelIds: string[];
  onToggleSubscribe: (channelId: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  channels,
  videos,
  shorts,
  onSelectVideo,
  onSelectShort,
  subscribedChannelIds,
  onToggleSubscribe,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [communityLiked, setCommunityLiked] = useState<boolean>(false);
  const [showManageSheet, setShowManageSheet] = useState<boolean>(false);

  const subscribedChannels = channels.filter((c) =>
    subscribedChannelIds.includes(c.id)
  );

  const displayedVideos = videos.filter((v) => {
    if (selectedChannelId !== 'all' && v.channel.id !== selectedChannelId) return false;
    if (filterType === 'videos') return true;
    if (filterType === 'shorts') return false;
    return true;
  });

  return (
    <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-16 bg-[#0f0f0f] relative select-none">
      {/* Top Channels Carousel (Story-style rings) */}
      <div className="p-3 border-b border-zinc-800/60 bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Subscribed Channels ({subscribedChannels.length})
          </span>
          <button
            onClick={() => setShowManageSheet(true)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            Manage
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* 'All' Channel Button */}
          <button
            onClick={() => setSelectedChannelId('all')}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                selectedChannelId === 'all'
                  ? 'ring-2 ring-red-600 bg-red-600/20 text-white font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="text-xs">ALL</span>
            </div>
            <span className="text-[11px] font-medium text-zinc-300">All</span>
          </button>

          {/* Subscribed Channel Rings */}
          {subscribedChannels.map((channel) => {
            const isSelected = selectedChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => setSelectedChannelId(channel.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="relative">
                  <div
                    className={`w-13 h-13 rounded-full overflow-hidden transition-all ${
                      isSelected
                        ? 'ring-2 ring-red-600 p-0.5'
                        : channel.isLive
                        ? 'ring-2 ring-red-500 animate-pulse p-0.5'
                        : channel.hasNewContent
                        ? 'ring-2 ring-blue-500 p-0.5'
                        : 'ring-1 ring-zinc-700'
                    }`}
                  >
                    <img
                      src={channel.avatar}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Live or New Badge */}
                  {channel.isLive ? (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1 rounded uppercase tracking-tighter">
                      LIVE
                    </span>
                  ) : channel.hasNewContent ? (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-[#0f0f0f]"></span>
                  ) : null}
                </div>

                <span className="text-[11px] font-medium text-zinc-300 max-w-[56px] truncate">
                  {channel.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs (All, Today, Videos, Shorts, Live) */}
      <div className="px-3.5 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Today', 'Videos', 'Shorts', 'Live'].map((tab) => {
          const isActive = filterType === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setFilterType(tab.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Community Post Card Highlight */}
      <div className="mx-3.5 my-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <img
              src={channels[0].avatar}
              alt={channels[0].name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white">{channels[0].name}</span>
                <CheckCircle2 className="w-3 h-3 text-zinc-400 fill-zinc-400" />
              </div>
              <span className="text-[10px] text-zinc-400">Community poll · 4 hours ago</span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-zinc-500" />
        </div>

        <p className="text-xs text-zinc-200 leading-relaxed mb-3">
          Hey everyone! Which deep dive would you like to see next on the channel? Vote below! 👇
        </p>

        {/* Poll Options */}
        <div className="flex flex-col gap-2 text-xs">
          <button className="w-full text-left p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 flex justify-between">
            <span>Android 15 Kernel Optimization & Battery</span>
            <span className="font-semibold text-red-400">62%</span>
          </button>
          <button className="w-full text-left p-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 flex justify-between">
            <span>Smartphone Camera Sensors & Periscope Zoom</span>
            <span className="font-semibold text-zinc-400">38%</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800 text-xs text-zinc-400">
          <button
            onClick={() => setCommunityLiked(!communityLiked)}
            className={`flex items-center gap-1.5 ${communityLiked ? 'text-red-500 font-semibold' : 'hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${communityLiked ? 'fill-red-500' : ''}`} />
            <span>{communityLiked ? '12.4K' : '12.3K'}</span>
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>482 comments</span>
          </span>
        </div>
      </div>

      {/* Videos from Subscriptions Feed */}
      <div className="flex flex-col divide-y divide-zinc-900">
        {displayedVideos.map((video) => (
          <article
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="w-full pb-5 cursor-pointer group"
          >
            <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded">
                {video.duration}
              </span>
            </div>

            <div className="flex items-start gap-3 px-3.5 pt-3">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                  <span>{video.channel.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.views}</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.uploadedAt}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Manage Subscriptions Bottom Sheet */}
      {showManageSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowManageSheet(false)}
        >
          <div
            className="w-full max-h-[80%] bg-[#1a1a1a] rounded-t-3xl flex flex-col border-t border-zinc-700 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Manage Subscriptions</h3>
              <button
                onClick={() => setShowManageSheet(false)}
                className="text-xs text-red-400 font-semibold"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
              {channels.map((ch) => {
                const isSub = subscribedChannelIds.includes(ch.id);
                return (
                  <div key={ch.id} className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-white">{ch.name}</span>
                          {ch.isVerified && <CheckCircle2 className="w-3 h-3 text-zinc-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400">{ch.subscribers} subscribers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleSubscribe(ch.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        isSub
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {isSub ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
