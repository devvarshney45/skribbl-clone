// Canvas.tsx
// High-performance drawing engine with tactile pro-game aesthetics.

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
        
        // Logical Coordinate Fix: Always use 800x600 internally
        // CSS (w-full h-full) handles the visual display scaling
        if (canvasRef.current.width !== 800 || canvasRef.current.height !== 600) {
            canvasRef.current.width = 800;
            canvasRef.current.height = 600;
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
      className={`w-full h-full relative group transition-all duration-700 bg-bg-main/20 ${
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

      {/* Tactical Overlays */}
      {!isMyTurn && phase === 'drawing' && (
        <div className="absolute top-6 left-6 pointer-events-none animate-pop-in group-hover:opacity-40 transition-opacity">
           <div className="flex items-center gap-3 bg-bg-panel/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-tactile">
              <div className="relative">
                 <div className="w-2.5 h-2.5 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {drawer?.name} is Creating...
              </span>
           </div>
        </div>
      )}

      {/* Grid Overlay for technical feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};

export default Canvas;
