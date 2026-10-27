'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FaUserShield,
  FaUsers,
  FaInbox,
  FaChartBar,
  FaTimes,
  FaExternalLinkAlt,
  FaPlus,
  FaVideo,
  FaProjectDiagram,
  FaCheck,
  FaBookOpen,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { api, resolveVideoUrl } from '@/lib/api';
import CatalogTab from './CatalogTab';
import { RL_RANKS } from '@/contexts/RLMContext';
import { errorMessage, showToast } from '@/lib/toast';
import { ErrorBanner } from '@/app/components/PageError';
import { CoachingSheet, RATING_TOPICS, TopicRating } from '@/lib/data/coaching';
import CoachingSheetView from '@/app/dashboard/components/CoachingSheetView';

// Local, same-origin sample so evaluation playback always works (even offline).
const DEMO_VIDEO = '/sample-replay.mp4';

interface AdminUser {
  id: number;
  displayName: string;
  email: string;
  role: string;
  rank: string | null;
  level: number;
  subscriptionTier: string;
  xp: number;
  coachingCredits: number;
  extraReplayCredits: number;
  emailVerified?: boolean;
  sheetCount: number;
  pendingSubmissions: number;
}

interface Submission {
  id: number;
  replayUrl: string;
  videoUrl: string | null;
  hasVideo: boolean;
  note: string;
  status: string;
  createdAt: string;
  user: { id: number; displayName: string; rank: string | null; level: number };
}

interface ArenaSub {
  id: number;
  tree: string;
  treeLabel: string;
  slot: string;
  month: string;
  note: string;
  hasVideo: boolean;
  videoUrl: string | null;
  status: string;
  createdAt: string;
  rankLabel: string;
  typeLabel: string;
  text: string;
  xp: number;
  user: { id: number; displayName: string; rank: string | null; level: number };
}

interface Stats {
  users: number;
  admins: number;
  pendingSubmissions: number;
  totalSheets: number;
  publishedSheets: number;
  openIssues?: number;
  pendingArena?: number;
}

function buildDraftSheet(submission: Submission): CoachingSheet {
  const ratings: TopicRating[] = RATING_TOPICS.map((t) => ({ topic: t.id, color: 'green' }));
  return {
    id: `submission-${submission.id}`,
    title: `Replay Elemzés — ${submission.user.displayName}`,
    createdAt: new Date().toISOString(),
    // Uploaded video if present, else a demo clip so playback still works.
    videoUrl: submission.videoUrl || DEMO_VIDEO,
    summary: '',
    ratings,
    timestamps: [],
    published: false,
    authorName: submission.user.displayName,
    authorRank: submission.user.rank || '',
  };
}

