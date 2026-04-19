// Room.tsx (Lobby)
// Redesigned with a "Senior Level" premium studio vibe.
// Added isPublic toggle and refined session controls.

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

  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  const handleCopy = (type: 'code' | 'link') => {
    const text = type === 'code' ? roomCode : `${window.location.origin}/?code=${roomCode}`;
    navigator.clipboard.writeText(text);
    setCopyState(type);
    setTimeout(() => setCopyState('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-mesh p-6 lg:p-12 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header Section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-end mb-12 gap-8 animate-fade-in relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Session Lounge</span>
          </div>
          <h1 className="text-6xl font-black italic text-gradient leading-none">
            SKRIBBL <span className="text-slate-800">STUDIO</span>
          </h1>
        </div>

        {/* Room Code Card */}
        <div className="glass px-10 py-6 rounded-[2.5rem] flex items-center gap-12 border-white/5 shadow-3xl relative overflow-hidden group transition-all hover:border-white/10">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Access Code</span>
            <span className="text-4xl font-mono font-black tracking-[0.25em] text-white">
              {roomCode}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleCopy('code')}
              className={`text-[9px] font-black px-5 py-2.5 rounded-2xl tracking-widest transition-all ${
                copyState === 'code' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              {copyState === 'code' ? 'COPIED' : 'COPY CODE'}
            </button>
            <button 
              onClick={() => handleCopy('link')}
              className={`text-[9px] font-black px-5 py-2.5 rounded-2xl tracking-widest transition-all ${
                copyState === 'link' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-indigo-400'
              }`}
            >
              {copyState === 'link' ? 'LINK SAVED' : 'INVITE LINK'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in delay-100 relative z-10">
        {/* Players List Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2 px-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
              Artists Connected 
              <span className="bg-indigo-500/10 text-indigo-400 px-3.5 py-1 rounded-lg text-[10px] font-black">
                {players.length} / 12
              </span>
            </h2>
            <span className="text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">Min 2 required to start</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`glass p-6 rounded-3xl flex items-center justify-between group transition-all duration-500 glass-hover ${
                  player.id === playerId ? 'ring-1 ring-indigo-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-2xl relative ${
                    player.isHost 
                    ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white' 
                    : 'bg-white/10 text-white'
                  }`}>
                    {player.name[0].toUpperCase()}
                    {player.isHost && (
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-[10px] p-1 rounded-lg">👑</div>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-base flex items-center gap-2.5 text-white/90">
                      {player.name}
                      {player.id === playerId && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-500/10 font-black">YOU</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                      {player.isHost ? 'Studio Owner' : 'Creative Force'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {player.isReady ? (
                    <div className="flex items-center gap-2.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-5 py-2.5 rounded-2xl border border-indigo-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      READY
                    </div>
                  ) : (
                    <div className="bg-white/5 text-slate-600 text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase italic tracking-[0.2em]">
                      PENDING
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots for visual balance */}
            {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
              <div key={i} className="border-2 border-dashed border-white/5 rounded-3xl p-6 flex items-center gap-5 opacity-10">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/10" />
                <div className="space-y-2.5">
                  <div className="w-32 h-2.5 bg-white/10 rounded-full" />
                  <div className="w-20 h-1.5 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Sidebar Section */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden border-white/5">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Session Control</h2>
            
            <div className="space-y-8">
              {!isHost ? (
                <button
                  onClick={markReady}
                  disabled={me?.isReady}
                  className={`w-full py-6 rounded-2xl font-black text-sm tracking-[0.25em] transition-all shadow-3xl ${
                    me?.isReady 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 cursor-default opacity-50' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 scale-100 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {me?.isReady ? 'READY CONFIRMED' : 'REVEAL PRESENCE'}
                </button>
              ) : (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full py-6 rounded-2xl font-black text-sm tracking-[0.25em] bg-indigo-600 hover:bg-indigo-500 text-white shadow-3xl shadow-indigo-600/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none"
                >
                  INITIATE STUDIO
                </button>
              )}
              
              <div className="bg-indigo-500/5 rounded-2xl p-6 border border-white/5">
                <div className="flex items-start gap-5">
                  <span className="text-2xl">⚡</span>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed tracking-wide">
                    {isHost 
                      ? "The owner has final control. Wait for all creators to align their readiness before starting." 
                      : "Engage your readiness status. The session director will begin when the crew is complete."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border-white/5">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Technical Parameters</h2>
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-white/2 px-5 py-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rotations</span>
                <div className="flex items-center gap-5">
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ rounds: Math.max(1, totalRounds - 1) })}
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                    >
                      <span className="text-slate-400 font-bold">-</span>
                    </button>
                  )}
                  <span className="font-mono font-black text-white text-xs">{totalRounds} ROUNDS</span>
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ rounds: Math.min(10, totalRounds + 1) })}
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                    >
                      <span className="text-slate-400 font-bold">+</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/2 px-5 py-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interval</span>
                <div className="flex items-center gap-5">
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ drawTime: Math.max(15, drawTime - 15) })}
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                    >
                      <span className="text-slate-400 font-bold">-</span>
                    </button>
                  )}
                  <span className="font-mono font-black text-white text-xs">{drawTime} SEC / T</span>
                  {isHost && (
                    <button 
                      onClick={() => updateSettings({ drawTime: Math.min(240, drawTime + 15) })}
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                    >
                      <span className="text-slate-400 font-bold">+</span>
                    </button>
                  )}
                </div>
              </div>

              {/* isPublic Toggle - Fixes requested bug */}
              <div className="flex justify-between items-center bg-white/2 px-5 py-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</span>
                <div className="flex items-center gap-4">
                  {isHost ? (
                      <button 
                        onClick={() => updateSettings({ isPublic: !isPublic })}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all tracking-widest ${
                            isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isPublic ? 'PUBLIC ACCESS' : 'INVITE ONLY'}
                      </button>
                  ) : (
                      <span className="font-mono font-black text-white text-[10px] italic">
                        {isPublic ? 'PUBLIC ACCESS' : 'INVITE ONLY'}
                      </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
