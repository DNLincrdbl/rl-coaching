'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaGraduationCap, 
  FaTrophy,
  FaChevronDown,
  FaBell,
  FaBolt,
  FaSignOutAlt,
  FaHome,
  FaProjectDiagram,
  FaUsers,
  FaLock,
  FaUserShield,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBookOpen,
  FaDiscord,
  FaVideo,
  FaSearch,
  FaBars,
  FaTimes,
  FaUpload,
  FaCog,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RlmLogo from '@/app/components/RlmLogo';
import { useAuth } from '@/contexts/AuthContext';
import {
  RLMProvider,
  useRLM,
  RL_RANKS,
  isRlmPlus,
} from '@/contexts/RLMContext';
import ProfileAvatar from './components/ProfileAvatar';
import ReportIssueButton from './components/ReportIssueButton';
import { errorMessage, showToast } from '@/lib/toast';
import { api } from '@/lib/api';

const NAV = [
  { id: 'home', label: 'Kezdőlap', icon: FaHome, href: '/dashboard' },
  { id: 'settings', label: 'Beállítások', icon: FaCog, href: '/dashboard/settings' },
  { id: 'learn', label: 'Kurzusok', icon: FaGraduationCap, href: '/dashboard/learn' },
  { id: 'arena', label: 'Aréna', icon: FaProjectDiagram, href: '/dashboard/arena' },
  { id: 'replays', label: 'Replay elemzés', icon: FaVideo, href: '/dashboard/profile' },
  { id: 'community', label: 'Közösség', icon: FaUsers, href: '/dashboard/community', plusOnly: true },
  { id: 'weekly', label: 'Kihívások', icon: FaBolt, href: '/dashboard/weekly' },
  { id: 'guide', label: 'Útmutató', icon: FaBookOpen, href: '/dashboard/guide' },
  { id: 'leaderboard', label: 'Leaderboard', icon: FaTrophy, href: '/dashboard/leaderboard', leaderboardLocked: true },
  { id: 'admin', label: 'Admin', icon: FaUserShield, href: '/dashboard/admin', adminOnly: true },
];

const handledEmailChanges = new Set<string>();

function navActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/dashboard/profile') {
    return pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/sheet/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function RankSelectionModal({
  onSelect,
  linked,
  discordName,
}: {
  onSelect: (payload: { rank: string; discordUsername: string }) => void | Promise<void>;
  linked?: boolean;
  discordName?: string | null;
}) {
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [discord, setDiscord] = useState(discordName || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauth, setOauth] = useState(false);

  useEffect(() => {
    void api.get<{ configured: boolean }>('/api/auth/discord/status')
      .then((r) => setOauth(r.configured))
      .catch(() => setOauth(false));
  }, []);

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
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">Első belépés</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
            Üdvözlünk.
          </h2>
          <p className="mt-3 text-white/50">
            Add meg a rangod (Zolinak kell a coachinghoz). A Discordot OAuth-tal vagy kézzel kötheted.
          </p>
        </div>

        <p className="text-sm font-medium text-gray-300 mb-2">Jelenlegi rang</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {RL_RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setSelectedRank(rank)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                selectedRank === rank
                  ? 'bg-white text-black'
                  : 'border border-white/15 text-white/70 hover:border-white/40'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FaDiscord className="inline w-4 h-4 mr-1 text-indigo-400" /> Discord (opcionális)
        </label>
        {linked ? (
          <p className="mb-6 text-sm text-emerald-400">Összekötve: {discordName || discord}</p>
        ) : (
          <>
            {oauth && (
              <button
                type="button"
                className="w-full mb-3 py-2.5 rounded-xl bg-[#5865F2] text-white font-semibold"
                onClick={async () => {
                  try {
                    const res = await api.get<{ url: string }>('/api/auth/discord/start');
                    window.location.href = res.url;
                  } catch (e) {
                    setError(errorMessage(e, 'A Discord indítás nem sikerült.'));
                  }
                }}
              >
                Discord összekötése
              </button>
            )}
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="vagy írd be a felhasználóneved"
              className="w-full mb-6 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
            />
          </>
        )}

        {error && (
          <p className="text-sm text-red-400 mb-4 text-center" role="alert">{error}</p>
        )}
        <button
          onClick={async () => {
            if (!selectedRank || busy) return;
            setBusy(true);
            setError(null);
            try {
              await onSelect({ rank: selectedRank, discordUsername: discord.trim() });
            } catch (e) {
              setError(errorMessage(e, 'A rang mentése nem sikerült.'));
            } finally {
              setBusy(false);
            }
          }}
          disabled={!selectedRank || busy}
          className={`w-full rounded-full py-4 text-lg font-semibold transition ${
            selectedRank
              ? 'bg-white text-black hover:bg-white/90'
              : 'cursor-not-allowed bg-white/10 text-white/30'
          }`}
        >
          {busy ? 'Mentés...' : 'Kezdjük!'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut, confirmEmail, confirmEmailChange, resendConfirmation } = useAuth();
  const { profile, completeOnboarding, isLoading, markNotificationRead } = useRLM();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = profile.notifications.filter(n => !n.read).length;
  const leaderboardUnlocked = profile.features.leaderboardUnlocked;

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
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
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
    if (authLoading || user) return;
    const params = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
    const confirm = params?.get('confirm');
    if (confirm && confirm !== '1' && confirm !== 'error') {
      router.replace(`/?confirm=${encodeURIComponent(confirm)}`);
      return;
    }
    const emailChange = params?.get('emailChange');
    if (emailChange && emailChange !== '1') {
      router.replace(`/?emailChange=${encodeURIComponent(emailChange)}`);
      return;
    }
    router.replace('/?login=1');
  }, [authLoading, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    const q = new URLSearchParams(window.location.search);
    const confirm = q.get('confirm');
    if (confirm) {
      void confirmEmail(confirm)
        .then(() => showToast('E-mail cím megerősítve.', 'success'))
        .catch((e) => showToast(errorMessage(e, 'A megerősítés nem sikerült.')))
        .finally(() => {
          q.delete('confirm');
          const next = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
          router.replace(next);
        });
    }
    if (q.get('confirmed') === '1') {
      showToast('E-mail cím megerősítve.', 'success');
      q.delete('confirmed');
      router.replace(`${window.location.pathname}${q.toString() ? `?${q}` : ''}`);
    }
    const discord = q.get('discord');
    if (discord === 'ok') showToast('Discord összekötve.', 'success');
    if (discord === 'taken') showToast('Ez a Discord fiók már másik userhez tartozik.');
    if (discord === 'error') showToast('A Discord összekötés nem sikerült.');
    if (discord) {
      q.delete('discord');
      router.replace(`${window.location.pathname}${q.toString() ? `?${q}` : ''}`);
    }
    const emailChange = q.get('emailChange');
    if (emailChange && emailChange !== '1' && !handledEmailChanges.has(emailChange)) {
      handledEmailChanges.add(emailChange);
      void confirmEmailChange(emailChange)
        .then(() => showToast('Az új e-mail cím megerősítve.', 'success'))
        .catch((e) => showToast(errorMessage(e, 'A megerősítés nem sikerült.')))
        .finally(() => {
          const next = new URLSearchParams(window.location.search);
          next.delete('emailChange');
          router.replace(`${window.location.pathname}${next.toString() ? `?${next}` : ''}`);
        });
    }
  }, [user, confirmEmail, confirmEmailChange, router]);

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

  const plus = isRlmPlus(profile.subscriptionTier);
  const isAdmin = user.role === 'admin';
  const q = search.trim().toLowerCase();
  const searchHits = q
    ? [
        ...NAV.filter((t) => !t.adminOnly || isAdmin).filter((t) => t.label.toLowerCase().includes(q)),
        { id: 'upload', label: 'Replay feltöltése', href: '/dashboard/profile?book=1', icon: FaUpload },
      ].filter((t, i, arr) => arr.findIndex((x) => x.href === t.href && x.label === t.label) === i)
    : [];

  const renderNavLink = (tab: typeof NAV[number], onNavigate?: () => void) => {
    const locked =
      !isAdmin &&
      ((tab.plusOnly && !plus) || (tab.leaderboardLocked && !leaderboardUnlocked));
    const active = navActive(pathname, tab.href);
    return (
      <Link
        key={tab.id}
        href={locked ? '#' : tab.href}
        onClick={(e) => {
          if (locked) e.preventDefault();
          else onNavigate?.();
        }}
        className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? 'text-white'
            : locked
              ? 'cursor-not-allowed text-white/25'
              : 'text-white/50 hover:text-white'
        }`}
      >
        <tab.icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : ''}`} />
        <span className="flex-1">{tab.label}</span>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A2B]" />}
        {locked && <FaLock className="h-3 w-3" />}
      </Link>
    );
  };

  const sidebarBody = (
    <>
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center" aria-label="RLM" onClick={() => setSidebarOpen(false)}>
          <RlmLogo height={40} priority />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto rlm-scroll px-3 space-y-0.5">
        {NAV.filter((t) => !t.adminOnly || isAdmin).map((tab) => renderNavLink(tab, () => setSidebarOpen(false)))}
        <p className="px-3 pb-2 pt-6 text-[11px] uppercase tracking-[0.22em] text-white/30">Gyors linkek</p>
        <Link
          href="/dashboard/profile?book=1"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 rounded-full px-3 py-2 text-sm text-white/50 hover:text-white"
        >
          <FaUpload className="h-4 w-4" /> Új replay feltöltése
        </Link>
        <Link
          href="/dashboard/learn"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 rounded-full px-3 py-2 text-sm text-white/50 hover:text-white"
        >
          <FaSearch className="h-4 w-4" /> Kurzus keresése
        </Link>
        <Link
          href={plus || isAdmin ? '/dashboard/community' : '#'}
          onClick={(e) => {
            if (!(plus || isAdmin)) e.preventDefault();
            else setSidebarOpen(false);
          }}
          className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm ${
            plus || isAdmin ? 'text-white/50 hover:text-white' : 'cursor-not-allowed text-white/25'
          }`}
        >
          <FaUsers className="w-4 h-4" /> Közösségi replayek
        </Link>
      </nav>
      <div className="p-3 space-y-3">
        {!plus && (
          <Link
            href="/#pricing"
            className="block rounded-2xl border border-white/15 p-4"
            onClick={() => setSidebarOpen(false)}
          >
            <p className="text-3xl font-black tracking-[-0.04em] text-white">RLM+</p>
            <p className="mt-2 text-xs leading-relaxed text-white/45">Havi replay elemzés és a közösségi feed.</p>
            <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">Csomagok</span>
          </Link>
        )}
        <Link
          href="/dashboard/profile"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 rounded-full p-2 hover:bg-white/5"
        >
          <ProfileAvatar colorId={profile.avatarColor} size={36} rounded="rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.displayName}</p>
            <p className="text-xs text-white/40">Szint {profile.level}</p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      <AnimatePresence>
        {profile.rlmPurchased && !profile.hasSelectedRank && (
          <RankSelectionModal onSelect={completeOnboarding} linked={profile.discordLinked} discordName={profile.discordUsername} />
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Menü bezárása"
          className="fixed inset-0 z-[110] bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[120] flex h-screen w-[16.5rem] flex-col border-r border-white/10 bg-black transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          type="button"
          className="absolute top-4 right-3 p-2 rounded-lg text-gray-400 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Bezárás"
        >
          <FaTimes />
        </button>
        {sidebarBody}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-[100] h-16 border-b border-white/10 bg-black/75 backdrop-blur-xl">
          <div className="h-full px-3 sm:px-5 flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-lg bg-white/5 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menü"
            >
              <FaBars className="text-gray-300" />
            </button>

            <div className="flex-1 max-w-xl mx-auto relative" ref={searchRef}>
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Keresés kurzusok, replay, játékosok között…"
                className="w-full rounded-full border border-white/15 bg-transparent py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
              />
              {searchOpen && q && (
                <div className="absolute left-0 right-0 top-full mt-2 rlm-card overflow-hidden z-50">
                  {searchHits.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">Nincs találat.</p>
                  ) : (
                    searchHits.map((hit) => (
                      <Link
                        key={`${hit.href}-${hit.label}`}
                        href={hit.href}
                        onClick={() => { setSearchOpen(false); setSearch(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5"
                      >
                        {'icon' in hit && hit.icon ? <hit.icon className="w-3.5 h-3.5 text-orange-400" /> : null}
                        {hit.label}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ReportIssueButton />
              <div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 sm:flex">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">XP</span>
                <span className="text-sm font-semibold text-white">{profile.xp.toLocaleString('hu-HU')}</span>
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => { setIsNotifOpen((v) => !v); setIsProfileMenuOpen(false); }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:border-white/40"
                >
                  <FaBell className="w-4 h-4 text-gray-400" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl sm:w-96"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <p className="font-semibold text-white">Értesítések</p>
                        {unreadNotifications > 0 && (
                          <button type="button" onClick={markAllNotificationsRead} className="text-xs text-white/60 hover:text-white">
                            Mind olvasott
                          </button>
                        )}
                      </div>
                      <div className="max-h-[26rem] overflow-y-auto rlm-scroll">
                        {profile.notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center text-sm text-gray-500">Nincs értesítésed.</div>
                        ) : (
                          profile.notifications.map((n) => {
                            const Icon =
                              n.type === 'success' ? FaCheckCircle :
                              n.type === 'warning' || n.type === 'error' ? FaExclamationTriangle :
                              FaInfoCircle;
                            const color =
                              n.type === 'success' ? 'text-green-400' :
                              n.type === 'warning' ? 'text-yellow-400' :
                              n.type === 'error' ? 'text-red-400' : 'text-orange-400';
                            return (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => markNotificationRead(n.id)}
                                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 ${
                                  n.read ? '' : 'bg-orange-500/[0.07]'
                                }`}
                              >
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('hu-HU')}</p>
                                </div>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => { setIsProfileMenuOpen((v) => !v); setIsNotifOpen(false); }}
                  className="flex items-center gap-2 rounded-full border border-white/15 px-2 py-1 hover:border-white/40"
                >
                  <ProfileAvatar colorId={profile.avatarColor} size={32} rounded="rounded-full" />
                  <span className="hidden md:block text-left">
                    <span className="block text-sm font-medium text-white leading-tight">{user.displayName}</span>
                    <span className="block text-[11px] text-gray-500">Szint {profile.level}</span>
                  </span>
                  <FaChevronDown className={`hidden md:block w-3 h-3 text-gray-400 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-sm text-gray-400">{profile.rank || 'Nincs rang'}</p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="w-4 h-4" /> Profil
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaCog className="w-4 h-4" /> Beállítások
                      </Link>
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaHome className="w-4 h-4" /> Vissza a főoldalra
                      </Link>
                      <button
                        type="button"
                        onClick={() => { signOut(); setIsProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-white/5"
                      >
                        <FaSignOutAlt className="w-4 h-4" /> Kijelentkezés
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-stage rlm-glow rlm-glow-title relative flex-1 px-4 py-8 sm:px-8">
          {!profile.emailVerified && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/15 p-4 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-white/70">Erősítsd meg az e-mail címed, hogy megkapd a jelszó-resetet és az értesítéseket.</p>
              <button
                type="button"
                className="rlm-btn-primary px-4 py-1.5 text-sm"
                onClick={async () => {
                  try {
                    const stored = sessionStorage.getItem('rlm-confirm-token');
                    if (stored) {
                      await confirmEmail(stored);
                      showToast('E-mail megerősítve.', 'success');
                      return;
                    }
                    const res = await resendConfirmation();
                    if (res.confirmToken) {
                      sessionStorage.setItem('rlm-confirm-token', res.confirmToken);
                      await confirmEmail(res.confirmToken);
                      showToast('E-mail megerősítve (helyi mód).', 'success');
                    } else {
                      showToast(res.message, 'info');
                    }
                  } catch (e) {
                    showToast(errorMessage(e, 'Nem sikerült a megerősítés.'));
                  }
                }}
              >
                Megerősítés
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
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