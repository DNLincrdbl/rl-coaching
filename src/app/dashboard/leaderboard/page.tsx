'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FaTrophy, 
  FaLock,
  FaMedal,
  FaUser
} from 'react-icons/fa';
import { useRLM, Badge } from '@/contexts/RLMContext';

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { 
    id: '1', 
    rank: 1, 
    name: 'ProPlayer123', 
    level: 156, 
    badges: [true, true, true, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  { 
    id: '2', 
    rank: 2, 
    name: 'RocketMaster', 
    level: 142, 
    badges: [true, true, false, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
  { 
    id: '3', 
    rank: 3, 
    name: 'AerialKing', 
    level: 138, 
    badges: [true, false, true, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  { 
    id: '4', 
    rank: 4, 
    name: 'FlipResetGod', 
    level: 127, 
    badges: [false, false, false, true, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  { 
    id: '5', 
    rank: 5, 
    name: 'BoostDemon', 
    level: 119, 
    badges: [false, false, false, false, true],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #f43f5e, #ec4899)',
  },
  { 
    id: '6', 
    rank: 6, 
    name: 'WallWizard', 
    level: 112, 
    badges: [true, false, false, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  },
  { 
    id: '7', 
    rank: 7, 
    name: 'RotationKing', 
    level: 108, 
    badges: [false, false, true, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #84cc16, #22c55e)',
  },
  { 
    id: '8', 
    rank: 8, 
    name: 'MechanicsPro', 
    level: 99, 
    badges: [false, false, false, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #f97316, #fb923c)',
  },
  { 
    id: '9', 
    rank: 9, 
    name: 'SSLHunter', 
    level: 95, 
    badges: [false, false, false, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #a855f7, #d946ef)',
  },
  { 
    id: '10', 
    rank: 10, 
    name: 'DiamondGrinder', 
    level: 88, 
    badges: [false, false, false, false, false],
    profilePicture: null,
    profileBanner: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
];

const BADGE_INFO = [
  { icon: '🚀', name: 'Aerial Master' },
  { icon: '🧱', name: 'Wall Wizard' },
  { icon: '🔄', name: 'Rotation King' },
  { icon: '⚡', name: 'Boost Demon' },
  { icon: '⚙️', name: 'Mechanical God' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
        <FaTrophy className="w-6 h-6 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/30">
        <FaMedal className="w-6 h-6 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
        <FaMedal className="w-6 h-6 text-white" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
      <span className="text-xl font-bold text-gray-400">{rank}</span>
    </div>
  );
}

function LeaderboardRow({ player, index }: { player: typeof MOCK_LEADERBOARD[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <RankBadge rank={player.rank} />
        
        {/* Profile Card */}
        <div 
          className="flex-1 flex items-center gap-4 p-3 rounded-xl"
          style={{ background: player.profileBanner }}
        >
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/30 overflow-hidden">
            {player.profilePicture ? (
              <Image src={player.profilePicture} alt={player.name} width={56} height={56} className="object-cover" />
            ) : (
              <FaUser className="w-7 h-7 text-white/80" />
            )}
          </div>
          
          {/* Name */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white drop-shadow-md">{player.name}</h3>
          </div>
        </div>
        
        {/* Level */}
        <div className="text-center px-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Szint</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {player.level}
          </p>
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-1">
          {BADGE_INFO.map((badge, i) => (
            <div 
              key={i}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                player.badges[i]
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                  : 'bg-white/5 opacity-30'
              }`}
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { profile } = useRLM();
  
  // For now, leaderboard is locked
  const isLocked = true;

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaLock className="w-12 h-12 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Leaderboard Hamarosan</h1>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            A Leaderboard funkció az első hónap után lesz elérhető, hogy mindenki egyenlő eséllyel indulhasson!
          </p>
          <div className="bg-white/5 rounded-xl px-6 py-4 inline-block">
            <p className="text-gray-400 text-sm mb-2">Készülj fel a versenyre:</p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-2xl font-bold text-orange-500">{profile.level}</p>
                <p className="text-xs text-gray-500">Szinted</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{profile.badges.filter(b => b.unlocked).length}/5</p>
                <p className="text-xs text-gray-500">Badge</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaTrophy className="text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-gray-400 mt-1">A legmagasabb szintű játékosok</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 bg-white/5 rounded-xl p-4 border border-white/10">
        <span className="text-gray-400 text-sm">Badge-ek:</span>
        {BADGE_INFO.map((badge, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-lg">{badge.icon}</span>
            <span className="text-sm text-gray-400">{badge.name}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {MOCK_LEADERBOARD.map((player, index) => (
          <LeaderboardRow key={player.id} player={player} index={index} />
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(page => (
          <button
            key={page}
            className={`w-10 h-10 rounded-lg font-medium transition-all ${
              page === 1
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
