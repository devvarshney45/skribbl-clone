// Home.tsx
// Redesigned for maximum responsiveness and vertical fit.
// Scales logo and cards properly across all resolutions.

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useGame } from '../context/GameContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoom, joinRoom } = useGame();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError('A true artist needs a signature!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/rooms`, {
        hostName: name,
        isPublic: isPublic,
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
      setError('The studio is offline. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPublic = async () => {
    if (!name.trim()) {
      setError('Introduce yourself first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/rooms/find/public`);
      const { roomCode } = response.data;
      joinRoom(name, roomCode);
      navigate(`/room/${roomCode}`);
    } catch (err: any) {
      console.error('Join public error:', err);
      setError(err.response?.data?.error || 'No studios available. Launch your own!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError('Artist ID is required.');
      return;
    }
    if (!code.trim() || code.length < 6) {
      setError('Invalid studio code.');
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
      setError(err.response?.data?.reason || 'Access denied or studio not found.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length === 6) {
      setCode(urlCode.toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen h-[100dvh] bg-mesh flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-subtle pointer-events-none" />

      {/* Content Container - Compact and fluid */}
      <div className="w-full max-w-xl z-10 animate-fade-in flex flex-col items-center gap-6 md:gap-8">
        
        {/* Logo / Header - Scales fluidly */}
        <div className="text-center w-full px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass rounded-full border border-white/5 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[8px] font-black tracking-[0.4em] text-indigo-400 uppercase">
              The Premier Artistic Lounge
            </span>
          </div>
          <h1 className="text-fluid-logo font-black tracking-tighter italic leading-none mb-1">
            <span className="text-white">SKRIBBL</span>
            <span className="text-indigo-600 opacity-50">.</span>
            <span className="text-slate-800">IO</span>
          </h1>
          <p className="max-w-[18rem] md:max-w-md mx-auto text-slate-500 font-bold tracking-tight text-[10px] md:text-sm uppercase leading-relaxed">
            Where <span className="text-slate-300">visionaries</span> collide. Redefining <span className="text-slate-300">multiplayer art</span>.
          </p>
        </div>

        {/* Entrance Interface - Optimized for height */}
        <div className="w-full glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative shadow-2xl border-white/5 transition-all hover:border-white/10 group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-600/60 to-transparent" />
          
          {error && (
            <div className="mb-6 p-4 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-2xl text-[9px] font-black tracking-widest flex items-center gap-3 animate-fade-in uppercase">
              <span className="bg-rose-500 text-white rounded-md px-1 py-0.5">!</span>
              {error}
            </div>
          )}

          <div className="space-y-6 md:space-y-8">
            {/* Signature Input */}
            <div className="relative">
              <label className="block text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mb-2 ml-2">
                Your Artistic Alias
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Masterpiece_99"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-3.5 md:py-4.5 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/30 transition-all font-bold text-base md:text-xl placeholder:text-slate-700 text-white"
                  maxLength={16}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-20 pointer-events-none group-focus-within:opacity-50 transition-opacity">
                  🖋️
                </div>
              </div>
            </div>

            {/* Visibility Mode */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Studio mode
                </span>
                <span className="text-[7px] font-bold text-slate-700 uppercase italic tracking-wider">Control Exhibition Access</span>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${isPublic ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  PUBLIC
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${!isPublic ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  PRIVATE
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 md:py-5 rounded-2xl font-black text-[11px] md:text-xs tracking-[0.3em] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
              >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    CREATE NEW STUDIO
                    <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                  </>
                )}
              </button>

              <button
                onClick={handleJoinPublic}
                disabled={loading}
                className="w-full bg-white/3 hover:bg-white/5 border border-white/5 text-slate-300 py-4 rounded-2xl font-black text-[9px] tracking-[0.4em] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'ANALYZING...' : '⚡ JOIN PUBLIC LOUNGE'}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="flex-grow h-px bg-white/5" />
                <span className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em]">Secure Join</span>
                <div className="flex-grow h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="EXHIBITION CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="col-span-3 bg-white/1 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all font-mono font-black tracking-[0.3em] text-center text-xs text-indigo-400 placeholder:text-slate-800"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/10 rounded-2xl font-black text-[10px] tracking-widest transition-all active:scale-[0.95]"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Icons - Hidden on very small heights */}
        <div className="hidden lg:grid grid-cols-3 gap-6 w-full opacity-80">
          {[
            { title: 'EXPRESS', icon: '🎨' },
            { title: 'DECODE', icon: '⚛️' },
            { title: 'CONQUER', icon: '💠' }
          ].map((feat, i) => (
            <div key={i} className="glass p-5 rounded-2xl border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-all">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{feat.icon}</span>
              <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">{feat.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
