// Room.tsx (Lobby)
// The waiting room where players gather before the game starts.
// Displays the room code, settings, and real-time list of joined players.

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Room: React.FC = () => {
  const { 
    roomCode, 
    players, 
    playerId, 
    markReady, 
    startGame,
    phase 
  } = useGame();

  const [copied, setCopied] = useState(false);

  // Find the current player in the list
  const me = players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  // ---------------------------------------------------------------------------
  // Copy Room Code to clipboard
  // ---------------------------------------------------------------------------
  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // Share Invite Link
  // ---------------------------------------------------------------------------
  const handleShare = () => {
    const inviteLink = `${window.location.origin}/join?code=${roomCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black italic bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            GAME LOBBY
          </h1>
          <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">
            Waiting for players to join...
          </p>
        </div>

        <div className="flex flex-col items-center bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-2xl">
          <span className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Room Code</span>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-mono font-black text-white tracking-widest">
              {roomCode}
            </span>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {copied ? '✅' : 'Copy'}
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
          >
            Copy Invite Link
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Players List */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Players 
              <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
                {players.length}
              </span>
            </h2>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Need 2+ to start
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  player.id === playerId 
                    ? 'bg-purple-600/10 border-purple-500/50' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    player.isHost ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'
                  }`}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {player.name}
                      {player.id === playerId && (
                        <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-400 font-black">YOU</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                      {player.isHost ? '👑 Room Host' : 'Player'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {player.isReady ? (
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-500/30">
                      READY
                    </span>
                  ) : (
                    <span className="bg-gray-700 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase italic">
                      Waiting...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / Settings */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Status</h2>
            
            <div className="space-y-4">
              {!isHost ? (
                <button
                  onClick={markReady}
                  disabled={me?.isReady}
                  className={`w-full py-4 rounded-2xl font-black tracking-widest transition-all ${
                    me?.isReady 
                    ? 'bg-green-600 cursor-default opacity-80' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 scale-100 hover:scale-105 active:scale-95'
                  }`}
                >
                  {me?.isReady ? 'READY TO PLAY' : 'CLICK TO READY'}
                </button>
              ) : (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full py-4 rounded-2xl font-black tracking-widest bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  START GAME
                </button>
              )}
              
              <p className="text-[10px] text-gray-600 font-bold uppercase text-center leading-relaxed">
                {isHost 
                  ? "As host, you control when the game begins." 
                  : "Please mark yourself as ready so the host knows you're here."}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl opacity-50 grayscale">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rounds</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Draw Time</span>
                <span className="font-bold">80s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Players</span>
                <span className="font-bold">8</span>
              </div>
            </div>
            <p className="mt-4 text-[9px] text-gray-500 uppercase font-black tracking-tighter text-center">
              Settings fixed for internship demo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
