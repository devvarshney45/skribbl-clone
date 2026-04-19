// Room.tsx
// Redesigned with a compact, high-performance studio layout.
// Fits all configurations on one screen without vertical overflow issues.

import React from 'react';
import { useGame } from '../context/GameContext';

const Room: React.FC = () => {
  const { 
    roomCode, 
    players, 
    playerId, 
    settings, 
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
    updateSettings({ ...settings, [key]: value });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Studio Access Code copied to clipboard!');
  };

  const inviteLink = `${window.location.origin}?code=${roomCode}`;

  return (
    <div className="min-h-screen h-[100dvh] bg-mesh p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="w-full max-w-7xl h-full max-h-[900px] flex flex-col gap-6 animate-fade-in relative z-10">
        
        {/* Header - Compact */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 glass rounded-full border border-white/5 opacity-70 scale-90 md:scale-100">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[8px] font-black tracking-[0.4em] text-indigo-400 uppercase">Session Lounge</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-none">
              SKRIBBL <span className="text-indigo-600 opacity-50">STUDIO</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="glass px-6 py-3 rounded-2xl border-white/5 flex flex-col items-center shadow-xl">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Access Code</span>
                <span className="text-2xl font-mono font-black text-indigo-400 tracking-[0.2em] leading-none">{roomCode}</span>
             </div>
             <div className="flex flex-col gap-2">
                <button onClick={copyCode} className="px-5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest transition-all border border-white/5">Copy Code</button>
                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="px-5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[8px] font-black uppercase tracking-widest transition-all border border-indigo-500/10">Invite Link</button>
             </div>
          </div>
        </header>

        {/* Main Interface Grid */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Column: Artists Connected (4 cols) */}
          <section className="lg:col-span-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-4 mb-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Artists Connected</h2>
              <span className="bg-indigo-600/10 text-indigo-400 text-[9px] font-black px-3 py-1 rounded-full border border-indigo-500/10">{players.length} / 12</span>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {players.map((player) => (
                <div key={player.id} className={`glass p-3 rounded-2xl border-white/5 flex items-center justify-between transition-all ${player.id === playerId ? 'bg-indigo-600/10 ring-1 ring-indigo-500/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-indigo-400 relative">
                       {player.name[0].toUpperCase()}
                       {player.isHost && <div className="absolute -top-1 -right-1 text-[10px]" title="Studio Owner">👑</div>}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-2">
                        {player.name}
                        {player.id === playerId && <span className="text-[7px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded uppercase">You</span>}
                      </div>
                      <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{player.isHost ? 'Studio Owner' : 'Exhibitor'}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${player.isReady ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    {player.isReady ? 'READY' : 'PREPARING'}
                  </div>
                </div>
              ))}
              
              {/* Empty state slots for layout stability */}
              {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, i) => (
                <div key={i} className="bg-white/1 border border-white/2 border-dashed h-16 rounded-2xl flex items-center justify-center opacity-30">
                   <div className="w-10 h-10 rounded-xl border border-white/10" />
                </div>
              ))}
            </div>
          </section>

          {/* Center Column: Global Parameters & Control (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            {/* Session Control */}
            <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
               <div className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-6 animate-pulse">Session Logistics</div>
               
               <div className="flex items-center gap-10 mb-10">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{readyCount}</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Ready</span>
                  </div>
                  <div className="h-10 w-px bg-white/5" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-500">{players.length}</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Total</span>
                  </div>
               </div>

               <button 
                  onClick={startGame}
                  disabled={!canStart}
                  className={`w-full py-5 rounded-2xl font-black text-xs tracking-[0.4em] transition-all shadow-2xl ${
                    canStart 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                  }`}
               >
                 {isHost ? 'INITIATE STUDIO' : 'AWAITING OWNER'}
               </button>
               
               <p className="mt-4 text-[8px] font-bold text-slate-700 uppercase leading-relaxed max-w-[180px]">
                 {players.length < 2 ? 'Minimum 2 artists required to catalyze session' : 'Awaiting final synchronizations'}
               </p>
            </div>

            {/* Visibility Dashboard */}
            <div className="glass p-6 rounded-[2.5rem] border-white/5">
                <div className="flex items-center justify-between mb-2 px-2">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Visibility Mode</span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${isPublic ? 'text-indigo-400' : 'text-slate-600'}`}>{isPublic ? 'DISCOVERABLE' : 'PRIVATE'}</span>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => handleSettingChange('isPublic', true)}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black transition-all ${isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >PUBLIC</button>
                    <button 
                        onClick={() => handleSettingChange('isPublic', false)}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black transition-all ${!isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >PRIVATE</button>
                </div>
            </div>
          </section>

          {/* Right Column: Execution Parameters (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
             <div className="glass flex-grow p-8 rounded-[2.5rem] flex flex-col border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center">Execution Parameters</h3>
                
                <div className="space-y-10">
                   {/* Rounds Slider */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-white uppercase tracking-widest">Rotations</span>
                         <span className="text-xl font-black text-indigo-400 font-mono">{settings.rounds}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => handleSettingChange('rounds', Math.max(1, settings.rounds - 1))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">−</button>
                         <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                            <div className="absolute left-0 top-0 h-full bg-indigo-600" style={{ width: `${(settings.rounds / 10) * 100}%` }} />
                         </div>
                         <button onClick={() => handleSettingChange('rounds', Math.min(10, settings.rounds + 1))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">+</button>
                      </div>
                   </div>

                   {/* Time Slider */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-white uppercase tracking-widest">Inspiration Window</span>
                         <span className="text-xl font-black text-indigo-400 font-mono">{settings.drawTime}s</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => handleSettingChange('drawTime', Math.max(30, settings.drawTime - 10))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">−</button>
                         <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                            <div className="absolute left-0 top-0 h-full bg-indigo-600" style={{ width: `${((settings.drawTime - 30) / 150) * 100}%` }} />
                         </div>
                         <button onClick={() => handleSettingChange('drawTime', Math.min(180, settings.drawTime + 10))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">+</button>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-10 text-center opacity-30">
                   <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-loose">
                      Protocol v2.4 Studio Edit<br/>Neural Sync Enabled
                   </p>
                </div>
             </div>
          </section>

        </main>

        {/* Footer info - Mobile responsive */}
        <footer className="text-center opacity-40">
           <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Integrated Multiplayer Architecture &bull; 2024 Studio Edition</p>
        </footer>
      </div>
    </div>
  );
};

export default Room;
