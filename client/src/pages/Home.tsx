// Home.tsx
// Final Transformation: Absolute vertical fit (100dvh).
// Features specialized scaling and tactile game theme.

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
    if (!name.trim()) { setError('Enter your artist name!'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.post(`${API_URL}/api/rooms`, {
        hostName: name, isPublic: isPublic, settings: { rounds: 3, drawTime: 80 }
      });
      createRoom(name, resp.data.roomCode);
      navigate(`/room/${resp.data.roomCode}`);
    } catch (err) { setError('Studio is offline.'); } finally { setLoading(false); }
  };

  const handleJoinPublic = async () => {
    if (!name.trim()) { setError('Enter your name first!'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.get(`${API_URL}/api/rooms/find/public`);
      joinRoom(name, resp.data.roomCode);
      navigate(`/room/${resp.data.roomCode}`);
    } catch (err: any) { setError(err.response?.data?.error || 'No public studios found.'); } finally { setLoading(false); }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) return setError('Name required.');
    if (!code.trim() || code.length < 6) return setError('Invalid code.');
    setLoading(true); setError('');
    try {
      const resp = await axios.get(`${API_URL}/api/rooms/${code}/join`);
      if (resp.data.canJoin) { joinRoom(name, code.toUpperCase()); navigate(`/room/${code.toUpperCase()}`); }
    } catch (err) { setError('Studio not found/access denied.'); } finally { setLoading(false); }
  };

  React.useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length === 6) setCode(urlCode.toUpperCase());
  }, [searchParams]);

  return (
    <div className="h-[100dvh] w-screen bg-mesh-pro flex flex-col items-center justify-between p-4 md:p-10 font-sans overflow-hidden">
      
      {/* 1. Header Area (Approx 20vh) */}
      <header className="flex flex-col items-center gap-2 animate-pop-in">
        <div className="px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
           <span className="text-[10px] font-black tracking-[0.4em] text-brand-primary uppercase opacity-80">Pro Studio Edition</span>
        </div>
        <h1 className="text-fluid-logo font-black tracking-tighter italic text-white flex items-center leading-none">
          SKRIBBL<span className="text-brand-secondary">.</span>IO
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.5em] opacity-60">The Masterpiece Network</p>
      </header>

      {/* 2. Main Join Card (Approx 60vh) */}
      <main className="w-full max-w-lg panel p-8 md:p-12 rounded-[2.5rem] border-white/5 animate-slide-up flex flex-col gap-8 md:gap-10 relative">
        {error && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full px-4 text-center">
                <span className="inline-block bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl backdrop-blur-md">⚠️ {error}</span>
            </div>
        )}

        <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Identity Signature</label>
              <input 
                type="text" placeholder="Alias Name..." value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-card border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-bold text-lg text-white placeholder:text-slate-800"
                maxLength={16}
              />
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visibility</span>
                    <span className="text-[7px] font-bold text-slate-700 uppercase italic">Affects global discovery</span>
                </div>
                <div className="flex bg-bg-card p-1 rounded-xl border border-white/5">
                    <button onClick={() => setIsPublic(true)} className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-500 hover:text-white'}`}>PUBLIC</button>
                    <button onClick={() => setIsPublic(false)} className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${!isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-500 hover:text-white'}`}>PRIVATE</button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={handleCreateRoom} disabled={loading}
                 className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-2xl font-black text-xs tracking-[0.4em] btn-game shadow-tactile-heavy transition-all disabled:opacity-50"
               >
                 {loading ? 'PROCESSING...' : 'INITIALIZE STUDIO ➔'}
               </button>

               <button 
                 onClick={handleJoinPublic} disabled={loading}
                 className="w-full border border-white/5 bg-white/2 hover:bg-white/5 text-slate-400 py-4 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all"
               >
                 EXPLORE PUBLIC GALLERIES
               </button>

               <div className="flex items-center gap-4 py-2">
                  <div className="flex-grow h-px bg-white/5" />
                  <span className="text-[8px] font-black text-slate-800 tracking-[0.4em] uppercase">Join Code</span>
                  <div className="flex-grow h-px bg-white/5" />
               </div>

               <div className="grid grid-cols-4 gap-3 h-14">
                  <input 
                    type="text" placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="col-span-3 bg-bg-card border border-white/5 rounded-2xl px-4 py-2 outline-none focus:ring-1 focus:ring-brand-secondary/30 transition-all font-mono font-black tracking-[0.5em] text-center text-xs text-brand-secondary placeholder:text-slate-800"
                    maxLength={6}
                  />
                  <button onClick={handleJoinRoom} disabled={loading} className="panel-card hover:bg-white/5 text-brand-secondary rounded-2xl font-black text-[10px] tracking-widest transition-all">JOIN</button>
               </div>
            </div>
        </div>
      </main>

      {/* 3. Features Area (Approx 15vh) */}
      <footer className="w-full max-w-4xl grid grid-cols-3 gap-6 md:gap-10 opacity-60">
        {[
            { label: 'VISUALIZE', icon: '✨' },
            { label: 'DECODE', icon: '🧩' },
            { label: 'RANK', icon: '🏆' }
        ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: `${i*100}ms` }}>
                <span className="text-2xl md:text-3xl items-center flex justify-center w-12 h-12 md:w-14 md:h-14 panel-card rounded-2xl">{f.icon}</span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{f.label}</span>
            </div>
        ))}
      </footer>

      {/* Subtle Buffer / Base Info */}
      <div className="opacity-20 text-[6px] md:text-[8px] font-black uppercase tracking-[0.5em] mt-2">Studio Protocol v2.5.0 • All Rights Reserved</div>
    </div>
  );
};

export default Home;
