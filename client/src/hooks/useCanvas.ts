// useCanvas.ts
// Handles all drawing logic, local state, and socket synchronization.

import { useRef, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from './useSocket';

export default function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const socket = useSocket();
  const { roomCode, color, size, currentDrawerId, playerId } = useGame();
  
  // History for undo
  const history = useRef<ImageData[]>([]);
  const isDrawing = useRef(false);

  // ---------------------------------------------------------------------------
  // Canvas Helper: Get current context
  // ---------------------------------------------------------------------------
  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d', { willReadFrequently: true });
  }, [canvasRef]);

  // ---------------------------------------------------------------------------
  // Canvas Helper: Save state to history for undo
  // ---------------------------------------------------------------------------
  const saveToHistory = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.current = [...history.current.slice(-19), imageData]; // Keep last 20 strokes
    }
  }, [getCtx, canvasRef]);

  // ---------------------------------------------------------------------------
  // Init Canvas settings
  // ---------------------------------------------------------------------------
  const initCanvas = useCallback(() => {
    const ctx = getCtx();
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [getCtx]);

  // ---------------------------------------------------------------------------
  // Drawing Actions (Local + Socket)
  // ---------------------------------------------------------------------------
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!socket) return;
    
    // Save current state before new stroke
    saveToHistory();
    
    isDrawing.current = true;
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    socket.emit('draw_start', { roomCode, x, y, color, size });
  }, [socket, roomCode, color, size, getCtx, canvasRef, saveToHistory]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !socket || !canvasRef.current) return;

    const ctx = getCtx();
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
       x = e.touches[0].clientX - rect.left;
       y = e.touches[0].clientY - rect.top;
    } else {
       x = e.clientX - rect.left;
       y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw_move', { roomCode, x, y });
  }, [socket, roomCode, getCtx, canvasRef]);

  const endDrawing = useCallback(() => {
    if (!isDrawing.current || !socket) return;
    isDrawing.current = false;
    socket.emit('draw_end', { roomCode });
  }, [socket, roomCode]);

  // ---------------------------------------------------------------------------
  // Handle incoming drawing data from other players
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    socket.on('draw_data', (data) => {
      // Don't draw our own data again (we draw locally for speed)
      if (data.playerId === playerId) return;

      const ctx = getCtx();
      if (!ctx) return;

      if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
      } else if (data.type === 'move') {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    });

    socket.on('canvas_clear', () => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    socket.on('draw_undo', (data) => {
       // For remote undo, we could implement a full state sync,
       // but for simplicity we usually rely on local history for drawer only
       // OR we clear and redraw. Here we just clear if it's a major change.
       // Actually, for a professional clone, we'd need a more robust undo.
    });

    return () => {
      socket.off('draw_data');
      socket.off('canvas_clear');
      socket.off('draw_undo');
    };
  }, [socket, playerId, getCtx, canvasRef]);

  return { initCanvas, startDrawing, draw, endDrawing };
}
