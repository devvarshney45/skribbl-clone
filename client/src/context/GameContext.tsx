// GameContext.tsx
// Manages the global state of the game, including player info,
// room details, and real-time game status.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

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
  
  // Game State
  players: Player[];
  phase: GamePhase;
  currentDrawerId: string | null;
  word: string;
  wordHints: string[];
  timeLeft: number;
  round: number;
  totalRounds: number;
  winner: Player | null;

  // Actions
  joinRoom: (name: string, code: string) => void;
  createRoom: (name: string, code: string) => void;
  markReady: () => void;
  startGame: () => void;
  selectWord: (word: string) => void;
  sendGuess: (text: string) => void;
  sendChat: (text: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useSocket();

  // Local state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [wordHints, setWordHints] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [winner, setWinner] = useState<Player | null>(null);

  // ---------------------------------------------------------------------------
  // Socket Event Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on('room_created', (data) => {
      setRoomCode(data.roomCode);
      setPlayerId(data.player.id);
      setTotalRounds(data.settings.rounds);
    });

    socket.on('joined_room', (data) => {
      setRoomCode(data.roomCode);
      setPlayerId(data.player.id);
      setTotalRounds(data.settings.rounds);
    });

    socket.on('player_list', (data) => {
      setPlayers(data.players);
    });

    // Game starting
    socket.on('round_start', (data) => {
      setPhase('choosing');
      setCurrentDrawerId(data.drawerId);
      setRound(data.round);
      setTotalRounds(data.totalRounds);
      setWord(''); // clear previous word
      setWordHints([]);
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

  const selectWord = (selectedWord: string) => {
    socket.emit('word_chosen', { roomCode, word: selectedWord });
  };

  const sendGuess = (text: string) => {
    socket.emit('guess', { roomCode, text });
  };

  const sendChat = (text: string) => {
    socket.emit('chat', { roomCode, text });
  };

  const resetGame = () => {
    setPhase('waiting');
    setWinner(null);
    setWord('');
    setWordHints([]);
  };

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        roomCode,
        setRoomCode,
        playerId,
        players,
        phase,
        currentDrawerId,
        word,
        wordHints,
        timeLeft,
        round,
        totalRounds,
        winner,
        joinRoom,
        createRoom,
        markReady,
        startGame,
        selectWord,
        sendGuess,
        sendChat,
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
