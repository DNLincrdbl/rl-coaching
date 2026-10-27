'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTrophy,
  FaMedal,
  FaProjectDiagram,
  FaCrown,
  FaBullseye,
  FaRocket,
  FaCog,
  FaLock,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/toast';
import { useRLM } from '@/contexts/RLMContext';
import { titleById } from '@/lib/data/cosmetics';
import { ArenaBadge } from '@/lib/data/arenaBadges';
import ProfileAvatar from '../components/ProfileAvatar';
import ArenaRankBadge from '../components/ArenaRankBadge';
import { ErrorBanner } from '@/app/components/PageError';

interface LBPlayer {
  id: number;
  name: string;
  title: string;
  rank: string;
  arenaLevel: number;
  score: number;
  badge: IconType;
  banner: string;
  avatarColor: string;
  arenaBadge: ArenaBadge | null;
}

interface LBRow {
  id: number;
  position: number;
  name: string;
  rank: string | null;
  level?: number;
  arenaLevel: number;
  score: number;
  badge: string | null;
  arenaBadge?: ArenaBadge | null;
  title?: string | null;
  avatarColor?: string;
}

const BADGE_ICONS: Record<string, IconType> = {
  rookie: FaMedal,
  grinder: FaCog,
  aerialist: FaRocket,
  dribbler: FaBullseye,
  legend: FaCrown,
};

const BANNERS = [
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  'linear-gradient(135deg, #84cc16, #22c55e)',
  'linear-gradient(135deg, #f97316, #fb923c)',
  'linear-gradient(135deg, #a855f7, #d946ef)',
  'linear-gradient(135deg, #64748b, #94a3b8)',
];

function titleForLevel(level: number): string {
  if (level >= 18) return 'Arena Legend';
  if (level >= 12) return 'Mechanic';
  if (level >= 6) return 'Rising Star';
  return 'Rookie';
}

function toPlayer(row: LBRow): LBPlayer {
  const equipped = titleById(row.title);
  return {
    id: row.id,
    name: row.name,
    title: equipped?.name || titleForLevel(row.arenaLevel),
    rank: row.rank || '—',
    arenaLevel: row.arenaLevel,
    score: row.score,
    badge: BADGE_ICONS[row.badge || 'rookie'] || FaMedal,
    banner: BANNERS[(row.position - 1) % BANNERS.length],
    avatarColor: row.avatarColor || 'black',
    arenaBadge: row.arenaBadge ?? null,
  };
}

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

function LeaderboardRow({ player, position, index, isOwn, onClick }: {
  player: LBPlayer;
  position: number;
  index: number;
  isOwn?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-colors ${
        isOwn ? 'bg-orange-500/10 border-orange-500/40' : 'rlm-card rlm-card-hover'
      }`}
    >
      <div className="flex items-center gap-4">
        <RankBadge rank={position} />

        <div className="flex-1 flex items-center gap-4 p-3 rounded-xl" style={{ background: player.banner }}>
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/25">
            <ProfileAvatar colorId={player.avatarColor} size={48} rounded="rounded-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white drop-shadow-md flex items-center gap-2">
              {player.name} {isOwn && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Te</span>}
            </h3>
            <p className="text-sm text-white/80 drop-shadow">{player.title}</p>
          </div>
        </div>

        <div className="hidden sm:block text-center px-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Rang</p>
          <p className="text-sm font-semibold text-white">{player.rank}</p>
        </div>

        <div className="text-center px-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Aréna szint</p>
          <p className="text-2xl font-bold rlm-gradient-text">{player.arenaLevel}</p>
        </div>
        {player.arenaBadge && (
          <div className="hidden md:block">
            <ArenaRankBadge badge={player.arenaBadge} size={40} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function LeaderboardPage() {
  const { profile } = useRLM();
  const router = useRouter();
  const [top, setTop] = useState<{ player: LBPlayer; position: number }[]>([]);
  const [me, setMe] = useState<{ player: LBPlayer; position: number } | null>(null);
  const [unlocked, setUnlocked] = useState(true);
  const [meta, setMeta] = useState({ memberCount: 0, threshold: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await api.get<{
          top: LBRow[];
          me: LBRow | null;
          unlocked?: boolean;
          memberCount?: number;
          leaderboardUnlockThreshold?: number;
        }>('/api/leaderboard');
        setUnlocked(res.unlocked !== false);
        setMeta({
          memberCount: res.memberCount ?? profile.features.memberCount,
          threshold: res.leaderboardUnlockThreshold ?? 20,
        });
        setTop(res.top.map((r) => ({ player: toPlayer(r), position: r.position })));
        setMe(res.me ? { player: toPlayer(res.me), position: res.me.position } : null);
      } catch (e) {
        setError(errorMessage(e, 'Nem sikerült betölteni a leaderboardot.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [profile.features.memberCount]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 rlm-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaTrophy className="text-yellow-500" /> Leaderboard
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <FaProjectDiagram className="w-3.5 h-3.5" /> Aréna teljesítmény · havonta frissül · döntetlennél a korábbi beküldés nyer
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
        </div>
      ) : error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : !unlocked ? (
        <div className="flex flex-col items-center py-16 text-center">
          <FaLock className="w-10 h-10 text-gray-500 mb-4" />
          <p className="text-gray-400 max-w-md">
            A leaderboard {meta.threshold} tagnál nyílik. Most {meta.memberCount} tag van.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {top.map(({ player, position }, index) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                position={position}
                index={index}
                onClick={() => router.push(`/dashboard/player/${player.id}`)}
              />
            ))}
          </div>

          {me && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">A te helyezésed</p>
              <LeaderboardRow
                player={me.player}
                position={me.position}
                index={0}
                isOwn
                onClick={() => router.push(`/dashboard/player/${me.player.id}`)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
