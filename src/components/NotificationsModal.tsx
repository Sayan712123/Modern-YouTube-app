import React from 'react';
import { X, Bell, Check, MoreVertical } from 'lucide-react';
import { NotificationItem, Video } from '../types/youtube';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onSelectNotification,
  onMarkAllAsRead,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[85%] bg-[#1e1e1e] rounded-t-3xl flex flex-col border-t border-zinc-700 max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto my-3 shrink-0"></div>

        <div className="px-4 pb-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-zinc-300" />
            <h3 className="font-bold text-sm text-white">Notifications</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`flex items-start gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors ${
                notif.isRead ? 'hover:bg-zinc-800/60' : 'bg-zinc-800/40 hover:bg-zinc-800'
              }`}
            >
              {/* Channel Avatar */}
              <div className="relative shrink-0">
                <img
                  src={notif.channelAvatar}
                  alt={notif.channelName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                {!notif.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-[#1e1e1e]"></span>
                )}
              </div>

              {/* Notification Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-white mr-1">{notif.channelName}</span>
                  {notif.type === 'upload' && 'uploaded: '}
                  {notif.type === 'live' && 'is streaming live: '}
                  {notif.type === 'reply' && 'replied: '}
                  {notif.videoTitle}
                </p>
                <span className="text-[10px] text-zinc-400 mt-1 block">{notif.timeAgo}</span>
              </div>

              {/* Thumbnail preview */}
              <div className="w-14 aspect-video rounded-md overflow-hidden bg-zinc-900 shrink-0">
                <img
                  src={notif.thumbnail}
                  alt="thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12 text-xs text-zinc-500">
              No new notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
