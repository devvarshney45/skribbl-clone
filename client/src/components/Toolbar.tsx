// Toolbar.tsx
// Compact, mobile-first drawing toolkit — renders BELOW the canvas as a sticky bar.

import React from 'react';
import { useGame } from '../context/GameContext';

const COLORS = [
  '#ffffff', '#000000', '#64748b',
  '#ef4444', '#f97316', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f43f5e',
  '#a3e635', '#fb923c',
];

const SIZES = [
  { label: 'S', value: 3 },
  { label: 'M', value: 8 },
  { label: 'L', value: 16 },
  { label: 'XL', value: 32 },
];

const Toolbar: React.FC = () => {
  const { color, size, setBrushConfig, clearCanvas, undo, phase, currentPlayerIsDrawer } = useGame();
  
  const isEraser = color === '#0a0b1e';

  if (phase !== 'drawing' || !currentPlayerIsDrawer) return null;

  return (
    <div className="shrink-0 bg-bg-panel/95 backdrop-blur-3xl border-t border-white/10 px-3 py-2 md:px-6 md:py-3 flex items-center gap-3 md:gap-6 overflow-x-auto custom-scrollbar">
      
      {/* Color Palette */}
      <div className="flex items-center gap-1.5 shrink-0">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setBrushConfig({ color: c })}
            title={c}
            className={`w-6 h-6 md:w-7 md:h-7 rounded-full transition-all shrink-0 relative ${
              color === c ? 'ring-2 ring-offset-1 ring-offset-bg-panel ring-brand-secondary scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
            }`}
            style={{ backgroundColor: c === '#ffffff00' ? 'transparent' : c, border: c === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-white/10 shrink-0" />

      {/* Size Picker */}
      <div className="flex items-center gap-1.5 shrink-0">
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => setBrushConfig({ size: s.value })}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-[10px] font-black transition-all border shrink-0 ${
              size === s.value
                ? 'bg-brand-secondary text-bg-main border-brand-secondary'
                : 'bg-white/5 text-slate-500 border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-white/10 shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <button
          onClick={() => setBrushConfig({ color: '#0a0b1e' })}
          title="Eraser"
          className={`w-9 h-9 border rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            isEraser 
              ? 'bg-brand-secondary text-bg-main border-brand-secondary' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-9 3 3-9 9-9-9 3-3 9 9zM2 20h20" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11l-3 3-3-3" />
          </svg>
        </button>

        <button
          onClick={undo}
          title="Undo"
          className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/25 transition-all active:scale-90"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={clearCanvas}
          title="Clear"
          className="w-9 h-9 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
