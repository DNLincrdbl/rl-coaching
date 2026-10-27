'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaStar,
  FaTrophy,
  FaCheckCircle,
  FaProjectDiagram,
  FaPen,
  FaVideo,
  FaChevronRight,
  FaGlobe,
  FaCrown,
  FaTimes,
  FaDiscord,
  FaPlus,
  FaComments,
  FaPalette,
  FaBolt,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import {
  useRLM,
  getXPProgressInLevel,
  RL_RANKS,
  PROFILE_BADGES,
  EXTRA_REPLAY_PRICE,
  isRlmPlus,
} from '@/contexts/RLMContext';
import { titleById } from '@/lib/data/cosmetics';
import { errorMessage, showToast } from '@/lib/toast';
import { api } from '@/lib/api';
import ProfileAvatar from '../components/ProfileAvatar';
import EquipModal from '../components/EquipModal';
import ArenaRankBadge from '../components/ArenaRankBadge';
import {
  CoachingSheet,
  RATING_TOPICS,
  RATING_COLOR_META,
  ratingColorFor,
  sheetScore,
} from '@/lib/data/coaching';
import { MONTHLY_ARENA_NODES } from '@/lib/data/arena';

function DiscordConnectButton() {
  const [oauth, setOauth] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.get<{ configured: boolean }>('/api/auth/discord/status')
      .then((r) => setOauth(r.configured))
      .catch(() => setOauth(false));
  }, []);

  const saveName = async () => {
    const value = name.trim().replace(/^@/, '');
    if (!value || busy) return;
    setBusy(true);
    try {
      await api.patch('/api/profile', { discordUsername: value });
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      showToast('Discord név mentve.', 'success');
      setOpen(false);
    } catch (e) {
      showToast(errorMessage(e, 'A Discord név mentése nem sikerült.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-1 space-y-1">
      {oauth && (
        <button
          type="button"
          className="text-xs text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1"
          onClick={async () => {
            try {
              const res = await api.get<{ url: string }>('/api/auth/discord/start');
              window.location.href = res.url;
            } catch (e) {
              showToast(errorMessage(e, 'A Discord indítás nem sikerült.'));
            }
          }}
        >
          <FaDiscord className="w-3 h-3" /> Discord összekötése
        </button>
      )}
      {!open ? (
        <button
          type="button"
          className="block text-xs text-gray-500 hover:text-gray-300"
          onClick={() => setOpen(true)}
        >
          {oauth ? 'vagy írd be a neved' : 'Discord név megadása'}
        </button>
      ) : (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => { e.preventDefault(); void saveName(); }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="felhasználónév"
            className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white w-36"
          />
          <button type="submit" disabled={busy} className="text-xs text-orange-300">Mentés</button>
        </form>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rlm-card rlm-card-hover p-5">
      <Icon className="mb-4 h-4 w-4 text-white/60" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">{value}</p>
    </motion.div>
  );
}

/** Row of 5 colored rating dots summarizing a sheet. */
function RatingDots({ sheet }: { sheet: CoachingSheet }) {
  return (
    <div className="flex items-center gap-3">
      {RATING_TOPICS.map((topic) => {
        const color = ratingColorFor(sheet, topic.id);
        return (
          <div key={topic.id} className="flex flex-col items-center gap-1" title={`${topic.label}: ${RATING_COLOR_META[color].label}`}>
            <span className={`w-3.5 h-3.5 rounded-full ${RATING_COLOR_META[color].css}`} />
            <span className="text-[10px] text-gray-500 hidden sm:block">{topic.short}</span>
          </div>
        );
      })}
    </div>
  );
}

function SheetCard({ sheet, featured = false }: { sheet: CoachingSheet; featured?: boolean }) {
  return (
    <Link href={`/dashboard/sheet/${sheet.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`rlm-card rlm-card-hover p-5 h-full ${featured ? 'border-orange-500/20' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FaVideo className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-white">{sheet.title}</h3>
              {sheet.published && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-500/15 border border-green-500/30 rounded-full px-2 py-0.5">
                  <FaGlobe className="w-2.5 h-2.5" /> Publikálva
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{new Date(sheet.createdAt).toLocaleDateString('hu-HU')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold rlm-gradient-text">{sheetScore(sheet)}</p>
            <p className="text-[10px] text-gray-500 uppercase">Pont</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{sheet.summary}</p>
        <div className="flex items-center justify-between">
          <RatingDots sheet={sheet} />
          <FaChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </motion.div>
    </Link>
  );
}

function RankEditModal({ current, onSelect, onClose }: { current: string | null; onSelect: (r: string) => void; onClose: () => void }) {
  const [sel, setSel] = useState<string | null>(current);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rlm-scroll rounded-2xl border border-white/10 bg-[#0A0A0C] p-6 shadow-2xl shadow-black/80"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">Rang beállítása</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><FaTimes className="text-gray-400" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {RL_RANKS.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => setSel(rank)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sel === rank ? 'rlm-btn-primary' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => sel && onSelect(sel)}
          disabled={!sel}
          className="w-full rlm-btn-primary py-3 disabled:opacity-40"
        >
          Mentés
        </button>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

const MAX_UPLOAD_MB = 200;
const ACCEPTED_VIDEO = ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'ogv'];

function BookingModal({ onConfirm, onClose, busy = false }: {
  onConfirm: (payload: { video: File; note: string; useDiscord: boolean }) => void | Promise<void>;
  onClose: () => void;
  busy?: boolean;
}) {
  const [useDiscord, setUseDiscord] = useState(true);
  const [video, setVideo] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, busy]);

  const pickFile = (file: File | null | undefined) => {
    setError(null);
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_VIDEO.includes(ext)) {
      setError('Nem támogatott formátum. Használj mp4, webm vagy mov fájlt.');
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`A videó túl nagy (max ${MAX_UPLOAD_MB} MB).`);
      return;
    }
    setVideo(file);
  };

  const submit = async () => {
    if (!video) {
      setError('Tölts fel egy replay videót.');
      return;
    }
    setError(null);
    try {
      await onConfirm({ video, note: note.trim(), useDiscord });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hiba a beküldéskor.');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { if (!busy) onClose(); }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rlm-scroll rounded-2xl border border-white/10 bg-[#0A0A0C] p-6 shadow-2xl shadow-black/80"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 id="booking-modal-title" className="text-xl font-bold text-white">Replay beküldése</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
            aria-label="Bezárás"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <label className="block text-sm text-gray-400 mb-1.5">Replay videó</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v,.ogg,.ogv"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
          disabled={busy}
          className={`w-full mb-4 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors disabled:opacity-50 ${
            video ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/15 bg-white/[0.04] hover:border-white/30'
          }`}
        >
          {video ? (
            <div className="flex flex-col items-center gap-1">
              <FaVideo className="w-6 h-6 text-orange-400" />
              <span className="text-white text-sm font-medium break-all">{video.name}</span>
              <span className="text-xs text-gray-500">{(video.size / (1024 * 1024)).toFixed(1)} MB · kattints a cseréhez</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <FaVideo className="w-6 h-6 text-gray-400" />
              <span className="text-white text-sm font-medium">Húzd ide vagy válaszd ki a videót</span>
              <span className="text-xs text-gray-500">mp4, webm, mov · max {MAX_UPLOAD_MB} MB</span>
            </div>
          )}
        </button>

        <label className="block text-sm text-gray-400 mb-1.5">Megjegyzés (opcionális)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Mire fókuszáljon a coach?"
          disabled={busy}
          className="w-full mb-4 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50"
        />

        <p className="text-gray-400 text-sm mb-2">Szeretnél a coaching alatt Discordon beszélni is?</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setUseDiscord(true)}
            disabled={busy}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 disabled:opacity-50 ${
              useDiscord ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <FaDiscord className="w-6 h-6 text-indigo-400" />
            <span className="text-white text-xs font-medium">Igen, beszéljünk</span>
          </button>
          <button
            type="button"
            onClick={() => setUseDiscord(false)}
            disabled={busy}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 disabled:opacity-50 ${
              !useDiscord ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <FaComments className="w-6 h-6 text-gray-400" />
            <span className="text-white text-xs font-medium">Nem, csak elemzés</span>
          </button>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="w-full rlm-btn-primary py-3 disabled:opacity-40"
        >
          {busy ? 'Feltöltés...' : 'Beküldés (1 kredit)'}
        </button>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function CoachingCard({ onUploaded }: { onUploaded: () => void }) {
  const { profile, submitReplay, purchaseExtraReplay, updateSettings } = useRLM();
  const [showBooking, setShowBooking] = useState(false);
  const [busy, setBusy] = useState(false);
  const plus = isRlmPlus(profile.subscriptionTier);
  const canBook = plus && profile.coachingCredits + profile.extraReplayCredits > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('book') === '1') {
      setShowBooking(true);
    }
  }, []);

  const handleSubmit = async (payload: { video: File; note: string; useDiscord: boolean }) => {
    setBusy(true);
    try {
      await submitReplay(payload);
      setShowBooking(false);
      onUploaded();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rlm-card p-6">
      <AnimatePresence>
        {showBooking && (
          <BookingModal onClose={() => setShowBooking(false)} onConfirm={handleSubmit} busy={busy} />
        )}
      </AnimatePresence>

      <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
        <FaCrown className="text-yellow-400" /> Coaching & Replay Elemzés
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        {plus
          ? 'RLM+ tagként havonta 1 replay elemzés jár. Extra elemzés 5.990 Ft, a kreditek gyűlnek.'
          : 'A replay elemzés az RLM+ (7.990 Ft/hó) része. Az RLM csomag kurzusokat és arénát ad.'}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rlm-card p-4 text-center">
          <p className="text-3xl font-bold rlm-gradient-text">{profile.coachingCredits}</p>
          <p className="text-xs text-gray-500 mt-1">Havi kredit</p>
        </div>
        <div className="rlm-card p-4 text-center">
          <p className="text-3xl font-bold rlm-gradient-text">{profile.extraReplayCredits}</p>
          <p className="text-xs text-gray-500 mt-1">Extra replay</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowBooking(true)}
          disabled={!canBook || busy}
          className="rlm-btn-primary py-2.5 text-sm disabled:opacity-40"
        >
          Replay beküldése elemzésre
        </button>
        {plus && (
          <button
            onClick={() => {
              void purchaseExtraReplay().catch((e) => {
                showToast(errorMessage(e, 'Az extra replay vásárlása nem sikerült.'));
              });
            }}
            className="py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 flex items-center justify-center gap-1.5"
          >
            <FaPlus className="w-3 h-3" /> Extra replay ({EXTRA_REPLAY_PRICE.toLocaleString('de-DE')} Ft)
          </button>
        )}
      </div>
      {plus && (
        <label className="mt-4 flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.autoPublishSheets}
            onChange={(e) => {
              void updateSettings({ autoPublishSheets: e.target.checked }).catch((err) => {
                showToast(errorMessage(err, 'A beállítás mentése nem sikerült.'));
              });
            }}
            className="mt-0.5"
          />
          Automatikus megosztás az RLM+ Replay Elemzések között, amikor kész az elemzés
        </label>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, setRank, dismissSharePrompt } = useRLM();
  const [showRankModal, setShowRankModal] = useState(false);
  const [showEquip, setShowEquip] = useState(false);
  const [showEta, setShowEta] = useState(false);
  const xpProgress = getXPProgressInLevel(profile.xp);
  const equippedTitle = titleById(profile.selectedTitle);
  const selectedBadge = PROFILE_BADGES.find((b) => b.id === profile.selectedBadge);
  const plus = isRlmPlus(profile.subscriptionTier);

  const sheets = profile.coachingSheets;
  const latestSheet = sheets[0];
  const pastSheets = sheets.slice(1);

  const totalArenaNodes = MONTHLY_ARENA_NODES;
  const completedArenaNodes = profile.arenaProgress.dribble.length + profile.arenaProgress.aerial.length;

  return (
    <div className="space-y-8 rlm-fade-up">
      <AnimatePresence>
        {showRankModal && (
          <RankEditModal
            current={profile.rank}
            onSelect={(r) => { setRank(r); setShowRankModal(false); }}
            onClose={() => setShowRankModal(false)}
          />
        )}
        {showEquip && <EquipModal onClose={() => setShowEquip(false)} />}
        {showEta && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEta(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
          >
            <div onClick={(e) => e.stopPropagation()} className="rlm-card p-6 max-w-md text-center">
              <FaVideo className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Replay beérkezett</h3>
              <p className="text-gray-400 text-sm mb-5">
                Az elemzés 72 órán belül elkészül. Értesítést és emailt kapsz, ha Zoli feltöltötte a sheetet.
              </p>
              <button type="button" onClick={() => setShowEta(false)} className="rlm-btn-primary px-6 py-2.5">Rendben</button>
            </div>
          </motion.div>
        )}
        {profile.pendingShareSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[280] flex items-center justify-center bg-black/80 p-4"
          >
            <div className="rlm-card p-6 max-w-md">
              <h3 className="text-xl font-bold text-white mb-2">Megosztva az RLM+ feedben</h3>
              <p className="text-gray-400 text-sm mb-4">
                A(z) „{profile.pendingShareSheet.title}” elemzésed automatikusan kikerült a publikus RLM+ Replay Elemzések közé. Bármikor privatizálhatod.
              </p>
              <div className="flex flex-col gap-2">
                <Link href={`/dashboard/sheet/${profile.pendingShareSheet.id}`} className="rlm-btn-primary py-2.5 text-center">Megnézem</Link>
                <button type="button" onClick={() => dismissSharePrompt(false)} className="py-2 text-sm text-gray-300">Rendben</button>
                <button type="button" onClick={() => dismissSharePrompt(true)} className="py-2 text-xs text-gray-500">Ne mutasd újra</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/15"
      >
        <div className="bg-black p-6 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <ProfileAvatar colorId={profile.avatarColor} size={96} />
                <button
                  type="button"
                  onClick={() => setShowEquip(true)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
                  title="Testreszabás"
                >
                  <FaPalette className="w-3.5 h-3.5" />
                </button>
                {selectedBadge && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-700 border-2 border-[#0A0A0C] flex items-center justify-center">
                    <selectedBadge.icon className="w-4 h-4 text-white" />
                  </div>
                )}
                {!selectedBadge && profile.arenaBadge && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    <ArenaRankBadge badge={profile.arenaBadge} size={36} />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-white">{user?.displayName || 'Felhasználó'}</h1>
                {profile.username ? (
                  <p className="text-sm text-white/40">@{profile.username}</p>
                ) : null}
                <Link href="/dashboard/settings" className="mt-1 inline-block text-xs text-white/45 hover:text-white">
                  Fiók beállításai
                </Link>
                <p className="text-sm text-gray-400">{equippedTitle?.name || 'Nincs title'}</p>
                <button
                  onClick={() => setShowRankModal(true)}
                  className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs mt-1"
                >
                  {profile.rank || 'Nincs rang beállítva'}
                  <FaPen className="w-3 h-3" />
                </button>
                {profile.discordLinked || profile.discordUsername ? (
                  <p className="text-xs text-indigo-300 mt-1">
                    @{profile.discordUsername || 'Discord'}{profile.discordLinked ? ' · összekötve' : ''}
                  </p>
                ) : (
                  <DiscordConnectButton />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                plus
                  ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                  : 'bg-white/5 text-gray-300 border-white/10'
              }`}>
                {plus ? 'RLM+' : 'RLM'}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-400">Szint</p>
                <p className="text-3xl font-bold rlm-gradient-text">{profile.level}</p>
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
                    className="h-full rounded-full bg-white"
                  />
                </div>
                {profile.nextLevelColor && (
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    Következő szín
                    <span className="inline-block w-3 h-3 rounded-sm border border-white/20" style={{ background: profile.nextLevelColor.hex }} />
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaVideo} label="Replay elemzések" value={sheets.length} color="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard icon={FaProjectDiagram} label="Aréna haladás" value={`${completedArenaNodes}/${totalArenaNodes}`} color="bg-gradient-to-br from-green-500 to-emerald-500" />
        <StatCard icon={FaCrown} label="Coaching kredit" value={profile.coachingCredits} color="bg-gradient-to-br from-yellow-500 to-amber-500" />
        <StatCard icon={FaTrophy} label="Extra replay" value={profile.extraReplayCredits} color="bg-gradient-to-br from-blue-500 to-cyan-500" />
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: replay analyses */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FaVideo className="text-orange-400" /> Legutóbbi Replay Elemzés
              </h2>
            </div>
            {latestSheet ? (
              <SheetCard sheet={latestSheet} featured />
            ) : (
              <div className="rlm-card p-8 text-center text-gray-400">
                Még nincs replay elemzésed. A coaching után itt jelenik meg az első sheeted.
              </div>
            )}
          </motion.div>

          <div id="elemzesek" />
          {pastSheets.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-bold text-white mb-4">Korábbi Elemzések</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastSheets.map((s) => <SheetCard key={s.id} sheet={s} />)}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: coaching, badges, activity */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <Link href="/dashboard/weekly" className="rlm-card rlm-card-hover p-6 block">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <FaBolt className="text-yellow-400" /> Heti küldetések
              </h2>
              <p className="text-sm text-gray-400">5 küldetés, egy reroll, XP és kredit. Nyisd meg a heti packed.</p>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <CoachingCard onUploaded={() => setShowEta(true)} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rlm-card p-6">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <FaPalette className="text-yellow-400" /> Megjelenés
            </h2>
            <p className="text-sm text-gray-400 mb-4">Fehér RLM logó, háttérszín, 1 badge és title.</p>
            <button type="button" onClick={() => setShowEquip(true)} className="w-full rlm-btn-primary py-2.5 text-sm">
              Testreszabás
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rlm-card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaStar className="text-orange-400" /> Legutóbbi Aktivitás
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
                    <FaCheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      notification.type === 'success' ? 'text-green-400' :
                      notification.type === 'warning' ? 'text-yellow-400' :
                      notification.type === 'error' ? 'text-red-400' : 'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleDateString('hu-HU')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>Még nincs aktivitásod.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}