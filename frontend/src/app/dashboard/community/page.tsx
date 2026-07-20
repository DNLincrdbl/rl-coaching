'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUsers, FaLock, FaVideo, FaChevronRight } from 'react-icons/fa';
import { api } from '@/lib/api';
import {
  CoachingSheet,
  RATING_TOPICS,
  RATING_COLOR_META,
  ratingColorFor,
  sheetScore,
} from '@/lib/data/coaching';

function CommunitySheetCard({ sheet }: { sheet: CoachingSheet }) {
  return (
    <Link href={`/dashboard/sheet/${sheet.id}`}>
      <motion.div whileHover={{ scale: 1.01 }} className="rlm-card rlm-card-hover p-5 h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaVideo className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-white">{sheet.title}</h3>
            </div>
            <p className="text-xs text-gray-500">{sheet.authorName} · {sheet.authorRank}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold rlm-gradient-text">{sheetScore(sheet)}</p>
            <p className="text-[10px] text-gray-500 uppercase">Pont</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{sheet.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {RATING_TOPICS.map((topic) => {
              const color = ratingColorFor(sheet, topic.id);
              return <span key={topic.id} className={`w-3 h-3 rounded-full ${RATING_COLOR_META[color].css}`} title={topic.label} />;
            })}
          </div>
          <FaChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </motion.div>
    </Link>
  );
}

interface CommunityResponse {
  sheets: CoachingSheet[];
  memberCount: number;
  unlockThreshold: number;
  unlocked: boolean;
}

export default function CommunityPage() {
  const [data, setData] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await api.get<CommunityResponse>('/api/community/sheets'));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  if (!data || !data.unlocked) {
    const member = data?.memberCount ?? 0;
    const threshold = data?.unlockThreshold ?? 20;
    const pct = Math.round((member / threshold) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center rlm-fade-up">
        <div className="w-24 h-24 rlm-card flex items-center justify-center mb-6">
          <FaLock className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Tanuljunk egymástól — Hamarosan</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Ez a fül akkor nyílik meg, amikor elérjük a {threshold} tagot. Itt majd
          mások publikált replay elemzéseit nézheted meg és tanulhatsz belőlük.
        </p>
        <div className="rlm-card px-6 py-4 w-full max-w-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{member} tag</span>
            <span className="text-orange-400 font-medium">{threshold} tag</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rlm-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaUsers className="text-orange-500" /> Tanuljunk egymástól
        </h1>
        <p className="text-gray-400 mt-1">Mások publikált replay elemzései. Nézd meg mit rontanak és javítanak mások!</p>
      </div>

      {data.sheets.length === 0 ? (
        <div className="rlm-card p-8 text-center text-gray-400">Még nincs publikált elemzés.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.sheets.map((s) => <CommunitySheetCard key={s.id} sheet={s} />)}
        </div>
      )}
    </div>
  );
}
