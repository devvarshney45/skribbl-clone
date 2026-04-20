import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SketchBackground from '../components/SketchBackground';

const Room: React.FC = () => {
  const { 
    roomCode, 
    players, 
    playerId, 
    totalRounds,
    drawTime,
    updateSettings, 
    startGame,
    markReady,
    isPrivate,
    kickPlayer,
    claimHost,
    addBot,
    isDisconnected,
  } = useGame();

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.isHost || false;
  const isReady = me?.isReady || false;
  const readyCount = players.filter(p => p.isReady).length;
  const allReady = readyCount === players.length && players.length >= 2;
  const canStart = isHost && allReady;

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    if (!isHost) return;
    updateSettings({ [key]: value } as any);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!canStart || isStarting) return;
    setIsStarting(true);
    startGame();
  };

  return (
    <div className="min-h-[100dvh] w-screen bg-mesh-pro flex flex-col font-sans relative overflow-x-hidden overflow-y-auto selection:bg-brand-primary/30">
      
      {/* 1. Global Background Animation */}
      <SketchBackground />

      {/* 2. Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20 animate-pop-in relative">
          <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white leading-none">
                SKRIBBL<span className="text-brand-primary">.</span>IO <span className="text-brand-secondary opacity-50 ml-1 text-sm md:text-lg">ARENA</span>
              </h1>
              <div className="flex items-center gap-2 mt-1 px-2 py-0.5 bg-white/5 rounded-full border border-white/5 w-fit">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isPrivate ? 'bg-rose-500' : 'bg-brand-secondary'}`} />
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{isPrivate ? 'Private Studio' : 'Public Discovery'}</span>
              </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Invite Link</span>
                <span className="font-mono text-lg md:text-xl font-black text-brand-secondary tracking-[0.2em] leading-none">{roomCode}</span>
             </div>
             <button
               onClick={copyRoomCode}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all border ${
                 copied
                   ? 'bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30'
                   : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
               }`}
             >
               {copied ? '✓ COPIED' : 'COPY'}
             </button>
          </div>
      </header>

      {/* 3. Main Dashboard Layout */}
      <main className="flex-grow flex flex-col lg:flex-row p-4 md:p-6 lg:p-8 z-10 gap-6">
          
          {/* A. Hero Center (Matching Engine) */}
          <section className="flex-grow flex flex-col items-center justify-center relative min-h-0 animate-fade-in order-2 lg:order-1">
              <div className="relative w-full max-w-2xl aspect-square lg:aspect-video flex items-center justify-center">
                  
                  {/* Matching Radar Pulse */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[50%] h-[50%] border-2 border-brand-primary/10 rounded-full animate-ping" />
                      <div className="absolute w-[70%] h-[70%] border border-brand-secondary/10 rounded-full animate-ping" style={{ animationDelay: '500ms' }} />
                      <div className="absolute w-[30%] h-[30%] bg-gradient-to-br from-brand-primary/5 to-transparent rounded-full blur-2xl animate-pulse" />
                  </div>

                  <div className="flex flex-col items-center text-center z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5 mb-6">
                         <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] animate-pulse">Establishing Signal</span>
                      </div>
                      <div className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] leading-none select-none">
                        {readyCount}<span className="text-slate-800 mx-2 text-6xl">/</span><span className="text-slate-500 text-6xl">{players.length}</span>
                      </div>
                      <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em] mt-8 bg-white/5 px-6 py-2 rounded-full border border-white/5">
                        {allReady ? 'Authorization Complete' : `Waiting for ${players.length - readyCount} Exhibitors`}
                      </p>
                  </div>
              </div>
          </section>

          {/* B. Right Sidebar (Players Desk) */}
          <aside className="w-full lg:w-[400px] flex flex-col gap-4 animate-slide-up order-1 lg:order-2">
              <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Artists</h3>
                    {isHost && players.length < 12 && (
                      <button 
                        onClick={() => addBot()}
                        className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm shadow-brand-primary/20 hover:bg-brand-primary/20 hover:scale-105 transition-all active:scale-95"
                      >
                        + Add Bot 🤖
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-brand-secondary px-2 py-0.5 bg-brand-secondary/10 rounded-md border border-brand-secondary/20">{players.length} / 12</span>
              </div>
              
              <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-2.5 pb-4">
                  {players.map(p => (
                      <div key={p.id} className={`glass-pro p-3.5 rounded-[1.5rem] flex items-center justify-between transition-all group ${p.id === playerId ? 'border-brand-primary shadow-lg shadow-brand-primary/10 bg-brand-primary/5' : 'hover:bg-white/5 border-white/5'}`}>
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 panel rounded-xl flex items-center justify-center font-black text-brand-secondary text-lg border-white/10">
                                  {p.name[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-sm font-black text-white/95 truncate max-w-[120px]">{p.name} {p.id === playerId && '(You)'}</span>
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.isHost ? '👑 Host' : 'Artist'}</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest border transition-all ${p.isReady ? 'bg-brand-secondary text-bg-main border-brand-secondary' : 'bg-white/2 text-slate-700 border-white/10'}`}>
                                  {p.isReady ? 'READY' : 'WAIT'}
                              </div>
                              {/* Host-only kick button */}
                              {isHost && p.id !== playerId && (
                                <button
                                  onClick={() => kickPlayer(p.id)}
                                  title={`Remove ${p.name}`}
                                  className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-all active:scale-90"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              {/* Claim Host button if current host is offline */}
                              {!isHost && p.isHost && isDisconnected && (
                                <button
                                  onClick={() => claimHost()}
                                  title="Claim Host Role"
                                  className="px-2 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-[8px] uppercase tracking-widest hover:bg-yellow-500/20 transition-all active:scale-90"
                                >
                                  Claim
                                </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </aside>
      </main>

      {/* 4. Bottom Horizontal Toolbelt */}
      <div className="w-full px-4 pb-4 md:px-8 md:pb-8 z-20 animate-slide-up">
          <div className="bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-4 md:p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
              
          {/* Settings Group */}
          <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-12 flex-grow w-full">
              
              {/* Rounds Control */}
              <div className="flex flex-col gap-1 w-full xl:w-auto xl:min-w-[200px]">
                  <div className="flex items-center justify-between px-1">
                      <span className="text-[8px] xl:text-[9px] font-black text-slate-500 uppercase tracking-widest">Exhibition Rounds</span>
                      <span className="text-base xl:text-lg font-black text-brand-secondary font-mono italic">{totalRounds}</span>
                  </div>
                  <div className="flex items-center gap-3 xl:gap-4">
                      <button onClick={() => handleSettingChange('rounds', Math.max(1, totalRounds-1))} disabled={!isHost} className={`w-8 h-8 xl:w-10 xl:h-10 panel rounded-xl flex items-center justify-center transition-all ${!isHost ? 'opacity-20 grayscale' : 'hover:bg-white/10 active:scale-90 border-white/10'}`}>−</button>
                      <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700" style={{ width: `${(totalRounds / 10) * 100}%` }} />
                      </div>
                      <button onClick={() => handleSettingChange('rounds', Math.min(10, totalRounds+1))} disabled={!isHost} className={`w-8 h-8 xl:w-10 xl:h-10 panel rounded-xl flex items-center justify-center transition-all ${!isHost ? 'opacity-20 grayscale' : 'hover:bg-white/10 active:scale-90 border-white/10'}`}>+</button>
                  </div>
              </div>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden xl:block w-[1px] h-10 bg-white/5" />

              {/* Time Control */}
              <div className="flex flex-col gap-1 w-full xl:w-auto xl:min-w-[200px]">
                  <div className="flex items-center justify-between px-1">
                      <span className="text-[8px] xl:text-[9px] font-black text-slate-500 uppercase tracking-widest">Drawing window</span>
                      <span className="text-base xl:text-lg font-black text-brand-secondary font-mono italic">{drawTime}s</span>
                  </div>
                  <div className="flex items-center gap-3 xl:gap-4">
                      <button onClick={() => handleSettingChange('drawTime', Math.max(30, drawTime-10))} disabled={!isHost} className={`w-8 h-8 xl:w-10 xl:h-10 panel rounded-xl flex items-center justify-center transition-all ${!isHost ? 'opacity-20 grayscale' : 'hover:bg-white/10 active:scale-90 border-white/10'}`}>−</button>
                      <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700" style={{ width: `${((drawTime - 30) / 150) * 100}%` }} />
                      </div>
                      <button onClick={() => handleSettingChange('drawTime', Math.min(180, drawTime+10))} disabled={!isHost} className={`w-8 h-8 xl:w-10 xl:h-10 panel rounded-xl flex items-center justify-center transition-all ${!isHost ? 'opacity-20 grayscale' : 'hover:bg-white/10 active:scale-90 border-white/10'}`}>+</button>
                  </div>
              </div>
          </div>

          {/* Action Group */}
          <div className="w-full xl:w-auto flex items-center justify-between xl:justify-end gap-4 border-t xl:border-t-0 xl:border-l border-white/10 pt-4 xl:pt-0 xl:pl-8">
              <div className="flex flex-col items-start xl:items-end flex-grow">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Authorized Signal</span>
                  <span className={`text-[8px] xl:text-[10px] font-black ${allReady ? 'text-brand-secondary' : 'text-rose-500/50'}`}>
                    {allReady ? 'ARENA READY' : 'SYNC PLAYERS'}
                  </span>
              </div>
                  
                  {isHost ? (
                    <button 
                        onClick={handleStartGame} disabled={!canStart || isStarting}
                        className={`px-12 py-5 rounded-2xl font-black text-xs tracking-[0.6em] btn-game shadow-tactile-heavy transition-all ${canStart && !isStarting ? 'bg-brand-primary text-white hover:scale-[1.05] active:scale-95 shadow-brand-primary/30 outline outline-brand-primary/20' : 'bg-white/5 text-slate-800 cursor-not-allowed opacity-50'}`}
                    >
                        {isStarting ? '...' : 'LAUNCH ARENA'}
                    </button>
                  ) : (
                    <button 
                        onClick={markReady}
                        className={`px-12 py-5 rounded-2xl font-black text-xs tracking-[0.6em] btn-game shadow-tactile-heavy transition-all ${
                            !isReady 
                            ? 'bg-brand-secondary text-bg-main hover:scale-[1.05] active:scale-95 shadow-brand-secondary/30' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                    >
                            {isReady ? 'RECALL' : 'TRANSMIT READY'}
                    </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Room;
