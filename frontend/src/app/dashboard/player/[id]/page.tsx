'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaLock, FaVideo, FaChevronRight } from 'react-icons/fa';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/toast';
import PageError from '@/app/components/PageError';
import { titleById } from '@/lib/data/cosmetics';
import { ArenaBadge } from '@/lib/data/arenaBadges';
import {
  CoachingSheet,
  RATING_TOPICS,
  RATING_COLOR_META,
  ratingColorFor,
  sheetScore,
} from '@/lib/data/coaching';
import ProfileAvatar from '../../components/ProfileAvatar';
import ArenaRankBadge from '../../components/ArenaRankBadge';

interface PlayerPayload {
  player: {
    id: number;
    displayName: string;
    rank: string | null;
    level: number;
    xp: number;
    selectedTitle: string | null;
    avatarColor: string;
    arenaBadge: ArenaBadge | null;
    arenaBadges: ArenaBadge[];
    arenaLevel: number;
  };
  sheets: CoachingSheet[];
  canSeeSheets: boolean;
}

export default function PlayerPage() {
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<PlayerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!Number.isFinite(id)) {
      setError('Érvénytelen játékos.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void api.get<PlayerPayload>(`/api/community/players/${id}`)
      .then((res) => setData(res))
      .catch((e) => {
        setData(null);
        setError(errorMessage(e, 'A profil nem elérhető.'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return <PageError message={error || 'A profil nem elérhető.'} onRetry={load} />;
  }

  const { player, sheets, canSeeSheets } = data;
  const title = titleById(player.selectedTitle);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="rlm-card p-6 flex flex-col sm:flex-row gap-5 items-start">
        <ProfileAvatar colorId={player.avatarColor} size={96} />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{player.displayName}</h1>
          <p className="text-orange-400 text-sm font-medium">{title?.name || 'Nincs title'}</p>
          <p className="text-gray-400 text-sm mt-1">{player.rank || 'Rang nélkül'} · Szint {player.level} · {player.xp} XP</p>
          <p className="text-xs text-gray-500 mt-1">Aréna ebben a hónapban: {player.arenaLevel} node</p>
        </div>
        {player.arenaBadge && <ArenaRankBadge badge={player.arenaBadge} size={56} showMeta />}
      </div>

      {player.arenaBadges?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Aréna badge-ek</h2>
          <div className="flex flex-wrap gap-5">
            {player.arenaBadges.map((b) => (
              <ArenaRankBadge key={b.id} badge={b} size={48} showMeta />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <FaVideo className="text-orange-400" /> Publikus elemzések
        </h2>
        {!canSeeSheets ? (
          <div className="rlm-card p-6 text-gray-400 text-sm flex items-center gap-2">
            <FaLock /> A sheetek az RLM+ publikus feeddel együtt nyílnak.
          </div>
        ) : sheets.length === 0 ? (
          <p className="text-gray-500 text-sm">Még nincs publikált elemzése.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sheets.map((sheet) => (
              <Link key={sheet.id} href={`/dashboard/sheet/${sheet.id}`} className="rlm-card rlm-card-hover p-5">
                <div className="flex justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-white">{sheet.title}</h3>
                  <span className="text-xl font-bold rlm-gradient-text">{sheetScore(sheet)}</span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{sheet.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {RATING_TOPICS.map((topic) => {
                      const color = ratingColorFor(sheet, topic.id);
                      return <span key={topic.id} className={`w-2.5 h-2.5 rounded-full ${RATING_COLOR_META[color].css}`} />;
                    })}
                  </div>
                  <FaChevronRight className="text-gray-500 w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
