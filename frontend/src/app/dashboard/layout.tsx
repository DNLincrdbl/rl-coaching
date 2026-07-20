'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaGraduationCap, 
  FaTrophy,
  FaChevronDown,
  FaBell,
  FaSignOutAlt,
  FaRocket,
  FaHome,
  FaProjectDiagram,
  FaUsers,
  FaLock,
  FaUserShield,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  RLMProvider,
  useRLM,
  RL_RANKS,
  getXPProgressInLevel,
  RLM_MEMBER_COUNT,
  COMMUNITY_UNLOCK_THRESHOLD,
} from '@/contexts/RLMContext';

const tabs = [
  { id: 'profile', label: 'Profil', icon: FaUser, href: '/dashboard' },
  { id: 'arena', label: 'Aréna', icon: FaProjectDiagram, href: '/dashboard/arena' },
  { id: 'learn', label: 'Kurzusok & Tutoriálok', icon: FaGraduationCap, href: '/dashboard/learn' },
  { id: 'community', label: 'Tanuljunk egymástól', icon: FaUsers, href: '/dashboard/community', communityLocked: true },
  { id: 'leaderboard', label: 'Leaderboard', icon: FaTrophy, href: '/dashboard/leaderboard', locked: true },
  { id: 'admin', label: 'Admin', icon: FaUserShield, href: '/dashboard/admin', adminOnly: true },
];

function RankSelectionModal({ onSelect }: { onSelect: (rank: string) => void }) {
  const [selectedRank, setSelectedRank] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <FaRocket className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Üdvözlünk a Rocket League Mesterfokon-ban!
          </h2>
          <p className="text-gray-400">
            Válaszd ki a jelenlegi rangodat, hogy a jövőben még jobban személyre szabhassuk számodra a programot.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8">
          {RL_RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setSelectedRank(rank)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRank === rank
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>

        <button
          onClick={() => selectedRank && onSelect(selectedRank)}
          disabled={!selectedRank}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedRank
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          Kezdjük!
        </button>
      </motion.div>
    </motion.div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, selectRank, isLoading, markNotificationRead } = useRLM();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const xpProgress = getXPProgressInLevel(profile.xp);
  const unreadNotifications = profile.notifications.filter(n => !n.read).length;
  const communityUnlocked = RLM_MEMBER_COUNT >= COMMUNITY_UNLOCK_THRESHOLD;

  // Close the dropdowns when clicking anywhere outside of them.
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const markAllNotificationsRead = () => {
    profile.notifications.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id));
  };

  // Auth guard: redirect unauthenticated users to the landing page.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/?login=1');
    }
  }, [authLoading, user, router]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <FaLock className="w-10 h-10 text-gray-500" />
        <p className="text-gray-400">Jelentkezz be a Rocket League Mesterfokon eléréséhez.</p>
        <Link href="/?login=1" className="rlm-btn-primary px-6 py-3">Bejelentkezés</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Rank Selection Modal - only shows once */}
      <AnimatePresence>
        {profile.rlmPurchased && !profile.hasSelectedRank && (
          <RankSelectionModal onSelect={selectRank} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-b border-white/10 z-[100]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <FaRocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">RL Mesterfokon</span>
            </Link>

            {/* User Stats Bar */}
            <div className="hidden md:flex items-center gap-6">
              {/* Level & XP */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-sm">
                  {profile.level}
                </div>
                <div className="w-32">
                  <div className="text-xs text-gray-400 mb-1">
                    {xpProgress.current} / {xpProgress.required} XP
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                      style={{ width: `${(xpProgress.current / xpProgress.required) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rank pill */}
              {profile.rank && (
                <div className="flex items-center gap-2 rlm-card px-3 py-2 !rounded-lg">
                  <FaTrophy className="w-4 h-4 text-orange-400" />
                  <span className="font-semibold text-white text-sm">{profile.rank}</span>
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Home Button */}
              <Link 
                href="/"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Vissza a főoldalra"
              >
                <FaHome className="w-5 h-5 text-gray-400" />
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setIsNotifOpen((v) => !v); setIsProfileMenuOpen(false); }}
                  className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <FaBell className="w-5 h-5 text-gray-400" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0A0A0C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <p className="font-semibold text-white">Értesítések</p>
                        {unreadNotifications > 0 && (
                          <button onClick={markAllNotificationsRead} className="text-xs text-orange-400 hover:text-orange-300">
                            Mind olvasott
                          </button>
                        )}
                      </div>
                      <div className="max-h-[26rem] overflow-y-auto rlm-scroll">
                        {profile.notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center text-sm text-gray-500">
                            Nincs értesítésed.
                          </div>
                        ) : (
                          profile.notifications.map((n) => {
                            const Icon =
                              n.type === 'success' ? FaCheckCircle :
                              n.type === 'warning' || n.type === 'error' ? FaExclamationTriangle :
                              FaInfoCircle;
                            const color =
                              n.type === 'success' ? 'text-green-400' :
                              n.type === 'warning' ? 'text-yellow-400' :
                              n.type === 'error' ? 'text-red-400' : 'text-blue-400';
                            return (
                              <button
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 ${
                                  n.read ? '' : 'bg-orange-500/[0.07]'
                                }`}
                              >
                                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(n.createdAt).toLocaleString('hu-HU')}
                                  </p>
                                </div>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => { setIsProfileMenuOpen((v) => !v); setIsNotifOpen(false); }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {profile.equippedProfilePicture ? (
                      <Image
                        src={profile.equippedProfilePicture}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <FaUser className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {user?.displayName || 'Felhasználó'}
                  </span>
                  <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="font-medium text-white">{user?.displayName}</p>
                          <p className="text-sm text-gray-400">{profile.rank || 'Nincs rang'}</p>
                          {/* Mobile stats */}
                          <div className="flex items-center gap-3 mt-3 md:hidden">
                            <span className="text-yellow-400 font-bold">Lv.{profile.level}</span>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaHome className="w-4 h-4" />
                            Vissza a főoldalra
                          </Link>
                          <button
                            onClick={() => { signOut(); setIsProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-white/5 transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            Kijelentkezés
                          </button>
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="fixed top-16 left-0 right-0 bg-black/60 backdrop-blur-xl border-b border-white/5 z-[90]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.filter((tab) => !tab.adminOnly || user.role === 'admin').map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
              const isAdmin = user.role === 'admin';
              // Admins (Zoli) can access every tab regardless of unlock state.
              const isLocked = !isAdmin && (tab.locked || (tab.communityLocked && !communityUnlocked));
              
              return (
                <Link
                  key={tab.id}
                  href={isLocked ? '#' : tab.href}
                  onClick={(e) => isLocked && e.preventDefault()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
                      : isLocked
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isLocked && <FaLock className="w-3 h-3" />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RLMProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RLMProvider>
  );
}