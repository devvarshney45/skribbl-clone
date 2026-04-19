// WordModal.tsx
// High-fidelity word selection for the drawer.

import React from 'react';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const { phase, currentPlayerIsDrawer, wordOptions, chooseWord } = useGame();

  if (phase !== 'choosing') return null;

  if (!currentPlayerIsDrawer) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-main/90 backdrop-blur-md animate-fade-in pointer-events-none">
        <div className="panel p-12 md:p-16 rounded-[4rem] text-center flex flex-col items-center max-w-lg relative overflow-hidden bg-bg-panel/50 border-white/5 shadow-3xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
           <div className="w-20 h-20 bg-brand-secondary/10 rounded-3xl flex items-center justify-center text-4xl mb-8 animate-bounce shadow-inner border border-brand-secondary/20">🎨</div>
           <h2 className="text-3xl font-black text-white mb-4 italic tracking-tight uppercase">Artist is Picking</h2>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] leading-relaxed max-w-[240px]">
              Preparing the canvas... Get ready to guess.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg-main/95 backdrop-blur-2xl animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-5xl text-center relative animate-pop-in py-10">
        
        <div className="mb-16 md:mb-24">
          <div className="inline-flex items-center gap-4 px-8 py-3 mb-10 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
             <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
             <span className="text-[11px] font-black tracking-[0.5em] text-white/80 uppercase italic">Initialization Sequence</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black italic text-white tracking-tighter mb-6 leading-none uppercase drop-shadow-2xl">
            PICK YOUR <span className="text-brand-primary">MUSE</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] mt-8">Select a word below to begin the transmission</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {wordOptions.map((word, index) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              className="group panel-card p-12 md:p-16 rounded-[3rem] border-white/5 text-white text-3xl font-black tracking-tight transition-all duration-500 hover:bg-brand-primary hover:border-white/20 hover:scale-[1.05] hover:rotate-1 active:scale-95 relative overflow-hidden shadow-2xl"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-6 group-hover:text-white/40 italic transition-colors">Vector Option {index + 1}</div>
                <span className="drop-shadow-lg">{word}</span>
                <div className="mt-8 w-10 h-1 bg-white/10 rounded-full group-hover:bg-white/40 transition-all group-hover:w-20" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordModal;
