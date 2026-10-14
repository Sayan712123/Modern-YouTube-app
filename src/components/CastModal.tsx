import React, { useState } from 'react';
import { Tv, Cast, Wifi, X, Check, Laptop } from 'lucide-react';

interface CastModalProps {
  onClose: () => void;
}

export const CastModal: React.FC<CastModalProps> = ({ onClose }) => {
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  const devices = [
    { id: 'dev-1', name: 'Living Room Sony Bravia 4K', type: 'Android TV' },
    { id: 'dev-2', name: 'Bedroom Chromecast with Google TV', type: 'Chromecast' },
    { id: 'dev-3', name: 'Nest Hub Max Display', type: 'Smart Display' },
  ];

  const handleConnect = (id: string) => {
    if (connectedDevice === id) {
      setConnectedDevice(null);
      return;
    }
    setConnectingDevice(id);
    setTimeout(() => {
      setConnectingDevice(null);
      setConnectedDevice(id);
    }, 1200);
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

        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cast className="w-5 h-5 text-zinc-300" />
            <h3 className="font-bold text-sm text-white">Connect to a device</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device List */}
        <div className="py-3 flex flex-col gap-2">
          {devices.map((device) => {
            const isConnecting = connectingDevice === device.id;
            const isConnected = connectedDevice === device.id;

            return (
              <button
                key={device.id}
                onClick={() => handleConnect(device.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-colors ${
                  isConnected
                    ? 'bg-blue-950/40 border border-blue-500/60'
                    : 'bg-zinc-800/80 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isConnected ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{device.name}</h4>
                    <p className="text-[10px] text-zinc-400">{device.type}</p>
                  </div>
                </div>

                <div>
                  {isConnecting ? (
                    <span className="text-[11px] text-blue-400 animate-pulse font-medium">
                      Connecting...
                    </span>
                  ) : isConnected ? (
                    <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Tap to play</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Link with TV code */}
        <div className="pt-2 border-t border-zinc-800 text-center">
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium py-1">
            Link with TV code
          </button>
        </div>
      </div>
    </div>
  );
};
