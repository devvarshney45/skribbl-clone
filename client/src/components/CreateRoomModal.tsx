// CreateRoomModal.tsx
// Host configuration for new game rooms.

import React, { useState } from 'react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (settings: any, isPrivate: boolean) => void;
  loading: boolean;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate, loading }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const rounds = 3;
  const drawTime = 80;
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [wordCount, setWordCount] = useState(3);
  const [wordMode, setWordMode] = useState<'normal' | 'hidden'>('normal');
  const [hints] = useState(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-main/90 backdrop-blur-md animate-fade-in">
      <div className="panel w-full max-w-lg p-8 md:p-10 rounded-[2.5rem] bg-bg-panel/40 border-white/5 shadow-2xl animate-pop-in relative overflow-hidden">
        
        {/* Decorative Progress Aura */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-30" />

        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Create <span className="text-brand-secondary">Room</span></h2>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-slate-500">✕</button>
        </div>

        <div className="space-y-8">
          {/* Privacy Toggle */}
          <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Room Privacy</label>
              <div className="flex bg-bg-main p-1 rounded-2xl border border-white/5">
                  <button onClick={() => setIsPrivate(true)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${isPrivate ? 'bg-rose-500/20 text-rose-400 shadow-lg border border-rose-500/20' : 'text-slate-600'}`}>
                    <span>🔒</span> PRIVATE
                  </button>
                  <button onClick={() => setIsPrivate(false)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${!isPrivate ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-600'}`}>
                    <span>🌍</span> PUBLIC
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Players */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Max Players</label>
                    <span className="text-xs font-black font-mono text-brand-secondary">{maxPlayers}</span>
                </div>
                <input type="range" min="2" max="12" value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value))} className="w-full accent-brand-primary" />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Word Count */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Word Options</label>
                    <span className="text-xs font-black font-mono text-brand-secondary">{wordCount}</span>
                </div>
                <input type="range" min="2" max="5" value={wordCount} onChange={(e) => setWordCount(parseInt(e.target.value))} className="w-full accent-brand-primary" />
            </div>

            {/* Word Mode */}
            <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Logic Pattern</label>
                <select 
                  value={wordMode} 
                  onChange={(e) => setWordMode(e.target.value as any)}
                  className="w-full bg-bg-main border border-white/5 rounded-xl py-2.5 px-3 text-[10px] font-black text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="normal">NORMAL (HINTS)</option>
                  <option value="hidden">HIDDEN (NO HINTS)</option>
                </select>
            </div>
          </div>

          <button 
            onClick={() => onCreate({ rounds, drawTime, maxPlayers, wordCount, hints, wordMode }, isPrivate)}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-[11px] tracking-[0.4em] btn-game shadow-tactile-heavy transition-all mt-4 ${loading ? 'bg-brand-primary/50 text-white cursor-not-allowed animate-pulse' : 'bg-brand-primary hover:bg-brand-primary/90 text-white'}`}
          >
            {loading ? 'CREATING...' : 'CREATE ROOM ➔'}
          </button>
        </div>

        <div className="mt-8 text-center">
            <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.6em]">Skribbl Clone Settings</span>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
