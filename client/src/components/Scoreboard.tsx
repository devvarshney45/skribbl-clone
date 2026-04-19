// Scoreboard.tsx
// Redesigned with a premium "Leaderboard" look.

import React from 'react';
import { useGame } from '../context/GameContext';

const Scoreboard: React.FC = () => {
  const { players, currentDrawerId } = useGame();

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          Ranking
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-black tracking-tighter">LIVE</span>
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId;
          const rankColor = index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600';
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                isDrawer ? 'bg-indigo-600/10 border border-indigo-500/20' : 'bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-sm font-black italic w-4 text-center ${rankColor}`}>
                  #{index + 1}
                </span>
                
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                    isDrawer ? 'bg-indigo-600' : 'bg-white/10'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  {isDrawer && (
                     <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 rounded-full p-1 ring-2 ring-[#03040b]">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                     </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-black text-white flex items-center gap-2">
                    {player.name}
                  </div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                    {isDrawer ? '🎨 DRAWING' : player.hasGuessedCorrectly ? '✅ SOLVED' : '🤔 THINKING'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-white tabular-nums">
                  {player.score}
                </div>
                <div className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">POINTS</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Summary */}
      <div className="p-4 border-t border-white/5 bg-white/2">
         <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Total Players: <span className="text-slate-400">{players.length}</span>
         </div>
      </div>
    </div>
  );
};

export default Scoreboard;
