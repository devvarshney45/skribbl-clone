// GameContext.tsx
// Manages the global state of the game, including player info,
// room details, and real-time game status.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import confetti from 'canvas-confetti';

// Type definitions for the game state
export interface Player {
  id: string;
  name: string;
  score: number;
  hasGuessedCorrectly: boolean;
  isReady: boolean;
  isHost: boolean;
}

export type GamePhase = 'waiting' | 'choosing' | 'drawing' | 'roundEnd' | 'gameOver';

interface GameContextType {
  // Player & Room info
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  playerId: string;
  loading: boolean;
  
  // Game State
  players: Player[];
  phase: GamePhase;
  currentDrawerId: string | null;
  word: string;
  wordHints: string[];
  wordOptions: string[];
  messages: Array<{ author: string; text: string; type: 'normal' | 'correct' | 'system' }>;
  timeLeft: number;
  round: number;
  totalRounds: number;
  winner: Player | null;
  drawTime: number;
  isPublic: boolean;

  // Status Helpers
  currentPlayerIsDrawer: boolean;

  // Brush Config
  color: string;
  size: number;
  setBrushConfig: (config: { color?: string; size?: number }) => void;

  // Actions
  joinRoom: (name: string, code: string) => void;
  createRoom: (name: string, code: string) => void;
  markReady: () => void;
  startGame: () => void;
  chooseWord: (word: string) => void;
  sendGuess: (text: string) => void;
  sendChat: (text: string) => void;
  undo: () => void;
  clearCanvas: () => void;
  updateSettings: (settings: { rounds?: number; drawTime?: number }) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useSocket();

  // Local state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [wordHints, setWordHints] = useState<string[]>([]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<{ author: string; text: string; type: 'normal' | 'correct' | 'system' }>>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(80);
  const [isPublic, setIsPublic] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Brush state
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(5);

  // ---------------------------------------------------------------------------
  // Socket Event Listeners
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Session Persistence Effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('skribbl_player_id');
    const savedRoomCode = localStorage.getItem('skribbl_room_code');
    const savedName = localStorage.getItem('skribbl_player_name');

