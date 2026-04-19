// Room.tsx
// Final Transformation: Tactical 3-pane lobby.
// Contained within 100dvh with horizontal distribution.

import React from 'react';
import { useGame } from '../context/GameContext';

const Room: React.FC = () => {
  const { 
    roomCode, 
    players, 
    playerId, 
    totalRounds,
    drawTime,
    updateSettings, 
    startGame,
    isPublic,
  } = useGame();

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.isHost || false;
  const readyCount = players.filter(p => p.isReady).length;
  const canStart = isHost && players.length >= 2;

  const handleSettingChange = (key: string, value: any) => {
    if (!isHost) return;
    // The updateSettings in context expects the whole object
    updateSettings({ 
      rounds: key === 'rounds' ? value : totalRounds,
      drawTime: key === 'drawTime' ? value : drawTime,
      isPublic: key === 'isPublic' ? value : isPublic 
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Studio Code Copied!');
  };

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro p-4 md:p-10 flex flex-col items-center justify-between font-sans overflow-hidden">
      
      {/* 1. Global Header (Approx 10vh) */}
      <header className="w-full max-w-7xl flex items-center justify-between px-4 animate-pop-in">
        <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">
              STUDIO<span className="text-brand-secondary opacity-50 ml-1">LOUNGE</span>
            </h1>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-0.5">Synchronization in progress</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Access Channel</span>
                <span className="font-mono text-xl md:text-2xl font-black text-brand-secondary tracking-[0.2em] leading-none">{roomCode}</span>
            </div>
            <button onClick={copyCode} className="panel-card px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Copy</button>
        </div>
      </header>

      {/* 2. Main Tactical Pane (Approx 80vh) */}
      <main className="w-full max-w-7xl flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden py-6">
        
        {/* Left: Artists (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col h-full overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4 px-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Connected Artists</span>
                <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-3 py-1 rounded-full">{players.length}/12</span>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {players.map(p => (
                    <div key={p.id} className={`panel-card p-3 rounded-2xl flex items-center justify-between transition-all ${p.id === playerId ? 'border-brand-primary/40 bg-brand-primary/5' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 panel-card rounded-xl flex items-center justify-center font-black text-brand-secondary">
                                {p.name[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white/95 truncate max-w-[120px]">{p.name} {p.id === playerId && '(You)'}</span>
                                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{p.isHost ? 'Session Host' : 'Contributor'}</span>
                            </div>
                        </div>
                        <div className={`px-4 py-1 rounded-lg text-[8px] font-black tracking-widest border ${p.isReady ? 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20' : 'bg-white/2 text-slate-700 border-white/5'}`}>
                            {p.isReady ? 'READY' : 'WAITING'}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Center: Deployment (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="panel flex-grow p-8 rounded-[3rem] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-secondary transition-all" style={{ width: `${(readyCount / Math.max(1, players.length)) * 100}%` }} />
                </div>
                
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10">Neural Trigger</h3>
                
                <div className="text-6xl font-black text-white italic tracking-tighter mb-4">{readyCount}<span className="text-slate-800 mx-2">/</span><span className="text-slate-500">{players.length}</span></div>
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-10 italic">Creators Synchronized</p>

                <button 
                    onClick={startGame} disabled={!canStart}
                    className={`w-full py-6 rounded-2xl font-black text-xs tracking-[0.4em] btn-game shadow-tactile-heavy transition-all ${canStart ? 'bg-brand-primary text-white' : 'bg-white/5 text-slate-800'}`}
                >
                    {isHost ? 'INITIATE EXHIBITION ➔' : 'AWAITING DISPATCH'}
                </button>
            </div>

            <div className="panel p-6 rounded-[2.5rem] flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Visibility</span>
                    <span className={`text-[8px] font-black italic tracking-widest ${isPublic ? 'text-brand-secondary' : 'text-slate-700'}`}>{isPublic ? 'DISCOVERABLE' : 'ENCRYPTED'}</span>
                </div>
                <div className="flex bg-bg-card p-1 rounded-xl border border-white/5">
                    <button onClick={() => handleSettingChange('isPublic', true)} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-600'}`}>PUBLIC</button>
                    <button onClick={() => handleSettingChange('isPublic', false)} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${!isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-600'}`}>PRIVATE</button>
                </div>
            </div>
        </section>

        {/* Right: Tactics (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col h-full animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="panel p-8 md:p-10 rounded-[3rem] h-full flex flex-col gap-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center mb-4">Execution Config</h3>
                
                <div className="space-y-12">
                   {/* Rounds */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rotations</span>
                         <span className="text-2xl font-black text-brand-secondary font-mono">{totalRounds}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => handleSettingChange('rounds', Math.max(1, totalRounds-1))} className="w-10 h-10 panel-card rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-95 text-lg">−</button>
                         <div className="flex-grow h-1.5 bg-bg-main rounded-full overflow-hidden relative">
                            <div className="absolute left-0 top-0 h-full bg-brand-primary" style={{ width: `${(totalRounds / 10) * 100}%` }} />
                         </div>
                         <button onClick={() => handleSettingChange('rounds', Math.min(10, totalRounds+1))} className="w-10 h-10 panel-card rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-95 text-lg">+</button>
                      </div>
                   </div>

                   {/* Time */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inspiration Window</span>
                         <span className="text-2xl font-black text-brand-secondary font-mono">{drawTime}s</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => handleSettingChange('drawTime', Math.max(30, drawTime-10))} className="w-10 h-10 panel-card rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-95 text-lg">−</button>
                         <div className="flex-grow h-1.5 bg-bg-main rounded-full overflow-hidden relative">
                            <div className="absolute left-0 top-0 h-full bg-brand-primary" style={{ width: `${((drawTime - 30) / 150) * 100}%` }} />
                         </div>
                         <button onClick={() => handleSettingChange('drawTime', Math.min(180, drawTime+10))} className="w-10 h-10 panel-card rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-95 text-lg">+</button>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-10 text-center opacity-30 flex flex-col gap-2">
                   <div className="flex items-center justify-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                   </div>
                   <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em]">Protocol v2.5.0 Studio Patch</p>
                </div>
            </div>
        </section>
      </main>

      {/* 3. Global Footer (Approx 10vh) */}
      <footer className="w-full flex items-center justify-center opacity-20 py-2">
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em]">Neural Interface Synchronized • Absolute Execution Mode</span>
      </footer>
    </div>
  );
};

export default Room;
