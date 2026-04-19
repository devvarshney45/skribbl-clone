// Toolbar.tsx
// Final Transformation: Tactile drawing kit.

import React from 'react';
import { useGame } from '../context/GameContext';

const Toolbar: React.FC = () => {
  const { color, setBrushConfig, size, clearCanvas, undo, phase, currentPlayerIsDrawer } = useGame();

  if (phase !== 'drawing' || !currentPlayerIsDrawer) return null;

  const colors = [
    '#ffffff', '#000000', '#64748b', '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ffffff00'
  ];

  const sizes = [
    { label: 'S', value: 3 },
    { label: 'M', value: 8 },
    { label: 'L', value: 16 },
    { label: 'XL', value: 32 },
  ];

  return (
    <div className="panel px-8 py-5 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-14 shadow-3xl bg-bg-panel/80 backdrop-blur-3xl animate-slide-up border-white/10 scale-90 md:scale-100 mb-6">
      
      {/* Pigments */}
      <div className="flex flex-col gap-3">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] text-center md:text-left">Pigment Palette</span>
          <div className="grid grid-cols-7 gap-2.5">
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setBrushConfig({ color: c })}
                className={`w-8 h-8 rounded-full transition-all btn-game relative overflow-hidden group/color ${
                  color === c ? 'ring-4 ring-brand-secondary/40 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c === '#ffffff00' ? 'transparent' : c }}
              >
                  {c === '#ffffff00' ? (
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_50%,#ccc_50%,#ccc_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-40" />
                  ) : (
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/color:opacity-100 transition-opacity" />
                  )}
                  {color === c && (
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${c === '#ffffff' ? 'bg-black' : 'bg-white'} shadow-sm animate-pop-in`} />
                      </div>
                  )}
              </button>
            ))}
          </div>
      </div>

      <div className="w-px h-14 bg-white/5" />

      {/* Thickness */}
      <div className="flex flex-col gap-2.5">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Stroke Width</span>
          <div className="flex items-center gap-3">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setBrushConfig({ size: s.value })}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${
                  size === s.value 
                  ? 'bg-brand-secondary text-bg-main border-brand-secondary/40 shadow-inner' 
                  : 'panel-card text-slate-500 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
      </div>

      <div className="w-px h-14 bg-white/5" />

      {/* Utils */}
      <div className="flex flex-col gap-2.5">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Execution</span>
          <div className="flex items-center gap-3">
            <button
              onClick={undo}
              title="Undo"
              className="w-11 h-11 panel-card rounded-2xl flex items-center justify-center transition-all btn-game hover:bg-white/5 text-slate-400 group"
            >
              <svg className="w-5 h-5 group-hover:text-brand-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            
            <button
              onClick={clearCanvas}
              title="Purge"
              className="w-11 h-11 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl flex items-center justify-center transition-all btn-game text-brand-accent group"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Toolbar;
