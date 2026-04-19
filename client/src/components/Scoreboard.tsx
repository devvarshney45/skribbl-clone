// Scoreboard.tsx
// Redesigned with a high-end competitive ranking aesthetic.
// Features elegant typography, player status indicators, and sleek interactions.

import React from 'react';
import { useGame } from '../context/GameContext';

const Scoreboard: React.FC = () => {
  const { players, currentDrawerId, playerId } = useGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass h-full rounded-[2.5rem] flex flex-col border-white/5 shadow-3xl overflow-hidden animate-fade-in relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-8 py-7 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                Live Ranking
               <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-500/20">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[8px] font-black tracking-tighter uppercase">Syncing</span>
               </div>
            </h2>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-grow overflow-y-auto px-5 py-6 space-y-4 custom-scrollbar">
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId;
          const isMe = player.id === playerId;
          
          // Medals / Colors for top 3
          let medalEmoji = '';
          let rankColor = 'text-slate-600';
          let borderGlow = 'border-transparent';
          
          if (index === 0) {
              medalEmoji = '🥇';
              rankColor = 'text-amber-400';
              borderGlow = 'border-amber-400/20';
          } else if (index === 1) {
              medalEmoji = '🥈';
              rankColor = 'text-slate-200';
              borderGlow = 'border-slate-400/20';
          } else if (index === 2) {
              medalEmoji = '🥉';
              rankColor = 'text-orange-400';
              borderGlow = 'border-orange-400/20';
          }
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-5 rounded-[1.75rem] transition-all duration-500 border relative group overflow-hidden ${
                isMe ? 'bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-600/5' : `bg-white/2 ${borderGlow}`
              }`}
            >
              {/* Highlight background for the drawer */}
              {isDrawer && (
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500 animate-pulse" />
              )}

              <div className="flex items-center gap-5 relative z-10">
                <div className="flex flex-col items-center justify-center w-6">
                    <span className={`text-[10px] font-black italic tracking-tighter ${rankColor}`}>
                        {medalEmoji || `#${index + 1}`}
                    </span>
                </div>
                
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-inner transition-transform group-hover:scale-110 duration-500 ${
                    isDrawer ? 'bg-indigo-600 text-white shadow-indigo-600/40' : 'bg-white/10 text-white/90'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  {isDrawer && (
                     <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1.5 ring-4 ring-[#03040b]">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                     </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-black text-white/90 flex items-center gap-2.5">
                    {player.name}
                    {isMe && (
                        <div className="text-[8px] bg-white/10 px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter text-slate-400">Owner</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className={`text-[9px] font-black uppercase tracking-widest ${
                         isDrawer ? 'text-indigo-400' : player.hasGuessedCorrectly ? 'text-emerald-400' : 'text-slate-600'
                     }`}>
                        {isDrawer ? 'Studio Artist' : player.hasGuessedCorrectly ? 'Solved' : 'Analyzing'}
                     </div>
                     {player.hasGuessedCorrectly && (
                         <div className="w-1 h-1 rounded-full bg-emerald-500" />
                     )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end relative z-10">
                <div className="text-lg font-black text-white tabular-nums drop-shadow-sm">
                  {player.score.toLocaleString()}
                </div>
                <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] mt-0.5">Points</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-8 py-5 border-t border-white/5 bg-white/1 text-center">
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Studio Capacity: {players.length} / 12 Members</span>
      </div>
    </div>
  );
};

export default Scoreboard;
