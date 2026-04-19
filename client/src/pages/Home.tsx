// Home.tsx
// The landing page of the application.
// Redesigned with a premium "Senior Level" UI/UX.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGame } from '../context/GameContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError('A true artist needs a name!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/rooms`, {
        hostName: name,
        settings: {
          rounds: 3,
          drawTime: 80,
        },
      });

      const { roomCode } = response.data;
      createRoom(name, roomCode);
      navigate(`/room/${roomCode}`);
    } catch (err: any) {
      console.error('Create room error:', err);
      setError('Failed to create room. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError('Please enter your name first!');
      return;
    }
    if (!code.trim() || code.length < 6) {
      setError('Enter a valid 6-character room code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/rooms/${code}/join`);
      if (response.data.canJoin) {
        joinRoom(name, code.toUpperCase());
        navigate(`/room/${code.toUpperCase()}`);
      }
    } catch (err: any) {
      console.error('Join room error:', err);
      setError(err.response?.data?.reason || 'Room not found or game already started.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-subtle" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-subtle" />

      {/* Main Content */}
      <div className="w-full max-w-xl z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-6 glass rounded-full ring-1 ring-white/10">
            <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
              Multiplayer Drawing Experience
            </span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter italic text-gradient mb-2">
            SKRIBBL
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            The ultimate platform to <span className="text-white">draw</span>, <span className="text-white">guess</span>, and <span className="text-white">laugh</span>.
          </p>
        </div>

        {/* Action Card */}
        <div className="glass p-10 rounded-3xl relative overflow-hidden group">
          {/* Subtle line decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Name Input */}
            <div className="relative group">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">
                Artist Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MasterArtist_99"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-lg placeholder:text-slate-600"
                  maxLength={16}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  🎨
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Create Button */}
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group/btn"
              >
                {loading ? 'INITIALIZING...' : (
                  <>
                    CREATE NEW STUDIO
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-grow h-px bg-white/5" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">or Join Existing</span>
                <div className="flex-grow h-px bg-white/5" />
              </div>

              {/* Join Section */}
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="col-span-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all font-mono font-bold tracking-widest text-center"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-xs tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
            Precision Drawing &bull; Real Time Sync &bull; Competitive Fun
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