function EvaluationModal({ submission, onClose, onDone }: {
  submission: Submission;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const draft = React.useMemo(() => buildDraftSheet(submission), [submission]);

  useEffect(() => { setMounted(true); }, []);

  const handleSave = async (sheet: CoachingSheet) => {
    setBusy(true);
    try {
      await api.post(`/api/admin/submissions/${submission.id}/review`, {
        title: sheet.title,
        videoUrl: sheet.videoUrl,
        summary: sheet.summary,
        ratings: sheet.ratings,
        timestamps: sheet.timestamps,
      });
      onDone();
    } catch (e) {
      setBusy(false);
      throw e;
    }
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#0A0A0C] flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0A0A0C]/95 backdrop-blur sticky top-0 z-20">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate">Replay értékelése</h3>
          <p className="text-xs text-gray-500 truncate">
            {submission.user.displayName} · {submission.user.rank || '—'}
            {submission.hasVideo ? ' · feltöltött videó' : ' · minta videó'}
            {submission.note ? ` · „${submission.note}”` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {submission.replayUrl && (
            <a href={submission.replayUrl} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 text-orange-400 text-sm px-3 py-2 rounded-lg hover:bg-white/5">
              <FaExternalLinkAlt className="w-3 h-3" /> Replay link
            </a>
          )}
          <button onClick={onClose} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10">
            <FaTimes className="w-3.5 h-3.5" /> Bezárás
          </button>
        </div>
      </div>

      {/* Full-height content (fits the viewport, no page scroll) */}
      <div className="flex-1 min-h-0 overflow-hidden px-4 sm:px-6 py-5">
        <div className="max-w-[1700px] mx-auto h-full">
          <CoachingSheetView
            sheet={draft}
            editable
            startEditing
            hideCancel
            fitViewport
            saveLabel="Elemzés elküldése a felhasználónak"
            onChange={handleSave}
          />
        </div>
      </div>

      {busy && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500" />
        </div>
      )}
    </motion.div>,
    document.body,
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'submissions' | 'arena' | 'users' | 'issues' | 'catalog'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [arenaSubs, setArenaSubs] = useState<ArenaSub[]>([]);
  const [issues, setIssues] = useState<{ id: number; userName: string; userEmail: string; message: string; page: string | null; createdAt: string }[]>([]);
  const [evaluating, setEvaluating] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, u, subs, iss, arena] = await Promise.all([
        api.get<Stats>('/api/admin/stats'),
        api.get<{ users: AdminUser[] }>('/api/admin/users'),
        api.get<{ submissions: Submission[] }>('/api/admin/submissions?status=pending'),
        api.get<{ issues: { id: number; userName: string; userEmail: string; message: string; page: string | null; createdAt: string }[] }>('/api/admin/issues'),
        api.get<{ submissions: ArenaSub[] }>('/api/admin/arena?status=pending'),
      ]);
      setStats(s);
      setUsers(u.users);
      setSubmissions(subs.submissions);
      setIssues(iss.issues);
      setArenaSubs(arena.submissions);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Az admin adatok betöltése nem sikerült.'));
    }
  }, []);

  useEffect(() => {
    if (!loading && user?.role === 'admin') void load();
  }, [loading, user, load]);

  if (!loading && user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <FaUserShield className="w-10 h-10 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Ehhez az oldalhoz admin jogosultság kell.</p>
        <button onClick={() => router.push('/dashboard')} className="rlm-btn-primary px-5 py-2.5">Vissza</button>
      </div>
    );
  }

  const grantCredit = async (userId: number) => {
    try {
      await api.post(`/api/admin/users/${userId}/grant-credit`, { kind: 'coaching', amount: 1 });
      await load();
    } catch (e) {
      showToast(errorMessage(e, 'A kredit jóváírása nem sikerült.'));
    }
  };

  return (
    <div className="space-y-6 rlm-fade-up">
      <AnimatePresence>
        {evaluating && (
          <EvaluationModal
            submission={evaluating}
            onClose={() => setEvaluating(null)}
            onDone={() => { setEvaluating(null); load(); }}
          />
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaUserShield className="text-orange-500" /> Admin Panel
        </h1>
        <p className="text-gray-400 mt-1">Teljes rálátás: felhasználók, beküldött replayek, értékelések.</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[
            { label: 'Felhasználók', value: stats.users },
            { label: 'Függő replayek', value: stats.pendingSubmissions },
            { label: 'Függő aréna', value: stats.pendingArena ?? 0 },
            { label: 'Összes sheet', value: stats.totalSheets },
            { label: 'Publikált', value: stats.publishedSheets },
            { label: 'Hibajelentés', value: stats.openIssues ?? 0 },
            { label: 'Adminok', value: stats.admins },
          ].map((s) => (
            <div key={s.label} className="rlm-card p-4 text-center">
              <p className="text-2xl font-bold rlm-gradient-text">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 rlm-card !rounded-xl p-1 w-fit">
        {[
          { id: 'overview', label: 'Áttekintés', icon: FaChartBar },
          { id: 'submissions', label: `Beküldött replayek (${submissions.length})`, icon: FaInbox },
          { id: 'arena', label: `Aréna (${arenaSubs.length})`, icon: FaProjectDiagram },
          { id: 'users', label: 'Felhasználók', icon: FaUsers },
          { id: 'catalog', label: 'Tartalom', icon: FaBookOpen },
          { id: 'issues', label: `Hibák (${issues.length})`, icon: FaInbox },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              tab === t.id ? 'rlm-btn-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {(tab === 'submissions' || tab === 'overview') && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Értékelésre váró replayek</h2>
          {submissions.length === 0 ? (
            <div className="rlm-card p-8 text-center text-gray-400">Nincs függő beküldés.</div>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="rlm-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                  <p className="text-white font-medium">{s.user.displayName} <span className="text-gray-500 text-sm">· {s.user.rank}</span></p>
                  <p className="text-sm text-gray-400">{s.note || 'Nincs megjegyzés'}</p>
                  {s.hasVideo ? (
                    <span className="text-xs text-green-400 inline-flex items-center gap-1 mt-1">
                      <FaVideo className="w-3 h-3" /> Feltöltött replay videó
                    </span>
                  ) : s.replayUrl ? (
                    <a href={s.replayUrl} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline inline-flex items-center gap-1 mt-1">
                      <FaExternalLinkAlt className="w-3 h-3" /> {s.replayUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                      <FaVideo className="w-3 h-3" /> Demó videó (nincs feltöltés)
                    </span>
                  )}
                </div>
                <button onClick={() => setEvaluating(s)} className="rlm-btn-primary px-4 py-2 text-sm whitespace-nowrap">
                  Értékelés
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'arena' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Aréna beküldések</h2>
          {arenaSubs.length === 0 ? (
            <div className="rlm-card p-8 text-center text-gray-400">Nincs függő aréna küldetés.</div>
          ) : (
            arenaSubs.map((s) => (
              <div key={s.id} className="rlm-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                  <div className="min-w-0">
                    <p className="text-white font-medium">
                      {s.user.displayName} <span className="text-gray-500 text-sm">· {s.treeLabel} · {s.rankLabel} · {s.typeLabel}</span>
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{s.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.note || 'Nincs megjegyzés'} · +{s.xp} XP</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.post(`/api/admin/arena/${s.id}/review`, { action: 'accept' });
                          load();
                        } catch (e) {
                          showToast(errorMessage(e, 'Az elfogadás nem sikerült.'));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-500/30"
                    >
                      <FaCheck className="w-3 h-3" /> Elfogad
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const reason = window.prompt('Elutasítás indoka (opcionális):') ?? undefined;
                        if (reason === undefined) return;
                        try {
                          await api.post(`/api/admin/arena/${s.id}/review`, { action: 'reject', reason });
                          load();
                        } catch (e) {
                          showToast(errorMessage(e, 'Az elutasítás nem sikerült.'));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                    >
                      <FaTimes className="w-3 h-3" /> Elutasít
                    </button>
                  </div>
                </div>
                {s.hasVideo && s.videoUrl && (
                  <video src={resolveVideoUrl(s.videoUrl)} controls className="w-full max-h-64 rounded-xl bg-black" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'catalog' && <CatalogTab />}

      {tab === 'issues' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Hibajelentések</h2>
          {issues.length === 0 ? (
            <div className="rlm-card p-8 text-center text-gray-400">Nincs bejelentés.</div>
          ) : (
            issues.map((i) => (
              <div key={i.id} className="rlm-card p-4">
                <p className="text-white font-medium">{i.userName} <span className="text-gray-500 text-sm">{i.userEmail}</span></p>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{i.message}</p>
                <p className="text-xs text-gray-500 mt-2">{i.page || '—'} · {new Date(i.createdAt).toLocaleString('hu-HU')}</p>
              </div>
            ))
          )}
        </div>
      )}
      {tab === 'users' && (
        <div className="rlm-card overflow-hidden">
          <div className="overflow-x-auto rlm-scroll">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-white/10">
                <tr>
                  <th className="text-left p-3">Név</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Rang</th>
                  <th className="text-left p-3">Szint</th>
                  <th className="text-left p-3">Csomag</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Sheet</th>
                  <th className="text-left p-3">Függő</th>
                  <th className="text-left p-3">Kredit</th>
                  <th className="text-left p-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="p-3 text-white font-medium">{u.displayName} {u.role === 'admin' && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">admin</span>}</td>
                    <td className="p-3 text-gray-400">{u.email}</td>
                    <td className="p-3 text-gray-300">
                      <select
                        value={u.rank || ''}
                        onChange={async (e) => {
                          try {
                            await api.patch(`/api/admin/users/${u.id}`, { rank: e.target.value || null });
                            await load();
                          } catch (err) {
                            showToast(errorMessage(err, 'A rang mentése nem sikerült.'));
                          }
                        }}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs max-w-[9rem]"
                      >
                        <option value="">—</option>
                        {RL_RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-gray-300">{u.level}</td>
                    <td className="p-3 text-gray-300">
                      <select
                        value={u.subscriptionTier === 'rlm_plus' || u.subscriptionTier === 'pro' ? 'rlm_plus' : 'rlm'}
                        onChange={async (e) => {
                          try {
                            await api.patch(`/api/admin/users/${u.id}`, { subscriptionTier: e.target.value });
                            await load();
                          } catch (err) {
                            showToast(errorMessage(err, 'A csomag mentése nem sikerült.'));
                          }
                        }}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                      >
                        <option value="rlm">RLM</option>
                        <option value="rlm_plus">RLM+</option>
                      </select>
                    </td>
                    <td className="p-3 text-gray-300">
                      <button
                        type="button"
                        title="E-mail megerősítés"
                        onClick={async () => {
                          try {
                            await api.patch(`/api/admin/users/${u.id}`, { emailVerified: !u.emailVerified });
                            await load();
                          } catch (err) {
                            showToast(errorMessage(err, 'A megerősítés mentése nem sikerült.'));
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded border ${
                          u.emailVerified
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {u.emailVerified ? 'igen' : 'nem'}
                      </button>
                    </td>
                    <td className="p-3 text-gray-300">{u.sheetCount}</td>
                    <td className="p-3 text-gray-300">{u.pendingSubmissions}</td>
                    <td className="p-3 text-gray-300">{u.coachingCredits}+{u.extraReplayCredits}</td>
                    <td className="p-3">
                      <button onClick={() => grantCredit(u.id)} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 inline-flex items-center gap-1">
                        <FaPlus className="w-2.5 h-2.5" /> kredit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