    if (savedPlayerId && savedRoomCode && savedName) {
      console.log('[GameContext] Found existing session, attempting reconnect...');
      setPlayerName(savedName);
      setRoomCode(savedRoomCode);
      setPlayerId(savedPlayerId);
      setLoading(true);
      socket.emit('reconnect_session', { playerId: savedPlayerId, roomCode: savedRoomCode });
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on('room_created', ({ roomId: rid, roomCode: code, player, settings }) => {
      setRoomCode(code);
      setPlayerId(player.id);
      setPlayers([player]);
      
      // Save session
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    socket.on('joined_room', ({ roomId: rid, roomCode: code, player, settings }) => {
      setRoomCode(code);
      setPlayerId(player.id);
      
      // Save session
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    socket.on('reconnected', ({ player, roomCode: code, phase: p, ...rest }) => {
      setPlayerId(player.id);
      setRoomCode(code);
      setPhase(p as any);
      setCurrentDrawerId(rest.currentDrawerId);
      setWordHints(rest.wordHints);
      setTimeLeft(rest.timeLeft);
      setRound(rest.round);
      setTotalRounds(rest.totalRounds);
      setIsPublic(rest.settings?.isPublic ?? true);
      setDrawTime(rest.settings?.drawTime || 80);
      
      setDrawTime(rest.settings?.drawTime || 80);
      
      setDrawTime(rest.settings?.drawTime || 80);
      setLoading(false);
      
      // Refresh session storage
      localStorage.setItem('skribbl_player_id', player.id);
      localStorage.setItem('skribbl_room_code', code);
      localStorage.setItem('skribbl_player_name', player.name);
    });

    socket.on('session_expired', ({ message }) => {
      console.warn('[GameContext] Session expired:', message);
      localStorage.clear();
      setLoading(false);
      setPhase('waiting');
      setRoomCode('');
    });

    // Game starting
    socket.on('round_start', (data) => {
      setPhase('choosing');
      setCurrentDrawerId(data.drawerId);
      setRound(data.round);
      setTotalRounds(data.totalRounds);
      setWord('');
      setWordHints([]);
      setWordOptions([]); // will be set by word_options event for the drawer
      setMessages(prev => [...prev.slice(-49), { author: 'SYSTEM', text: `Round ${data.round} is starting!`, type: 'system' }]);
    });

    socket.on('word_options', (data) => {
      setWordOptions(data.words);
    });

    // Drawing start
    socket.on('game_state', (data) => {
      setPhase(data.phase);
      setWordHints(data.wordHints);
      setTimeLeft(data.timeLeft);
    });

    // Updates
    socket.on('timer_update', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('hint_update', (data) => {
      setWordHints(data.wordHints);
    });

    socket.on('round_end', (data) => {
      setPhase('roundEnd');
      setWord(data.word);
      setPlayers(data.leaderboard);
    });

    socket.on('game_over', (data) => {
      setPhase('gameOver');
      setWinner(data.winner);
      setPlayers(data.leaderboard);
    });

    socket.on('settings_updated', ({ settings }) => {
      setTotalRounds(settings.rounds);
      setDrawTime(settings.drawTime);
    });

    socket.on('chat_message', (data) => {
      setMessages(prev => [...prev.slice(-49), { author: data.playerName, text: data.text, type: 'normal' }]);
    });

    socket.on('guess_result', (data) => {
      if (data.correct) {
        // Trigger confetti for a celebratory feel
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#0ea5e9', '#ffffff']
        });

        setMessages(prev => [...prev.slice(-49), { 
          author: 'SYSTEM', 
          text: `${data.playerName} decoded the artwork!`, 
          type: 'correct' 
        }]);
      }
    });

    // Reconnection
    socket.on('reconnected', (data) => {
      setPlayerId(data.player.id);
      setRoomCode(data.roomCode);
      setPhase(data.gamePhase);
      setCurrentDrawerId(data.currentDrawerId);
      setWordHints(data.wordHints);
      setTimeLeft(data.timeLeft);
      setRound(data.round);
      setTotalRounds(data.totalRounds);
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('player_list');
      socket.off('round_start');
      socket.off('game_state');
      socket.off('timer_update');
      socket.off('hint_update');
      socket.off('round_end');
      socket.off('game_over');
      socket.off('reconnected');
    };
  }, [socket]);

  // ---------------------------------------------------------------------------
  // Action Helpers
  // ---------------------------------------------------------------------------
  const createRoom = (name: string, code: string) => {
    setPlayerName(name);
    socket.emit('create_room', { playerName: name, roomCode: code });
  };

  const joinRoom = (name: string, code: string) => {
    setPlayerName(name);
    socket.emit('join_room', { playerName: name, roomCode: code });
  };

  const markReady = () => {
    socket.emit('player_ready', { roomCode });
  };

  const startGame = () => {
    socket.emit('start_game', { roomCode });
  };

  const chooseWord = (selectedWord: string) => {
    socket.emit('word_chosen', { roomCode, word: selectedWord });
  };

  const sendGuess = (text: string) => {
    socket.emit('guess', { roomCode, text });
  };

  const sendChat = (text: string) => {
    socket.emit('chat', { roomCode, text });
  };

  const setBrushConfig = (config: { color?: string; size?: number }) => {
    if (config.color) setColor(config.color);
    if (config.size) setSize(config.size);
  };

  const undo = () => {
    socket.emit('draw_undo', { roomCode });
  };

  const clearCanvas = () => {
    socket.emit('canvas_clear', { roomCode });
  };

  const updateSettings = (settings: { rounds?: number; drawTime?: number }) => {
    socket.emit('update_settings', { roomCode, settings });
  };

  const resetGame = () => {
    setPhase('waiting');
    setWinner(null);
    setWord('');
    setWordHints([]);
    setMessages([]);
  };

  const currentPlayerIsDrawer = playerId === currentDrawerId;

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        roomCode,
        setRoomCode,
        playerId,
        loading,
        players,
        phase,
        currentDrawerId,
        word,
        wordHints,
        wordOptions,
        messages,
        timeLeft,
        round,
        totalRounds,
        drawTime,
        isPublic,
        winner,
        currentPlayerIsDrawer,
        joinRoom,
        createRoom,
        markReady,
        startGame,
        chooseWord,
        sendGuess,
        sendChat,
        color,
        size,
        setBrushConfig,
        undo,
        clearCanvas,
        updateSettings,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
