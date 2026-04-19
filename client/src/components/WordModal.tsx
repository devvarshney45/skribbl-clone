// WordModal.tsx
// Compact, high-responsive thematic curation modal.

import React from 'react';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const { phase, currentPlayerIsDrawer, wordOptions, chooseWord } = useGame();

  if (phase !== 'choosing' || !currentPlayerIsDrawer) {
    if (phase === 'choosing' && !currentPlayerIsDrawer) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-fade-in px-8">
          <div className="glass p-10 md:p-14 rounded-[2rem] border-white/5 shadow-3xl text-center flex flex-col items-center max-w-lg">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 md:mb-8 animate-pulse">🎨</div>
             <h2 className="text-xl md:text-2xl font-black text-white mb-4 italic tracking-tight">Artist is Curating...</h2>
             <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                The session director is selecting the thematic focus.
             </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/95 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-3xl text-center relative pointer-events-auto">
        
        <div className="mb-10 md:mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full border border-white/5 opacity-80 scale-90 md:scale-100">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
             <span className="text-[8px] md:text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
                Artistic Direction
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic text-gradient tracking-tighter mb-4 leading-none">
            CHOOSE YOUR <span className="text-slate-800">SUBJECT</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4">
          {wordOptions.map((word, index) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              className="glass p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 text-white/90 text-lg md:text-xl font-black tracking-tight transition-all duration-300 hover:bg-indigo-600 hover:border-indigo-500/50 hover:scale-[1.03] active:scale-95 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-4 group-hover:text-white/50 italic">Option {index + 1}</div>
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordModal;
