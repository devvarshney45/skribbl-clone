// Canvas.tsx
// High-performance drawing engine with premium aesthetics.

import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import useCanvas from '../hooks/useCanvas';

const Canvas: React.FC = () => {
  const { phase, currentDrawerId, playerId, players } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMyTurn = playerId === currentDrawerId && (phase === 'drawing' || phase === 'choosing');
  const drawer = players.find(p => p.id === currentDrawerId);

  const { initCanvas, redraw, startDrawing, draw, endDrawing } = useCanvas(canvasRef);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const resize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        if (canvasRef.current.width !== rect.width || canvasRef.current.height !== rect.height) {
            canvasRef.current.width = rect.width;
            canvasRef.current.height = rect.height;
            initCanvas();
            redraw();
        }
      };

      const observer = new ResizeObserver(resize);
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [initCanvas]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative group transition-all duration-700 bg-[#ffffff05] ${
        isMyTurn ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={isMyTurn ? startDrawing : undefined}
        onMouseMove={isMyTurn ? draw : undefined}
        onMouseUp={isMyTurn ? endDrawing : undefined}
        onMouseOut={isMyTurn ? endDrawing : undefined}
        onTouchStart={isMyTurn ? startDrawing : undefined}
        onTouchMove={isMyTurn ? draw : undefined}
        onTouchEnd={isMyTurn ? endDrawing : undefined}
        className="block touch-none w-full h-full"
      />

      {/* Dynamic Overlays */}
      {!isMyTurn && phase === 'drawing' && (
        <div className="absolute top-8 left-8 pointer-events-none animate-fade-in group-hover:opacity-40 transition-opacity">
           <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-3xl">
              <div className="relative">
                 <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                 <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-indigo-500 blur-sm animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {drawer?.name} is sketching...
              </span>
           </div>
        </div>
      )}

      {phase === 'choosing' && !isMyTurn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center animate-fade-in bg-black/20 backdrop-blur-sm">
           <div className="relative mb-10">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center shadow-inner ring-1 ring-white/5">
                 <span className="text-5xl animate-bounce">🖌️</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-xl ring-4 ring-[#03040b]">✨</div>
           </div>
           <h3 className="text-2xl font-black italic text-white mb-3 uppercase tracking-tighter">Manifesting Artistic Focus</h3>
           <p className="max-w-[280px] text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-relaxed opacity-60">
             The designated director is navigating the word spectrum. Prepare for input.
           </p>
        </div>
      )}

      {/* Grid Overlay for technical feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};

export default Canvas;
