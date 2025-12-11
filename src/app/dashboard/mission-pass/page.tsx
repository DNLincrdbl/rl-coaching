'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaTasks, 
  FaRedo, 
  FaCheck,
  FaLock,
  FaUpload,
  FaSearch,
  FaFileVideo,
  FaTrophy,
  FaStar
} from 'react-icons/fa';
import { useRLM, MISSION_PASS_REWARDS, Mission, MissionDifficulty } from '@/contexts/RLMContext';

// Sample missions pool
const MISSION_POOL: Omit<Mission, 'id' | 'completed' | 'rerolled'>[] = [
  { name: 'Air Dribble Bump', description: 'Lőj gólt air dribble bump-pal', xpReward: 100, difficulty: 'easy', forBadge: false },
  { name: 'Double Tap', description: 'Lőj gólt double tap-pal', xpReward: 100, difficulty: 'easy', forBadge: false },
  { name: 'Ceiling Shot', description: 'Lőj gólt ceiling shot-tal', xpReward: 150, difficulty: 'medium', forBadge: false },
  { name: 'Flip Reset', description: 'Lőj gólt flip reset-tel', xpReward: 150, difficulty: 'medium', forBadge: false },
  { name: 'Musty Flick', description: 'Lőj gólt musty flick-kel', xpReward: 200, difficulty: 'hard', forBadge: false },
  { name: 'Breezi Flick', description: 'Lőj gólt breezi flick-kel', xpReward: 200, difficulty: 'hard', forBadge: false },
  { name: 'Ground Pinch', description: 'Lőj gólt ground pinch-csel', xpReward: 100, difficulty: 'easy', forBadge: false },
  { name: 'Wall Pinch', description: 'Lőj gólt wall pinch-csel', xpReward: 150, difficulty: 'medium', forBadge: false },
  { name: 'Air Roll Shot', description: 'Lőj gólt folyamatos air roll-al', xpReward: 100, difficulty: 'easy', forBadge: false },
  { name: 'Psycho', description: 'Lőj gólt psycho-val', xpReward: 200, difficulty: 'hard', forBadge: false },
  // Badge missions (special hard ones)
  { name: 'Aerial Master Challenge', description: 'Lőj 5 aerial gólt egymás után', xpReward: 500, difficulty: 'legendary', forBadge: true },
  { name: 'Wall Wizard Challenge', description: 'Lőj 5 wall shot-ot egymás után', xpReward: 500, difficulty: 'legendary', forBadge: true },
  { name: 'Rotation King Challenge', description: 'Nyerj 5 meccset tökéletes rotációval', xpReward: 500, difficulty: 'legendary', forBadge: true },
  { name: 'Boost Demon Challenge', description: 'Nyerj 5 meccset boost starving-gal', xpReward: 500, difficulty: 'legendary', forBadge: true },
  { name: 'Mechanical God Challenge', description: 'Lőj 10 különböző mechanikus gólt', xpReward: 500, difficulty: 'legendary', forBadge: true },
];

const DIFFICULTY_COLORS: Record<MissionDifficulty, string> = {
  easy: 'text-green-400 bg-green-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  hard: 'text-orange-400 bg-orange-400/10',
  expert: 'text-red-400 bg-red-400/10',
  legendary: 'text-purple-400 bg-purple-400/10',
};

const DIFFICULTY_LABELS: Record<MissionDifficulty, string> = {
  easy: 'Könnyű',
  medium: 'Közepes',
  hard: 'Nehéz',
  expert: 'Szakértő',
  legendary: 'Legendás',
};

