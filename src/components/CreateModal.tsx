import React, { useState } from 'react';
import { 
  Flame, 
  Upload, 
  Radio, 
  FileEdit, 
  X, 
  ArrowLeft, 
  Video as VideoIcon, 
  Check 
} from 'lucide-react';
import { Video } from '../types/youtube';

interface CreateModalProps {
  onClose: () => void;
  onAddNewVideo: (video: Video) => void;
  onOpenShortsCreator: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  onClose,
  onAddNewVideo,
  onOpenShortsCreator,
}) => {
  const [mode, setMode] = useState<'menu' | 'upload_video'>('menu');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDesc, setVideoDesc] = useState<string>('');
  const [videoCategory, setVideoCategory] = useState<string>('Tech');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const newVideo: Video = {
      id: `user-upload-${Date.now()}`,
      title: videoTitle.trim(),
      description: videoDesc.trim() || 'Uploaded via YouTube Android App for mobile creators.',
      thumbnail: '/src/assets/images/yt_tech_review_thumb_1791997282311.jpg',
      duration: '04:15',
      durationSeconds: 255,
      views: '1 view',
      viewCountNum: 1,
      uploadedAt: 'Just now',
      category: videoCategory,
      channel: {
        id: 'user-channel',
        name: 'Alex Chen',
        handle: '@alexchen_dev',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        subscribers: '12',
        isVerified: false,
      },
      likes: '1',
      likeCountNum: 1,
      comments: [],
      commentCount: '0',
    };

    onAddNewVideo(newVideo);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end select-none"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#1e1e1e] rounded-t-3xl p-5 border-t border-zinc-700 max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3"></div>

        {mode === 'menu' ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">Create</h3>
              <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 flex flex-col gap-1">
              {/* Create a Short */}
              <button
                onClick={() => {
                  onOpenShortsCreator();
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-500">
                  <Flame className="w-5 h-5 fill-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Create a Short</h4>
                  <p className="text-xs text-zinc-400">Capture with camera or add sound</p>
                </div>
              </button>

              {/* Upload a video */}
              <button
                onClick={() => setMode('upload_video')}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Upload a video</h4>
                  <p className="text-xs text-zinc-400">Publish 4K/HD video to your feed</p>
                </div>
              </button>

              {/* Go live */}
              <button
                onClick={onClose}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Go live</h4>
                  <p className="text-xs text-zinc-400">Stream in real-time to your audience</p>
                </div>
              </button>

              {/* Create a post */}
              <button
                onClick={onClose}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-400">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Create a post</h4>
                  <p className="text-xs text-zinc-400">Share polls, images, and updates</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Upload Video Form */
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <button onClick={() => setMode('menu')} className="p-1 text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-sm text-white">Upload Video</h3>
              </div>
              <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="py-3 flex flex-col gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                <input
                  type="text"
                  placeholder="Create a title (e.g. My Android Studio Project Review)"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="Add description..."
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                <select
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Tech">Tech</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Documentary">Documentary</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode('menu')}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!videoTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 disabled:bg-zinc-800 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
                >
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
