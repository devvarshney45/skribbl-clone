// useSocket.ts
// Provides a singleton Socket.IO client instance for the entire application.
// This ensures we only maintain one connection to the backend server.

import { io, Socket } from 'socket.io-client';

// Remote backend URL from environment variables, fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Singleton instance of the socket
let socket: Socket | null = null;

/**
 * useSocket Hook
 * Returns the singleton socket instance, initializing it if it doesn't exist.
 */
export const useSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });
  }

  return socket;
};
