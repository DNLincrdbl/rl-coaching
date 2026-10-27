'use client';

import React, { useEffect, useState } from 'react';
import { FaBolt, FaCheck, FaRedo, FaStar } from 'react-icons/fa';
import { errorMessage, showToast } from '@/lib/toast';
import { api } from '@/lib/api';
import { useRLM } from '@/contexts/RLMContext';
import PageError from '@/app/components/PageError';

interface WeeklyChallenge {
  id: string;
  title: string;
  text: string;
  xp: number;
  credit: number;
  done: boolean;
}

interface WeeklyResponse {
  week: string;
  resetsAt: string;
  rerollUsed: boolean;
  completed: number;
  total: number;
  allBonusXp: number;
  challenges: WeeklyChallenge[];
  reward?: { xp: number; credit: number; bonusXp: number };
}

export default function WeeklyPage() {
  const { refreshProfile } = useRLM();
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get<WeeklyResponse>('/api/weekly');
    setData(res);
    setError(null);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setData(null);
        setError(errorMessage(e, 'Nem sikerült betölteni a heti küldetéseket.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const complete = async (id: string) => {
    setBusy(id);
    try {
      const res = await api.post<WeeklyResponse>('/api/weekly/complete', { id });
      setData(res);
      await refreshProfile();
      const parts = [`+${res.reward?.xp ?? 0} XP`];
      if (res.reward?.credit) parts.push(`+${res.reward.credit} extra replay`);
      if (res.reward?.bonusXp) parts.push(`+${res.reward.bonusXp} bónusz XP`);
      setFlash(parts.join(' · '));
    } catch (e) {
      showToast(errorMessage(e, 'Nem sikerült teljesíteni a küldetést.'));
    } finally {
      setBusy(null);
    }
  };

  const reroll = async (id: string) => {
    setBusy('reroll');
    try {
      const res = await api.post<WeeklyResponse>('/api/weekly/reroll', { id });
      setData(res);
    } catch (e) {
      showToast(errorMessage(e, 'A reroll nem sikerült.'));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <PageError
        message={error || 'Nem sikerült betölteni a heti küldetéseket.'}
        onRetry={() => {
          setLoading(true);
          void load().then(() => setLoading(false)).catch((e) => {
            setLoading(false);
            setError(errorMessage(e, 'Nem sikerült betölteni a heti küldetéseket.'));
          });
        }}
      />
    );
  }

  const resetLabel = data.resetsAt
    ? new Date(data.resetsAt).toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaBolt className="text-yellow-400" /> Heti küldetések
        </h1>
        <p className="text-gray-400 mt-1">
          5 küldetés hetente. Egy reroll. XP — a speciális küldetés RLM+ extra replay kreditet is ad.
          Reset: {resetLabel || 'hét vége'}.
        </p>
      </div>

      <div className="rlm-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">{data.completed}/{data.total} kész</span>
          <span className="text-orange-400">{data.allBonusXp} XP bónusz mind az 5-ért</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${(data.completed / data.total) * 100}%` }} />
        </div>
      </div>

      {flash && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-yellow-200 text-sm font-semibold">
          {flash}
        </div>
      )}

      <div className="space-y-3">
        {data.challenges.map((c) => (
          <div key={c.id} className={`rlm-card p-5 ${c.done ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-white">{c.title}</h3>
              <span className="text-xs font-semibold text-yellow-300 inline-flex items-center gap-1 shrink-0">
                <FaStar className="w-3 h-3" /> {c.xp} XP{c.credit ? ' + kredit' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{c.text}</p>
            <div className="flex flex-wrap gap-2">
              {c.done ? (
                <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <FaCheck /> Teljesítve
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy === c.id}
                  onClick={() => complete(c.id)}
                  className="rlm-btn-primary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {busy === c.id ? 'Mentés…' : 'Megcsináltam'}
                </button>
              )}
              {!c.done && !data.rerollUsed && (
                <button
                  type="button"
                  disabled={busy === 'reroll'}
                  onClick={() => reroll(c.id)}
                  className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 inline-flex items-center gap-2"
                >
                  <FaRedo className="w-3 h-3" /> Reroll
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {data.rerollUsed && (
        <p className="text-xs text-gray-500">A heti rerollt már felhasználtad.</p>
      )}
    </div>
  );
}
