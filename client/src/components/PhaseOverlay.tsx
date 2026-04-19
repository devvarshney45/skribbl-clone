// PhaseOverlay.tsx
// Cinematic transitions between game states (e.g. Round Over, Next Artist Picking).

import React from 'react';
import { useGame } from '../context/GameContext';

const PhaseOverlay: React.FC = () => {
  const { phase, round, word, currentDrawerId, players, timeLeft } = useGame();

  if (phase !== 'roundEnd') return null;

  const drawer = players.find(p => p.id === currentDrawerId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-main/90 backdrop-blur-xl animate-fade-in pointer-events-none">
      <div className="text-center max-w-2xl px-8">
        
        {phase === 'roundEnd' && (
          <div className="animate-pop-in space-y-6">
            <div className="inline-block px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4">
               Round {round} Completed
            </div>
            
            <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-2">The Word Was</h2>
            <div className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-12 drop-shadow-2xl">
              {word}
            </div>

            <div className="flex flex-col items-center gap-4 py-8 border-y border-white/5 bg-white/2 rounded-3xl">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Preparing next round</span>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseOverlay;
