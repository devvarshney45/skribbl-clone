// Home.tsx
// Master-Level UI: Absolute vertical containment using Grid + Flex.
// Prevents any overlap by strictly dividing the 100dvh viewport.

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
    if (!name.trim()) { setError('Artist Name Required'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.post(`${API_URL}/api/rooms`, {
        hostName: name, isPublic: isPublic, settings: { rounds: 3, drawTime: 80 }
      });
      createRoom(name, resp.data.roomCode);
      navigate(`/room/${resp.data.roomCode}`);
    } catch (err) { setError('Studio Offline'); } finally { setLoading(false); }
  };

  const handleJoinPublic = async () => {
    if (!name.trim()) { setError('Name Required'); return; }
    setLoading(true); setError('');
    try {
      const resp = await axios.get(`${API_URL}/api/rooms/find/public`);
      joinRoom(name, resp.data.roomCode);
      navigate(`/room/${resp.data.roomCode}`);
    } catch (err: any) { setError(err.response?.data?.error || 'No Studios Found'); } finally { setLoading(false); }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !code.trim() || code.length < 6) return setError('Invalid Input');
    setLoading(true); setError('');
    try {
      const resp = await axios.get(`${API_URL}/api/rooms/${code}/join`);
      if (resp.data.canJoin) { joinRoom(name, code.toUpperCase()); navigate(`/room/${code.toUpperCase()}`); }
    } catch (err) { setError('Access Denied'); } finally { setLoading(false); }
  };

  React.useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length === 6) setCode(urlCode.toUpperCase());
  }, [searchParams]);

  return (
    <div className="min-h-[100dvh] w-screen bg-mesh-pro flex flex-col lg:overflow-hidden font-sans relative">
      
      {/* Absolute Background Sync decorations */}
      <div className="absolute top-[-5%] left-[-10%] w-1/2 h-1/2 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-1/2 h-1/2 bg-brand-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Layout Block */}
      <div className="flex-grow flex flex-col items-center justify-between py-10 lg:py-16 z-10 px-4">
        
        {/* 1. Header Area (Compact) */}
        <header className="flex flex-col items-center gap-2 animate-pop-in shrink-0">
           <div className="px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20 backdrop-blur-md">
              <span className="text-[10px] font-black tracking-[0.4em] text-brand-primary uppercase">Production Build v2.5</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-white flex items-center leading-none">
             SKRIBBL<span className="text-brand-secondary">.</span>IO
           </h1>
           <p className="text-slate-600 font-bold uppercase text-[9px] md:text-xs tracking-[0.4em] opacity-60">Creative Nexus Multiplayer</p>
        </header>

        {/* 2. Tactical Core Card (Centerpiece) */}
        <main className="w-full max-w-lg animate-slide-up flex flex-col items-center justify-center flex-grow py-4">
          <div className="w-full panel p-6 md:p-10 rounded-[2.5rem] bg-bg-panel/40 backdrop-blur-2xl relative border-white/5 shadow-2xl">
            {error && (
                <div className="absolute -top-4 left-0 w-full text-center">
                    <span className="bg-rose-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-bounce">⚠️ {error}</span>
                </div>
            )}

            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] ml-2">Pilot Signature</label>
                <input 
                  type="text" placeholder="Alias Name..." value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-card/60 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-brand-secondary/30 transition-all font-bold text-lg text-white placeholder:text-slate-800 shadow-inner"
                  maxLength={16}
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                      <span className="text-[7px] font-bold text-brand-secondary uppercase italic">Lobby Visibility</span>
                  </div>
                  <div className="flex bg-bg-main p-1 rounded-xl border border-white/5">
                      <button onClick={() => setIsPublic(true)} className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-600'}`}>PUBLIC</button>
                      <button onClick={() => setIsPublic(false)} className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${!isPublic ? 'bg-brand-secondary text-bg-main shadow-lg' : 'text-slate-600'}`}>PRIVATE</button>
                  </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleCreateRoom} disabled={loading}
                   className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4.5 rounded-2xl font-black text-[11px] tracking-[0.4em] btn-game shadow-tactile transition-all disabled:opacity-50"
                 >
                   {loading ? 'INIT...' : 'CREATE NEW STUDIO ➔'}
                 </button>

                 <div className="grid grid-cols-2 gap-3 h-12">
                   <button 
                     onClick={handleJoinPublic} disabled={loading}
                     className="border border-white/5 bg-white/2 hover:bg-white/5 text-slate-400 rounded-2xl font-black text-[9px] tracking-[0.3em] transition-all"
                   >
                     EXPLORE SESSIONS
                   </button>
                   <div className="grid grid-cols-3 gap-1">
                      <input 
                        type="text" placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="col-span-2 bg-white/1 border border-white/5 rounded-xl px-2 outline-none focus:ring-1 focus:ring-brand-secondary/30 transition-all font-mono font-black text-center text-[10px] text-brand-secondary"
                        maxLength={6}
                      />
                      <button onClick={handleJoinRoom} disabled={loading} className="bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary rounded-xl font-black text-[9px] transition-all">JOIN</button>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </main>

        {/* 3. Features Area (Compact Row) */}
        <footer className="w-full max-w-sm flex flex-col items-center gap-6 shrink-0">
          <div className="flex items-center justify-center gap-10 md:gap-14 opacity-60">
            {[
                { l: 'SKETCH', i: '🎨' },
                { l: 'DECODE', i: '🧩' },
                { l: 'CONQUER', i: '🏆' }
            ].map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{f.i}</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">{f.l}</span>
                </div>
            ))}
          </div>
          <div className="h-px w-20 bg-white/10" />
          <div className="text-[7px] font-black text-slate-700 uppercase tracking-[0.6em] text-center">Studio v2.5.0 • Absolute Containment</div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
