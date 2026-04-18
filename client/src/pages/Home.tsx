// Home.tsx
// The landing page of the application.
// Allows users to enter their name and either create a new room or join an existing one.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGame } from '../context/GameContext';

// Backend URL for API calls
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // Handle creating a new room
  // ---------------------------------------------------------------------------
  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError('Please enter your name first!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Call the REST API to create the room record in SQLite
      const response = await axios.post(`${API_URL}/api/rooms`, {
        hostName: name,
        settings: {
          rounds: 3,
          drawTime: 80,
        },
      });

      const { roomCode } = response.data;
      
      // 2. Initialize the socket connection via context
      createRoom(name, roomCode);
      
      // 3. Navigate to the lobby
      navigate(`/room/${roomCode}`);
    } catch (err: any) {
      console.error('Create room error:', err);
      setError(err.response?.data?.error || 'Failed to create room. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handle joining an existing room
  // ---------------------------------------------------------------------------
  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError('Please enter your name first!');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a room code!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Pre-validate if the room exists and is joinable
      const response = await axios.get(`${API_URL}/api/rooms/${code}/join`);
      
      if (response.data.canJoin) {
        // 2. Join via socket
        joinRoom(name, code.toUpperCase());
        // 3. Navigate to lobby
        navigate(`/room/${code.toUpperCase()}`);
      }
    } catch (err: any) {
      console.error('Join room error:', err);
      setError(err.response?.data?.reason || 'Room not found or game already in progress.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      {/* Animated Logo */}
      <div className="mb-12 text-center animate-bounce">
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent italic">
          SKRIBBL CLONE
        </h1>
        <p className="text-gray-400 mt-2 font-medium tracking-widest uppercase text-xs">
          Professional Multiplayer Drawing Game
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. MasterArtist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
              maxLength={16}
            />
          </div>

          <div className="h-px bg-gray-700 my-8" />

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'CREATE PRIVATE ROOM'}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          {/* Join Room Section */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Room Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold tracking-widest text-center"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
            >
              JOIN
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-gray-600 text-xs font-medium uppercase tracking-widest">
        Internship Project &bull; Built with Socket.IO & React
      </div>
    </div>
  );
};

export default Home;
