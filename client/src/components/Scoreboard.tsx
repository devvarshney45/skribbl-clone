// Scoreboard.tsx
// Final Transformation: Tactile minimal ranking.

import React from 'react';
import { useGame } from '../context/GameContext';

const Scoreboard: React.FC = () => {
  const { players, currentDrawerId, playerId } = useGame();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="panel h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-2xl overflow-hidden animate-slide-up bg-bg-panel/40">
      {/* Header Area */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
          Players
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
        </h2>
      </div>

      {/* High-Contrast Ranking List */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId;
          const isMe = player.id === playerId;
          
          let rankColor = 'text-slate-600';
          
          if (index === 0) rankColor = 'text-brand-highlight';
          else if (index === 1) rankColor = 'text-slate-200';
          else if (index === 2) rankColor = 'text-orange-400';
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border relative group ${
                isMe ? 'bg-brand-primary/10 border-brand-primary/30 shadow-lg' : 'bg-bg-card/40 border-white/5'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <span className={`text-[11px] font-black italic w-5 ${rankColor}`}>#{index + 1}</span>
                
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 ${
                    isDrawer ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-white/5 text-slate-300'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  {isDrawer && (
                     <div className="absolute -bottom-1 -right-1 bg-brand-secondary rounded-full p-1.5 ring-4 ring-bg-panel">
                        <svg className="w-2.5 h-2.5 text-bg-main" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                     </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white/95 truncate max-w-[90px]">{player.name}</span>
                    {!player.isOnline && (
                      <span className="bg-rose-500/20 text-rose-500 text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full border border-rose-500/20 animate-pulse">Offline</span>
                    )}
                  </div>
                  <div className={`text-[7px] font-black uppercase tracking-widest mt-1 ${
                      isDrawer ? 'text-brand-secondary' : player.hasGuessedCorrectly ? 'text-brand-secondary animate-pulse' : 'text-slate-700'
                  }`}>
                    {isDrawer ? 'Drawing' : player.hasGuessedCorrectly ? 'Guessed' : 'Guessing'}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end px-1">
                <span className="text-[13px] font-black text-white tabular-nums drop-shadow-md">{player.score}</span>
                <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">PTS</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-white/5 bg-white/1 text-center">
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">Players: {players.length}/12</span>
      </div>
    </div>
  );
};

export default Scoreboard;
