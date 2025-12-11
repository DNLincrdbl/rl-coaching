'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FaUser, 
  FaStar, 
  FaTrophy, 
  FaTasks, 
  FaCheckCircle,
  FaClock,
  FaRocket
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRLM, getXPProgressInLevel, Badge } from '@/contexts/RLMContext';

function BadgeDisplay({ badge, size = 'normal' }: { badge: Badge; size?: 'normal' | 'large' }) {
  const sizeClasses = size === 'large' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg';
  
  return (
    <div className="group relative">
      <div
        className={`${sizeClasses} rounded-xl flex items-center justify-center transition-all ${
          badge.unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50'
            : 'bg-white/5 border border-white/10 opacity-40'
        }`}
      >
        <span className={badge.unlocked ? '' : 'grayscale'}>{badge.icon}</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0D1321] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <p className="text-sm font-medium text-white">{badge.name}</p>
        <p className="text-xs text-gray-400">{badge.description}</p>
        {badge.unlocked && badge.level > 0 && (
          <p className="text-xs text-yellow-400 mt-1">Level {badge.level}</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 rounded-2xl p-5 border border-white/10"
    >
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useRLM();
  const xpProgress = getXPProgressInLevel(profile.xp);

  const completedMissionsCount = profile.completedMissions.length;
  const unlockedBadgesCount = profile.badges.filter(b => b.unlocked).length;
  const daysSinceJoined = Math.floor((new Date().getTime() - new Date(profile.joinedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8">
      {/* Profile Header with Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Banner */}
        <div 
          className="h-48 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600"
          style={profile.equippedProfileBanner ? { 
            backgroundImage: `url(${profile.equippedProfileBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        />

        {/* Profile Content */}
        <div className="bg-[#0D1321] p-6 pt-16 relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-[#0D1321] flex items-center justify-center overflow-hidden">
              {profile.equippedProfilePicture ? (
                <Image
                  src={profile.equippedProfilePicture}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <FaUser className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="ml-0 sm:ml-32">
              <h1 className="text-2xl font-bold text-white">
                {user?.displayName || 'Felhasználó'}
              </h1>
              <p className="text-gray-400">{profile.rank || 'Nincs rang beállítva'}</p>
            </div>

            {/* Level & XP Display */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Szint</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {profile.level}
                </p>
              </div>
              <div className="w-40">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{xpProgress.current} XP</span>
                  <span>{xpProgress.required} XP</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(xpProgress.current / xpProgress.required) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaRocket}
          label="Boost"
          value={profile.boost}
          color="bg-gradient-to-br from-orange-500 to-red-500"
        />
        <StatCard
          icon={FaTasks}
          label="Teljesített Küldetések"
          value={completedMissionsCount}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
        <StatCard
          icon={FaTrophy}
          label="Megszerzett Badge-ek"
          value={`${unlockedBadgesCount}/5`}
          color="bg-gradient-to-br from-yellow-500 to-amber-500"
        />
        <StatCard
          icon={FaClock}
          label="Tagság Napja"
          value={daysSinceJoined}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          Badge-ek
        </h2>
        <div className="flex flex-wrap gap-4">
          {profile.badges.map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="large" />
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Teljesítsd a különleges küldetéseket a badge-ek megszerzéséhez!
        </p>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaStar className="text-orange-400" />
          Legutóbbi Aktivitás
        </h2>
        
        {profile.notifications.length > 0 ? (
          <div className="space-y-3">
            {profile.notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  notification.read ? 'bg-white/5' : 'bg-orange-500/10 border border-orange-500/20'
                }`}
              >
                <FaCheckCircle className={`w-5 h-5 mt-0.5 ${
                  notification.type === 'success' ? 'text-green-400' :
                  notification.type === 'warning' ? 'text-yellow-400' :
                  notification.type === 'error' ? 'text-red-400' : 'text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Még nincs aktivitásod. Kezdj el küldetéseket teljesíteni!</p>
          </div>
        )}
      </motion.div>

      {/* Course Progress */}
      {profile.courseProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-4">Kurzus Előrehaladás</h2>
          <div className="space-y-4">
            {profile.courseProgress.map((course) => (
              <div key={course.courseId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{course.courseId}</span>
                  <span className="text-gray-400">{course.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}