function MissionCard({ mission, onReroll, index }: { 
  mission: Mission; 
  onReroll: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-xl border transition-all ${
        mission.completed
          ? 'bg-green-500/10 border-green-500/30'
          : mission.forBadge
          ? 'bg-purple-500/10 border-purple-500/30'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white">{mission.name}</h3>
            {mission.forBadge && (
              <FaTrophy className="w-4 h-4 text-purple-400" />
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">{mission.description}</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[mission.difficulty]}`}>
              {DIFFICULTY_LABELS[mission.difficulty]}
            </span>
            <span className="text-sm text-yellow-400 font-medium flex items-center gap-1">
              <FaStar className="w-3 h-3" />
              {mission.xpReward} XP
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          {mission.completed ? (
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <FaCheck className="w-5 h-5 text-white" />
            </div>
          ) : (
            <button
              onClick={onReroll}
              disabled={mission.rerolled}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                mission.rerolled
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
              }`}
              title={mission.rerolled ? 'Már újrapörgetted' : 'Újrapörgetés'}
            >
              <FaRedo className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MissionPassTier({ tier, reward, isUnlocked, isCurrent, onClaim }: {
  tier: number;
  reward: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClaim: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={isCurrent ? { scale: 1.1 } : {}}
        onClick={isCurrent ? onClaim : undefined}
        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
          isUnlocked
            ? 'bg-gradient-to-br from-orange-500 to-red-500'
            : isCurrent
            ? 'bg-gradient-to-br from-orange-500/50 to-red-500/50 border-2 border-orange-500 animate-pulse'
            : 'bg-white/10 border border-white/10'
        }`}
      >
        {isUnlocked ? (
          <FaCheck className="w-5 h-5 text-white" />
        ) : (
          <>
            <span className="text-xs text-gray-400">{tier}</span>
          </>
        )}
      </motion.div>
      <div className="flex items-center gap-1 mt-2">
        <Image src="/Boost.png" alt="Boost" width={14} height={14} />
        <span className={`text-sm font-medium ${isUnlocked ? 'text-gray-400' : 'text-white'}`}>
          {reward}
        </span>
      </div>
    </div>
  );
}

export default function MissionPassPage() {
  const { profile, addXP, claimMissionPassReward, addNotification } = useRLM();
  const [activeMissions, setActiveMissions] = useState<Mission[]>(() => 
    MISSION_POOL.slice(0, 5).map((m, i) => ({
      ...m,
      id: `mission-${i}`,
      completed: false,
      rerolled: false,
    }))
  );
  const [submissionType, setSubmissionType] = useState<'mission' | 'replay' | null>(null);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [missionSearch, setMissionSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReroll = (missionId: string) => {
    setActiveMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.rerolled) {
        const availableMissions = MISSION_POOL.filter(
          pm => !prev.some(am => am.name === pm.name)
        );
        if (availableMissions.length > 0) {
          const newMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
          return {
            ...newMission,
            id: missionId,
            completed: false,
            rerolled: true,
          };
        }
      }
      return m;
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Handle actual file upload
      addNotification('Replay sikeresen beküldve! Hamarosan értesítünk az eredményről.', 'success');
      setSubmissionType(null);
      setSelectedMission('');
    }
  };

  const filteredMissions = MISSION_POOL.filter(m => 
    m.name.toLowerCase().includes(missionSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaTasks className="text-orange-500" />
          Mission Pass
        </h1>
        <p className="text-gray-400 mt-1">Teljesíts küldetéseket és szerezz jutalmakat!</p>
      </div>

      {/* Mission Pass Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold text-white mb-6">Mission Pass Progress</h2>
        
        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="absolute top-7 left-0 right-0 h-1 bg-white/10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
              style={{ width: `${(profile.missionPassProgress / 11) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between relative z-10">
            {MISSION_PASS_REWARDS.map((reward, index) => (
              <MissionPassTier
                key={index}
                tier={index + 1}
                reward={reward}
                isUnlocked={profile.missionPassProgress > index}
                isCurrent={profile.missionPassProgress === index}
                onClaim={() => claimMissionPassReward(index + 1)}
              />
            ))}
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm">
          Küldj be replay-eket a szintek eléréséhez!
        </p>
      </motion.div>

      {/* Active Missions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Aktív Küldetések</h2>
          <span className="text-sm text-gray-400">2 hetente frissül</span>
        </div>
        
        <div className="space-y-3">
          {activeMissions.map((mission, index) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onReroll={() => handleReroll(mission.id)}
              index={index}
            />
          ))}
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Minden küldetés 1x újrapörgethető. A replay-eket freeplay-ben lődd, ahol látszik a gól!
        </p>
      </motion.div>

      {/* Replay Analysis Submission Bonus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20"
      >
        <div className="flex items-center gap-3 mb-2">
          <FaFileVideo className="w-6 h-6 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Replay Elemzés Beküldés</h2>
        </div>
        <p className="text-gray-400 mb-4">
          Küldj be egy saját magad által elemzett replay-t extra XP-ért!
        </p>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">+250 XP</span>
          <span className="text-gray-400">bónusz</span>
        </div>
      </motion.div>

      {/* File Submission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold text-white mb-4">Replay Beküldés</h2>
        
        {/* Submission Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSubmissionType('replay')}
            className={`p-4 rounded-xl border-2 transition-all ${
              submissionType === 'replay'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <FaFileVideo className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white font-medium">Replay Elemzés</p>
            <p className="text-xs text-gray-400 mt-1">Saját elemzés beküldése</p>
          </button>
          
          <button
            onClick={() => setSubmissionType('mission')}
            className={`p-4 rounded-xl border-2 transition-all ${
              submissionType === 'mission'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <FaTasks className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white font-medium">Küldetés</p>
            <p className="text-xs text-gray-400 mt-1">Teljesített küldetés</p>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {submissionType === 'mission' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              {/* Mission Search */}
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Keress küldetést..."
                  value={missionSearch}
                  onChange={(e) => setMissionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              
              {/* Mission Selection */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredMissions.map((mission, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMission(mission.name)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedMission === mission.name
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{mission.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[mission.difficulty]}`}>
                        {DIFFICULTY_LABELS[mission.difficulty]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload */}
        {(submissionType === 'replay' || (submissionType === 'mission' && selectedMission)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".replay,.mp4,.mov,.avi"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-orange-500/50 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FaUpload className="w-5 h-5" />
              <span>Fájl kiválasztása vagy húzd ide</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
