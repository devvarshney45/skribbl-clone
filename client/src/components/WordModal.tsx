// WordModal.tsx
// Final Transformation: Tactical curation overlay.

import React from 'react';
import { useGame } from '../context/GameContext';

const WordModal: React.FC = () => {
  const { phase, currentPlayerIsDrawer, wordOptions, chooseWord } = useGame();

  if (phase !== 'choosing' || !currentPlayerIsDrawer) {
    if (phase === 'choosing' && !currentPlayerIsDrawer) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg-main/90 backdrop-blur-md animate-fade-in">
          <div className="panel p-12 md:p-16 rounded-[3rem] text-center flex flex-col items-center max-w-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-brand-secondary/20" />
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-8 animate-pulse shadow-inner">🖌️</div>
             <h2 className="text-2xl font-black text-white mb-4 italic tracking-tight uppercase">Artist is Curating</h2>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                The session director is selecting the target concept. Synchronizing receptors.
             </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/95 backdrop-blur-xl animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl text-center relative animate-pop-in py-10">
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-2 mb-8 panel rounded-full border border-white/10 opacity-80">
             <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
             <span className="text-[10px] font-black tracking-[0.4em] text-brand-secondary uppercase">Thematic Focus Selection</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic text-white tracking-tighter mb-4 leading-none">
            SELECT <span className="text-brand-primary">SUBJECT</span>
          </h1>
          <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.5em] mt-6">Manifest your choice on the exhibition plane</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wordOptions.map((word, index) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              className="panel-card p-10 md:p-14 rounded-[2.5rem] border-white/5 text-white/95 text-2xl font-black tracking-tight transition-all duration-300 hover:bg-brand-primary hover:border-white/20 hover:scale-[1.03] active:scale-95 group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-4 group-hover:text-white/50 italic">Option {index + 1}</div>
                {word}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordModal;
