// Scoreboard.tsx
// Redesigned for maximum spatial efficiency.
// Features a compact, sleek ranking list for sidebars.

import React from 'react';
import { useGame } from '../context/GameContext';

const Scoreboard: React.FC = () => {
  const { players, currentDrawerId, playerId } = useGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass h-full rounded-[1.5rem] md:rounded-[2rem] flex flex-col border-white/5 shadow-2xl overflow-hidden animate-fade-in relative bg-white/1">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
          Rankings
          <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
        </h2>
      </div>

      {/* Main List */}
      <div className="flex-grow overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId;
          const isMe = player.id === playerId;
          
          let rankColor = 'text-slate-600';
          let borderGlow = 'border-transparent';
          
          if (index === 0) rankColor = 'text-amber-400', borderGlow = 'border-amber-400/10';
          else if (index === 1) rankColor = 'text-slate-300', borderGlow = 'border-slate-300/10';
          else if (index === 2) rankColor = 'text-orange-400', borderGlow = 'border-orange-400/10';
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border relative group ${
                isMe ? 'bg-indigo-600/10 border-indigo-500/20' : `bg-white/2 ${borderGlow}`
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className={`text-[10px] font-black italic w-4 ${rankColor}`}>#{index + 1}</span>
                
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 ${
                    isDrawer ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-300'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  {isDrawer && (
                     <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1 ring-2 ring-bg-deep">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                     </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-black text-white/90 truncate max-w-[80px]">
                    {player.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className={`text-[7px] font-black uppercase tracking-widest ${
                         isDrawer ? 'text-indigo-400' : player.hasGuessedCorrectly ? 'text-emerald-400' : 'text-slate-700'
                     }`}>
                        {isDrawer ? 'Drawing' : player.hasGuessedCorrectly ? 'Solved' : 'Thinking'}
                     </div>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end relative z-10 px-1">
                <div className="text-xs font-black text-white tabular-nums">
                  {player.score}
                </div>
                <div className="text-[6px] font-black text-slate-700 uppercase tracking-widest">PTS</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/5 bg-white/1 text-center">
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Lobby: {players.length}/12</span>
      </div>
    </div>
  );
};

export default Scoreboard;
