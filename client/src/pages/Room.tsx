// Room.tsx (Lobby)
// Redesigned with a "Senior Level" dashboard-style UI.
// Features glassmorphism, refined player cards, and intuitive controls.

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Room: React.FC = () => {
  const { 
    roomCode, 
    players, 
    playerId, 
    isPublic,
    markReady, 
    startGame,
    totalRounds,
    drawTime,
    updateSettings
  } = useGame();

  const [copyState, setCopyState] = useState<'idle' | 'code' | 'link'>('idle');

  // Find the current player in the list
  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  const handleCopy = (type: 'code' | 'link') => {
    const text = type === 'code' ? roomCode : `${window.location.origin}/join?code=${roomCode}`;
    navigator.clipboard.writeText(text);
    setCopyState(type);
    setTimeout(() => setCopyState('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-mesh p-6 lg:p-12 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-end mb-12 gap-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Live Session Lobby</span>
          </div>
          <h1 className="text-5xl font-black italic text-gradient">
            STUDIO PULSE
          </h1>
        </div>

        {/* Room Code Reveal Card */}
        <div className="glass px-8 py-5 rounded-3xl flex items-center gap-10 border-white/5 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Access Code</span>
            <span className="text-4xl font-mono font-black tracking-[0.2em] text-white">
              {roomCode}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleCopy('code')}
              className={`text-[9px] font-black px-4 py-2 rounded-full tracking-widest transition-all ${
                copyState === 'code' ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              {copyState === 'code' ? 'COPIED!' : 'COPY CODE'}
            </button>
            <button 
              onClick={() => handleCopy('link')}
              className={`text-[9px] font-black px-4 py-2 rounded-full tracking-widest transition-all ${
                copyState === 'link' ? 'bg-emerald-500 text-white' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {copyState === 'link' ? 'LINK SAVED!' : 'INVITE LINK'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in delay-100">
        {/* Players List Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              Artists Connected 
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px]">
                {players.length} / 12
              </span>
            </h2>
            <span className="text-[10px] text-slate-600 font-bold uppercase italic">Min 2 required to start</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`glass p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 glass-hover ${
                  player.id === playerId ? 'ring-1 ring-indigo-500/30 bg-indigo-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    player.isHost 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                    : 'bg-gradient-to-br from-indigo-500 to-brand-secondary text-white'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-sm flex items-center gap-2">
                      {player.name}
                      {player.id === playerId && (
                        <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-black tracking-tighter">YOU</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                      {player.isHost ? '💎 STUDIO OWNER' : 'CREW MEMBER'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {player.isReady ? (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-4 py-2 rounded-xl border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      READY
                    </div>
                  ) : (
                    <div className="bg-white/5 text-slate-500 text-[9px] font-black px-4 py-2 rounded-xl uppercase italic tracking-widest">
                      WAITING
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots placeholders to fill grid */}
            {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
              <div key={i} className="border-2 border-dashed border-white/5 rounded-2xl p-5 flex items-center gap-4 opacity-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                  <div className="w-24 h-2 bg-white/10 rounded" />
                  <div className="w-16 h-1 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Sidebar Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full" />
            
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Session Control</h2>
            
            <div className="space-y-6">
              {!isHost ? (
                <button
                  onClick={markReady}
                  disabled={me?.isReady}
                  className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] transition-all shadow-xl ${
                    me?.isReady 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 scale-100 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {me?.isReady ? 'READY CONFIRMED' : 'MARK AS READY'}
                </button>
              ) : (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-brand-secondary hover:from-indigo-500 hover:to-brand-primary text-white shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none"
                >
                  INITIATE STUDIO
                </button>
              )}
              
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <span className="text-xl">ℹ️</span>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    {isHost 
                      ? "As the studio owner, you have control over the session start. Ensure all artists are ready before initiating." 
                      : "Please confirm your presence by marking yourself as ready. The studio owner will start the session shortly."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Technical Config</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rotations</span>
                <div className="flex items-center gap-4">
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ rounds: Math.max(1, totalRounds - 1) })}
                      className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <span className="text-slate-400">-</span>
                    </button>
                  )}
                  <span className="font-mono font-black text-white">{totalRounds} ROUNDS</span>
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ rounds: Math.min(10, totalRounds + 1) })}
                      className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <span className="text-slate-400">+</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Window</span>
                <div className="flex items-center gap-4">
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ drawTime: Math.max(15, drawTime - 15) })}
                      className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <span className="text-slate-400">-</span>
                    </button>
                  )}
                  <span className="font-mono font-black text-white">{drawTime}s / T</span>
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ drawTime: Math.min(240, drawTime + 15) })}
                      className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <span className="text-slate-400">+</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</span>
                <span className="font-mono font-black text-white italic">
                  {isPublic ? 'PUBLIC ACCESS' : 'INVITE ONLY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
