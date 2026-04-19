// Canvas.tsx
// Redesigned with a focus on fitting the premium glass UI.
// Optimized for smooth drawing and professional aesthetics.

import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import useCanvas from '../hooks/useCanvas';

const Canvas: React.FC = () => {
  const { phase, currentDrawerId, playerId } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMyTurn = playerId === currentDrawerId && (phase === 'drawing' || phase === 'choosing');

  const { initCanvas, startDrawing, draw, endDrawing } = useCanvas(canvasRef);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      // Set canvas size to match the container
      const resize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initCanvas();
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, [initCanvas]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative group transition-all duration-700 ${
        isMyTurn ? 'cursor-none' : 'cursor-default'
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
        className="block touch-none"
      />

      {/* Custom Artist Cursor */}
      {isMyTurn && (
        <div className="hidden group-hover:block pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-50">
           {/* We can't easily sync cursor pos without state but we can style the default cursor or use a CSS hover effect */}
        </div>
      )}

      {/* Background decoration inside canvas card */}
      {!isMyTurn && phase === 'drawing' && (
        <div className="absolute top-6 left-6 pointer-events-none animate-fade-in">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artist is creating...</span>
           </div>
        </div>
      )}

      {phase === 'choosing' && !isMyTurn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
           <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl animate-bounce">🎨</span>
           </div>
           <h3 className="text-xl font-black italic text-white mb-2 uppercase tracking-tight">Artist is selecting</h3>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Prepare your mind. The studio session is about to begin.</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
