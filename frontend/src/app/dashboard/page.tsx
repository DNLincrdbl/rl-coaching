'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaGraduationCap,
  FaProjectDiagram,
  FaVideo,
  FaCrown,
  FaChevronRight,
  FaBolt,
  FaCheck,
  FaLock,
  FaUpload,
  FaSearch,
  FaUsers,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import {
  useRLM,
  getXPProgressInLevel,
  isRlmPlus,
  EXTRA_REPLAY_PRICE,
} from '@/contexts/RLMContext';
import { COURSES as FALLBACK_COURSES, TUTORIALS as FALLBACK_TUTORIALS, Course } from '@/lib/data/learn';
import { MONTHLY_ARENA_NODES } from '@/lib/data/arena';
import { RATING_TOPICS, RATING_COLOR_META, ratingColorFor, sheetScore } from '@/lib/data/coaching';
import { api, resolveVideoUrl } from '@/lib/api';

interface WeeklyChallenge {
  id: string;
  title: string;
  xp: number;
  credit: number;
  done: boolean;
}

interface WeeklyResponse {
  resetsAt: string;
  completed: number;
  total: number;
  challenges: WeeklyChallenge[];
}

interface LbRow {
  id: number;
  position: number;
  name: string;
  rank: string | null;
  score: number;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins} perce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} órája`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'tegnap';
  return `${days} napja`;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { profile } = useRLM();
  const xp = getXPProgressInLevel(profile.xp);
  const plus = isRlmPlus(profile.subscriptionTier);
  const name = user?.displayName || 'játékos';
  const sheets = profile.coachingSheets;
  const latest = sheets[0];
  const arenaDone = (profile.arenaProgress.dribble?.length || 0) + (profile.arenaProgress.aerial?.length || 0);
  const coursesDone = profile.courseProgress.filter((c) => c.progress > 0).length;
  const pendingSubs = profile.submissions.filter((s) => s.status === 'pending').length;

  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [tutorialCount, setTutorialCount] = useState(FALLBACK_TUTORIALS.length);
  const [weekly, setWeekly] = useState<WeeklyResponse | null>(null);
  const [board, setBoard] = useState<{ top: LbRow[]; me: LbRow | null; unlocked: boolean } | null>(null);

  useEffect(() => {
    void api.get<{ courses: Course[]; tutorials: { id: string }[] }>('/api/learn')
      .then((res) => {
        if (res.courses?.length) setCourses(res.courses);
        if (res.tutorials?.length) setTutorialCount(res.tutorials.length);
      })
      .catch(() => {});
    void api.get<WeeklyResponse>('/api/weekly').then(setWeekly).catch(() => {});
    void api.get<{ top: LbRow[]; me: LbRow | null; unlocked: boolean }>('/api/leaderboard')
      .then((res) => setBoard({ top: (res.top || []).slice(0, 3), me: res.me, unlocked: Boolean(res.unlocked) }))
      .catch(() => {});
  }, []);

  const featured = useMemo(() => courses.slice(0, 3), [courses]);
  const weeklyLeft = weekly ? Math.max(0, weekly.total - weekly.completed) : 0;
  const resetDays = weekly?.resetsAt
    ? Math.max(0, Math.ceil((new Date(weekly.resetsAt).getTime() - Date.now()) / 86400000))
    : null;

  const shortcuts = [
    {
      href: '/dashboard/learn',
      icon: FaGraduationCap,
      label: 'Kurzusok',
      hint: 'Fejleszd a tudásod',
      meta: `${tutorialCount} tutoriál`,
    },
    {
      href: '/dashboard/arena',
      icon: FaProjectDiagram,
      label: 'Aréna',
      hint: 'Építsd a skill fádat',
      meta: `${arenaDone}/${MONTHLY_ARENA_NODES} node`,
    },
    {
      href: '/dashboard/profile#elemzesek',
      icon: FaVideo,
      label: 'Replay elemzés',
      hint: 'Elemzéseid a profilodon',
      meta: sheets.length ? `${sheets.length} sheet` : 'Még nincs sheet',
    },
    {
      href: '/dashboard/profile?book=1',
      icon: FaCrown,
      label: 'Coaching',
      hint: 'Replay beküldése Zolinak',
      meta: plus ? `${profile.coachingCredits + profile.extraReplayCredits} kredit` : 'RLM+',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem] gap-5">
        <div className="space-y-5">
          <section>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">Kezdőlap</p>
            <h1 className="mt-3 max-w-4xl">
              Üdv újra, {name}.
            </h1>
            <p className="mt-4 max-w-xl text-white/50">Kurzusok, aréna, heti küldetések és replay elemzés egy helyen.</p>
            <div className="mt-8 max-w-md">
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/40">
                <span>Szint {profile.level}</span>
                <span>{xp.current} / {xp.required} XP</span>
              </div>
              <div className="h-px overflow-hidden bg-white/15">
                <div
                  className="h-full bg-white"
                  style={{ width: `${Math.min(100, (xp.current / xp.required) * 100)}%` }}
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {shortcuts.map((s) => (
              <Link key={s.href} href={s.href} className="rlm-card rlm-card-hover p-4 block">
                <s.icon className="mb-4 h-4 w-4 text-white/70" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{s.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">{s.hint}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-white/45">
                  {s.meta} <FaChevronRight className="w-2.5 h-2.5" />
                </p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rlm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FaVideo className="text-orange-400" /> Legutóbbi replay elemzés
                </h2>
                <Link href="/dashboard/profile#elemzesek" className="text-xs text-white/45 hover:text-white">Összes</Link>
              </div>
              {latest ? (
                <Link href={`/dashboard/sheet/${latest.id}`} className="block group">
                  {latest.videoUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3">
                      <video src={resolveVideoUrl(latest.videoUrl)} className="w-full h-full object-cover" muted />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold group-hover:text-orange-300">{latest.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(latest.createdAt).toLocaleString('hu-HU')}</p>
                    </div>
                    <span className="text-lg font-bold rlm-gradient-text">{sheetScore(latest)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {RATING_TOPICS.map((t) => (
                      <span key={t.id} className={`w-2.5 h-2.5 rounded-full ${RATING_COLOR_META[ratingColorFor(latest, t.id)].css}`} title={t.label} />
                    ))}
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-gray-500">Még nincs replay elemzésed. A coaching után itt jelenik meg.</p>
              )}
            </div>

            <div className="rlm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FaBolt className="text-yellow-400" /> Heti kihívások
                </h2>
                <span className="text-xs text-gray-500">
                  {resetDays != null ? `Reset: ${resetDays} nap` : ''}
                </span>
              </div>
              {weekly ? (
                <div className="space-y-2">
                  {weekly.challenges.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        c.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        {c.done ? <FaCheck className="w-3 h-3" /> : <FaBolt className="w-3 h-3" />}
                      </span>
                      <p className={`flex-1 text-sm ${c.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{c.title}</p>
                      <span className="text-xs text-white/45">+{c.xp} XP</span>
                    </div>
                  ))}
                  <Link href="/dashboard/weekly" className="block pt-2 text-center text-sm text-white/50 hover:text-white">
                    {weeklyLeft > 0 ? `${weekly.completed}/${weekly.total} kész · nyisd meg a packed` : 'Heti pack kész'}
                  </Link>
                </div>
              ) : (
                <Link href="/dashboard/weekly" className="text-sm text-gray-400 hover:text-white">Heti küldetések megnyitása</Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rlm-card p-5">
              <h2 className="font-bold text-white mb-4">Statisztikáid</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Replay elemzés', value: sheets.length },
                  { label: 'Aréna node', value: `${arenaDone}/${MONTHLY_ARENA_NODES}` },
                  { label: 'Havi kredit', value: profile.coachingCredits },
                  { label: 'Extra replay', value: profile.extraReplayCredits },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.03] p-3">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rlm-card p-5">
              <h2 className="font-bold text-white mb-4">Gyors elérés</h2>
              <div className="space-y-1">
                {[
                  { href: '/dashboard/profile?book=1', icon: FaUpload, label: 'Új replay feltöltése', sub: 'Kreditből elemzés Zolitól' },
                  { href: '/dashboard/learn', icon: FaSearch, label: 'Kurzus keresése', sub: `${tutorialCount} tutoriál elérhető` },
                  { href: '/dashboard/arena', icon: FaProjectDiagram, label: 'Aréna', sub: 'Dribble és Aerial fa' },
                  { href: '/dashboard/community', icon: FaUsers, label: 'Közösségi replayek', sub: 'RLM+ feed', plus: true },
                ].map((item) => {
                  const locked = Boolean(item.plus) && !plus && user?.role !== 'admin';
                  return (
                    <Link
                      key={item.href}
                      href={locked ? '#' : item.href}
                      onClick={(e) => locked && e.preventDefault()}
                      className={`flex items-center gap-3 p-2.5 rounded-xl ${locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
                    >
                      <item.icon className="h-4 w-4 text-white/60" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.sub}</p>
                      </div>
                      {locked ? <FaLock className="w-3 h-3 text-gray-600" /> : <FaChevronRight className="w-3 h-3 text-gray-600" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">Kiemelt kurzusok</h2>
              <Link href="/dashboard/learn" className="text-xs text-white/45 hover:text-white">Összes megtekintése</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featured.map((c) => {
                const prog = profile.courseProgress.find((p) => p.courseId === c.id)?.progress || 0;
                return (
                  <Link key={c.id} href="/dashboard/learn" className="rlm-card rlm-card-hover overflow-hidden block">
                    <div className="relative aspect-[16/9]">
                      <Image src={c.image} alt={c.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white line-clamp-1">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{c.lessons.length} lecke · {c.rankRange}</p>
                      {prog > 0 && (
                        <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${prog}%` }} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rlm-card p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Aktuális rang</p>
            <p className="text-xl font-bold text-white">{profile.rank || 'Nincs beállítva'}</p>
            <p className="text-sm text-gray-500 mt-1">Szint {profile.level}</p>
            <Link href="/dashboard/profile" className="mt-4 inline-block text-xs text-white/45 hover:text-white">Profil és rang</Link>
          </div>

          <div className="rlm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-gray-500">Aktív előfizetés</p>
              <Link href="/#pricing" className="text-xs text-white/45 hover:text-white">Csomag kezelése</Link>
            </div>
            <p className="text-lg font-bold text-white">{plus ? 'RLM+' : 'RLM'}</p>
            <p className="text-sm text-gray-400">{plus ? '7.990 Ft / hó' : '1.990 Ft / hó'}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Havi replay kredit</span>
                <span className="text-white">{profile.coachingCredits}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Extra replay</span>
                <span className="text-white">{profile.extraReplayCredits}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Függő beküldés</span>
                <span className="text-white">{pendingSubs}</span>
              </div>
            </div>
            {!plus && (
              <p className="text-[11px] text-gray-500 mt-3">
                Extra replay {EXTRA_REPLAY_PRICE.toLocaleString('hu-HU')} Ft — RLM+ kell hozzá.
              </p>
            )}
          </div>

          <div className="rlm-card p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Legutóbbi aktivitásod</p>
            {profile.notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Még nincs aktivitásod.</p>
            ) : (
              <div className="space-y-3">
                {profile.notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6A2B]" />
                    <div>
                      <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{relativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rlm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-gray-500">Leaderboard</p>
              {board?.unlocked && (
                <Link href="/dashboard/leaderboard" className="text-xs text-white/45 hover:text-white">Teljes lista</Link>
              )}
            </div>
            {!board?.unlocked ? (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <FaLock className="w-3 h-3" /> {profile.features.leaderboardUnlockThreshold} tagnál nyílik.
              </p>
            ) : (
              <div className="space-y-2">
                {(board.top || []).map((row) => (
                  <Link
                    key={row.id}
                    href={`/dashboard/player/${row.id}`}
                    className="flex items-center gap-2 text-sm hover:bg-white/5 rounded-lg px-1 py-1"
                  >
                    <span className="w-5 text-gray-500 text-xs">{row.position}</span>
                    <span className="flex-1 text-white truncate">{row.name}</span>
                    <span className="text-xs text-white/70">{row.score}</span>
                  </Link>
                ))}
                {board.me && board.me.position > 3 && (
                  <div className="flex items-center gap-2 text-sm border-t border-white/10 pt-2 mt-2 px-1">
                    <span className="w-5 text-gray-500 text-xs">{board.me.position}</span>
                    <span className="flex-1 text-white truncate">{board.me.name}</span>
                    <span className="text-xs text-white/70">{board.me.score}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
