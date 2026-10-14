import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Radio, 
  MessageSquare, 
  Mail, 
  Send,
  Smartphone
} from 'lucide-react';
import { Video, Short } from '../types/youtube';

interface ShareSheetModalProps {
  item: Video | Short | null;
  onClose: () => void;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!item) return null;

  const shareUrl = `https://youtu.be/${item.id}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-zinc-300" />
            <h3 className="font-bold text-sm text-white">Share</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Card Preview */}
        <div className="my-3 p-2.5 bg-zinc-900 rounded-xl flex items-center gap-3">
          <img
            src={item.thumbnail}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-16 aspect-video rounded-md object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{shareUrl}</p>
          </div>
        </div>

        {/* Android Quick Share / Nearby Share */}
        <div className="mb-4 p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Quick Share</p>
              <p className="text-[10px] text-zinc-400">Share with nearby Android devices</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg"
          >
            Send
          </button>
        </div>

        {/* App Target Grid */}
        <div className="grid grid-cols-4 gap-3 text-center pb-2">
          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-white transition-colors">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-[11px] text-zinc-300">
              {copied ? 'Copied!' : 'Copy link'}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              handleCopy();
              setTimeout(onClose, 500);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 group-hover:bg-emerald-600 flex items-center justify-center text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">WhatsApp</span>
          </button>

          {/* Messages */}
          <button
            onClick={() => {
              handleCopy();
              setTimeout(onClose, 500);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">Messages</span>
          </button>

          {/* Gmail */}
          <button
            onClick={() => {
              handleCopy();
              setTimeout(onClose, 500);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-700/80 group-hover:bg-red-600 flex items-center justify-center text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">Gmail</span>
          </button>
        </div>
      </div>
    </div>
  );
};
