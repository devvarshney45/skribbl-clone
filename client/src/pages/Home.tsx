// Home.tsx
// Redesigned with a stunning premium entrance.
// Features dynamic mesh background, floating elements, and refined typography.

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
      setError('A true artist needs a signature name!');
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
      setError('The studio is currently offline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPublic = async () => {
    if (!name.trim()) {
      setError('Introduce yourself before entering the lounge.');
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
      setError(err.response?.data?.error || 'No public studios found. Launch your own!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError('Artist identification is required.');
      return;
    }
    if (!code.trim() || code.length < 6) {
      setError('Invalid studio access code.');
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
      setError(err.response?.data?.reason || 'Studio access denied or not found.');
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
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-start p-6 py-16 md:py-28 relative overflow-y-auto custom-scrollbar">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-subtle pointer-events-none" />

      {/* Main Content Card */}
      <div className="w-full max-w-2xl z-10 animate-fade-in relative">
        
        {/* Logo / Header Section */}
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 glass rounded-full ring-1 ring-white/10 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
              The Premier Artistic Lounge
            </span>
          </div>
          <h1 className="text-8xl font-black tracking-tighter italic mb-4 leading-none">
            <span className="text-white">SKRIBBL</span>
            <span className="text-indigo-600 opacity-50">.</span>
            <span className="text-slate-800">IO</span>
          </h1>
          <p className="max-w-md mx-auto text-slate-500 font-bold tracking-tight text-sm uppercase leading-relaxed">
            Where <span className="text-slate-300">visionaries</span> collide. Redefining the boundaries of <span className="text-slate-300">multiplayer art</span>.
          </p>
        </div>

        {/* Entrance Interface */}
        <div className="glass p-12 rounded-[3.5rem] relative overflow-hidden shadow-3xl group border-white/5 transition-all hover:border-white/10">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent" />
          
          {error && (
            <div className="mb-10 p-5 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-3xl text-xs font-black tracking-widest flex items-center gap-4 animate-fade-in uppercase">
              <span className="bg-rose-500 text-white rounded-lg p-1">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-12">
            {/* Signature Input */}
            <div className="relative">
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 ml-2">
                Your Artistic Alias
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="The_Masterpiece_99"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/2 border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600/40 transition-all font-bold text-xl placeholder:text-slate-700 text-white"
                  maxLength={16}
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 transition-opacity">
                  🖋️
                </div>
              </div>
            </div>

            {/* Visibility Dashboard */}
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
                  Studio mode
                </span>
                <span className="text-[9px] font-bold text-slate-700 uppercase italic">Control access to your exhibition</span>
              </div>
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${isPublic ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  PUBLIC
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isPublic ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  PRIVATE
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-4">
              {/* Primary Action */}
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2rem] font-black text-sm tracking-[0.3em] shadow-3xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 overflow-hidden relative group/btn"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    CREATE NEW EXHIBITION
                    <span className="group-hover/btn:translate-x-1.5 transition-transform duration-300">➔</span>
                  </>
                )}
              </button>

              <button
                onClick={handleJoinPublic}
                disabled={loading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-5 rounded-[2rem] font-black text-[10px] tracking-[0.4em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase shadow-lg shadow-black/20"
              >
                {loading ? 'ANALYZING NETWORK' : '⚡ Enter Random Hall'}
              </button>

              <div className="flex items-center gap-6 py-4">
                <div className="flex-grow h-px bg-white/5" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Secure Access</span>
                <div className="flex-grow h-px bg-white/5" />
              </div>

              {/* Join Interface */}
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="ENTER ACCESS CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="col-span-3 bg-white/2 border border-white/5 rounded-3xl px-8 py-5 outline-none focus:ring-2 focus:ring-indigo-600/30 transition-all font-mono font-black tracking-[0.4em] text-center text-sm text-indigo-400 placeholder:text-slate-800 placeholder:tracking-widest"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-3xl font-black text-[10px] tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/40"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in delay-500">
          {[
            { title: 'EXPRESS', desc: 'Transform concepts into vivid imagery with precision tools.', icon: '🎨' },
            { title: 'DECODE', desc: 'Harness intuition to decrypt the evolving canvas.', icon: '⚛️' },
            { title: 'CONQUER', desc: 'Climb the ranks and claim your artistic legacy.', icon: '💠' }
          ].map((feat, i) => (
            <div key={i} className="glass p-8 rounded-[2rem] border-white/5 flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-500">
              <span className="text-4xl mb-6 group-hover:rotate-12 transition-transform">{feat.icon}</span>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">{feat.title}</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed tracking-wider">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Studio Footer */}
        <div className="mt-24 mb-16 text-center opacity-30">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">
            Encrypted Sync &bull; Neural UI &bull; Studio Edition 2024
          </p>
          <div className="flex items-center justify-center gap-6">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
