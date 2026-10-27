'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUsers, FaLock, FaVideo, FaChevronRight, FaGlobe, FaUserSecret } from 'react-icons/fa';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/toast';
import { useRLM, isRlmPlus, RL_RANKS } from '@/contexts/RLMContext';
import {
  CoachingSheet,
  RATING_TOPICS,
  RATING_COLOR_META,
  ratingColorFor,
  sheetScore,
} from '@/lib/data/coaching';
import { ErrorBanner } from '@/app/components/PageError';

function CommunitySheetCard({ sheet }: { sheet: CoachingSheet }) {
  return (
    <div className="rlm-card rlm-card-hover p-5 h-full flex flex-col">
      <Link href={`/dashboard/sheet/${sheet.id}`} className="flex-1">
        <motion.div whileHover={{ scale: 1.01 }}>
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
      {sheet.userId != null && (
        <Link href={`/dashboard/player/${sheet.userId}`} className="mt-3 text-xs text-orange-400 hover:text-orange-300">
          {sheet.authorName} profilja →
        </Link>
      )}
    </div>
  );
}

interface CommunityResponse {
  sheets: CoachingSheet[];
  memberCount: number;
  communityUnlockThreshold: number;
  unlocked: boolean;
  plusRequired?: boolean;
  scope: string;
}

export default function CommunityPage() {
  const { profile } = useRLM();
  const plus = isRlmPlus(profile.subscriptionTier);
  const [scope, setScope] = useState<'public' | 'private'>('public');
  const [rank, setRank] = useState('');
  const [sort, setSort] = useState<'new' | 'popular'>('new');
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [data, setData] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ scope, sort, period });
        if (rank) q.set('rank', rank);
        setData(await api.get<CommunityResponse>(`/api/community/sheets?${q}`));
      } catch (e) {
        setData(null);
        setError(errorMessage(e, 'Nem sikerült betölteni a közösségi feedet.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [scope, rank, sort, period]);

  if (!plus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center rlm-fade-up">
        <FaLock className="w-10 h-10 text-gray-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-3">RLM+ Replay Elemzések</h1>
        <p className="text-gray-400 max-w-md">Ez a fül az RLM+ csomag része: mások elemzései és a saját privát sheetjeid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rlm-fade-up">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaUsers className="text-orange-500" /> RLM+ Replay Elemzések
        </h1>
        <p className="text-gray-400 mt-1">Publikus feed mások elemzéseiből, és a saját privát sheetjeid.</p>
      </div>
      <ScopeTabs scope={scope} setScope={setScope} />
      <div className="flex flex-wrap gap-2">
        <select
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
        >
          <option value="">Minden rang</option>
          {RL_RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'new' | 'popular')}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
        >
          <option value="new">Legújabb</option>
          <option value="popular">Népszerű</option>
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'all' | 'week' | 'month')}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
        >
          <option value="all">Minden idő</option>
          <option value="week">Elmúlt 7 nap</option>
          <option value="month">Elmúlt 30 nap</option>
        </select>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            const q = new URLSearchParams({ scope, sort, period });
            if (rank) q.set('rank', rank);
            void api.get<CommunityResponse>(`/api/community/sheets?${q}`)
              .then((res) => { setData(res); setError(null); })
              .catch((e) => { setData(null); setError(errorMessage(e, 'Nem sikerült betölteni a közösségi feedet.')); })
              .finally(() => setLoading(false));
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
        </div>
      ) : scope === 'public' && data && !data.unlocked ? (
        <UnlockGate data={data} />
      ) : error && !data ? (
        null
      ) : !data || data.sheets.length === 0 ? (
        <div className="rlm-card p-8 text-center text-gray-400">
          {scope === 'private' ? 'Nincs privát elemzésed.' : 'Nincs találat ezekkel a szűrőkkel.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.sheets.map((s) => <CommunitySheetCard key={s.id} sheet={s} />)}
        </div>
      )}
    </div>
  );
}

function UnlockGate({ data }: { data: CommunityResponse }) {
  const member = data.memberCount ?? 0;
  const threshold = data.communityUnlockThreshold ?? 15;
  const pct = Math.round((member / threshold) * 100);
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
      <FaLock className="w-10 h-10 text-gray-500 mb-4" />
      <h1 className="text-2xl font-bold text-white mb-3">Publikus feed hamarosan</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        A publikus RLM+ elemzések {threshold} aktív tagnál nyílnak. A privát sheetjeid már elérhetők.
      </p>
      <div className="rlm-card px-6 py-4 w-full max-w-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">{member} tag</span>
          <span className="text-orange-400 font-medium">{threshold} tag</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function ScopeTabs({ scope, setScope }: { scope: 'public' | 'private'; setScope: (s: 'public' | 'private') => void }) {
  return (
    <div className="flex items-center gap-1 rlm-card !rounded-xl p-1 w-fit">
      <button
        onClick={() => setScope('public')}
        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${scope === 'public' ? 'rlm-btn-primary' : 'text-gray-400'}`}
      >
        <FaGlobe className="w-3.5 h-3.5" /> Publikus
      </button>
      <button
        onClick={() => setScope('private')}
        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${scope === 'private' ? 'rlm-btn-primary' : 'text-gray-400'}`}
      >
        <FaUserSecret className="w-3.5 h-3.5" /> Privát
      </button>
    </div>
  );
}
