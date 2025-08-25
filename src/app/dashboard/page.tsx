'use client';

import React, { useState } from 'react';
import { FaRedo, FaCheckCircle, FaStar } from 'react-icons/fa';

// Dummy challenge pool
const CHALLENGE_POOL = [
  { name: 'Nyerj egy meccset', xp: 50 },
  { name: 'Lőj 3 gólt', xp: 100 },
  { name: 'Adj 2 gólpasszt', xp: 75 },
  { name: 'Védj 5 lövést', xp: 80 },
  { name: 'Játssz 2 meccset', xp: 60 },
  { name: 'Szerezz 500 pontot', xp: 120 },
  { name: 'Adj le egy replayt', xp: 150 },
  { name: 'Használj egy boostot', xp: 40 },
  { name: 'Csinálj egy aerial-t', xp: 90 },
  { name: 'Szerezz MVP-t', xp: 200 },
];

function getRandomChallenges(n = 5) {
  const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((c, i) => ({ ...c, id: i + '-' + Date.now(), done: false, rerolled: false }));
}

function getLevel(xp: number) {
  // Egyszerű szintkalkuláció: minden szinthez 500 XP kell
  return Math.floor(xp / 500) + 1;
}

function getLevelProgress(xp: number) {
  return (xp % 500) / 500;
}

export default function DashboardPage() {
  const [xp, setXp] = useState(120); // kezdő XP
  const [challenges, setChallenges] = useState(getRandomChallenges());

  const handleComplete = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id && !c.done
          ? (setXp((xp: number) => xp + c.xp), { ...c, done: true })
          : c
      )
    );
  };

  const handleReroll = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id && !c.rerolled && !c.done
          ? { ...getRandomChallenges(1)[0], id: c.id, rerolled: true }
          : c
      )
    );
  };

  // XP bar
  const level = getLevel(xp);
  const progress = getLevelProgress(xp);

  return (
    <div className="space-y-8">
      {/* XP Bar */}
      <div className="bg-white/5 rounded-xl p-6 flex flex-col items-center shadow-md">
        <div className="flex items-center gap-4 w-full justify-between">
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <FaStar className="text-yellow-400" /> Szint {level}
          </span>
          <span className="text-gray-300">{xp} XP</span>
        </div>
        <div className="w-full h-4 bg-white/10 rounded-full mt-4 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Napi Challengek */}
      <div className="bg-white/5 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">Napi Küldetések</h2>
        <ul className="space-y-2">
          {challenges.map((c) => (
            <li
              key={c.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-full transition-colors border border-white/10 shadow-sm backdrop-blur-md ${
                c.done ? 'bg-green-600/20 text-green-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {c.done ? (
                  <FaCheckCircle className="text-green-400 w-5 h-5 shrink-0" />
                ) : (
                  <button
                    className={`hidden group-hover:inline-flex p-1 rounded-full hover:bg-white/30 transition ${c.rerolled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleReroll(c.id)}
                    disabled={c.rerolled}
                    title={c.rerolled ? 'Már újrarolloltad' : 'Új küldetés'}
                  >
                    <FaRedo />
                  </button>
                )}
                <span className="truncate font-medium text-base">{c.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.done ? 'bg-green-500/80 text-white' : 'bg-yellow-400/80 text-gray-900'}`}>{c.xp} XP</span>
                {!c.done && (
                  <button
                    className="ml-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full transition text-xs font-semibold shadow-sm"
                    onClick={() => handleComplete(c.id)}
                  >
                    Teljesítve
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-gray-400 text-xs mt-3">Minden küldetés naponta egyszer újrarollolható. Teljesítsd őket XP-ért!</p>
      </div>
    </div>
  );
} 