'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { PROFILE_BADGES, getXPProgressInLevel, useRLM } from '@/contexts/RLMContext';
import { PROFILE_COLORS, PROFILE_TITLES, colorById, titleById } from '@/lib/data/cosmetics';
import ProfileAvatar from './ProfileAvatar';
import ArenaRankBadge from './ArenaRankBadge';

export default function EquipModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { profile, updateCosmetics } = useRLM();
  const [color, setColor] = useState(profile.avatarColor);
  const [badge, setBadge] = useState(profile.selectedBadge);
  const [title, setTitle] = useState(profile.selectedTitle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const xp = getXPProgressInLevel(profile.xp);
  const nextColor = profile.nextLevelColor ?? PROFILE_COLORS.find((c) => c.level === profile.level + 1) ?? null;
  const activeTitle = titleById(title);
  const activeBadge = PROFILE_BADGES.find((b) => b.id === badge);
  const arenaEquipped = profile.arenaBadges.find((b) => b.id === badge) || null;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateCosmetics({
        avatarColor: color,
        selectedBadge: badge,
        selectedTitle: title,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nem sikerült menteni.');
    } finally {
      setBusy(false);
    }
  };

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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rlm-scroll rounded-2xl border border-white/10 bg-[#0A0A0C] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">Profil testreszabása</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Bezárás">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-bold text-white w-6 text-center">{profile.level}</span>
          <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-yellow-400"
              style={{ width: `${Math.min(100, (xp.current / xp.required) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white w-6 text-center">{profile.level + 1}</span>
          <div className="text-right min-w-[88px]">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Szintlépés</p>
            <div
              className="w-8 h-8 rounded-md border border-white/20 mx-auto mt-1"
              style={{ background: nextColor?.hex ?? colorById(color).hex }}
              title={nextColor ? `${nextColor.name} a következő szinten` : 'Nincs további szín'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar colorId={color} size={140} />
            <p className="text-xl font-bold text-white mt-4">{user?.displayName}</p>
            <p className="text-sm text-gray-400 mt-0.5">{activeTitle?.name || 'Nincs title'}</p>
            {activeBadge && (
              <div className="mt-4 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-700 border-2 border-yellow-300/40 flex items-center justify-center shadow-lg">
                <activeBadge.icon className="w-7 h-7 text-white" />
              </div>
            )}
            {arenaEquipped && !activeBadge && (
              <div className="mt-4">
                <ArenaRankBadge badge={arenaEquipped} size={64} showMeta />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Colors</h4>
              <div className="flex flex-wrap gap-3">
                {PROFILE_COLORS.map((c) => {
                  const locked = profile.level < c.level && !profile.unlockedColors.includes(c.id);
                  const active = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setColor(c.id)}
                      title={locked ? `Level ${c.level}` : c.name}
                      className={`relative w-12 h-12 rounded-xl border-2 transition-all ${
                        active ? 'border-white' : 'border-white/10'
                      } ${locked ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                      style={{ background: c.hex }}
                    >
                      {active && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <FaCheck className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Badges</h4>
              <div className="flex flex-wrap gap-3">
                {PROFILE_BADGES.map((b) => {
                  const locked = profile.level < b.requiredLevel;
                  const active = badge === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setBadge(b.id)}
                      title={locked ? `Level ${b.requiredLevel}` : b.name}
                      className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                        active ? 'border-white bg-white/10' : 'border-white/10 bg-white/5'
                      } ${locked ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      <b.icon className="w-6 h-6 text-orange-300" />
                      {active && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <FaCheck className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {profile.arenaBadges.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Aréna badge-ek</h4>
                <div className="flex flex-wrap gap-4">
                  {profile.arenaBadges.map((b) => {
                    const active = badge === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBadge(b.id)}
                        className={`relative rounded-2xl p-2 border ${active ? 'border-white' : 'border-white/10'}`}
                      >
                        <ArenaRankBadge badge={b} size={48} showMeta />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Titles</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTitle(null)}
                  className={`relative px-4 py-2 rounded-lg border text-sm ${
                    !title ? 'border-white text-white' : 'border-white/10 text-gray-400'
                  }`}
                >
                  Nincs
                  {!title && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <FaCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
                {PROFILE_TITLES.map((t) => {
                  const unlocked = profile.unlockedTitles.includes(t.id);
                  const active = title === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => setTitle(t.id)}
                      title={unlocked ? t.name : t.hint}
                      className={`relative px-4 py-2 rounded-lg border text-sm ${
                        active ? 'border-white text-white' : 'border-white/10 text-gray-300'
                      } ${!unlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {t.name}
                      {active && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <FaCheck className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-400" role="alert">{error}</p>}
        <button type="button" onClick={save} disabled={busy} className="mt-8 w-full rlm-btn-primary py-3 disabled:opacity-40">
          {busy ? 'Mentés...' : 'Kész'}
        </button>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
