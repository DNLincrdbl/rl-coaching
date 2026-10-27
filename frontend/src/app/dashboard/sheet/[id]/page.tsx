'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaChevronLeft, FaUsers, FaStar } from 'react-icons/fa';
import { useRLM, FEEDBACK_XP } from '@/contexts/RLMContext';
import { CoachingSheet } from '@/lib/data/coaching';
import { api, ApiError } from '@/lib/api';
import { errorMessage, showToast } from '@/lib/toast';
import CoachingSheetView from '@/app/dashboard/components/CoachingSheetView';
import PageError from '@/app/components/PageError';

interface SheetResponse {
  sheet: CoachingSheet;
  canEdit: boolean;
  isOwner: boolean;
}

const TIP_PRESETS = [0, 500, 1000, 2000];

function FeedbackCard({ sheet, onDone }: { sheet: CoachingSheet; onDone: (s: CoachingSheet) => void }) {
  const { submitSheetFeedback } = useRLM();
  const [stars, setStars] = useState(5);
  const [message, setMessage] = useState('');
  const [tip, setTip] = useState(0);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sheet.hasFeedback) {
    return (
      <div className="rlm-card p-4 text-sm text-gray-400">
        Köszönjük az értékelést ({sheet.feedbackStars}★)
        {sheet.feedbackTip ? ` · tip: ${sheet.feedbackTip} Ft (helyi mód, Stripe nélkül tárolva)` : ''}.
        +{FEEDBACK_XP} XP.
      </div>
    );
  }

  const submit = async () => {
    const tipVal = custom ? parseInt(custom, 10) || 0 : tip;
    setBusy(true);
    setError(null);
    try {
      await submitSheetFeedback(sheet.id, { stars, message, tip: tipVal });
      onDone({ ...sheet, hasFeedback: true, feedbackStars: stars, feedbackTip: tipVal, feedbackMessage: message });
    } catch (e) {
      setError(errorMessage(e, 'Nem sikerült elküldeni.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rlm-card p-5 space-y-4">
      <h3 className="text-white font-semibold">Értékeld az elemzést</h3>
      <p className="text-xs text-gray-500">5 csillag + üzenet + opcionális tip. Beküldésért +{FEEDBACK_XP} XP.</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => setStars(s)} className="p-1">
            <FaStar className={`w-6 h-6 ${s <= stars ? 'text-yellow-400' : 'text-gray-700'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Rövid üzenet Zolinak..."
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600"
      />
      <div>
        <p className="text-xs text-gray-500 mb-2">Tip (Ft) — Stripe nélkül, csak rögzítjük</p>
        <div className="flex flex-wrap gap-2">
          {TIP_PRESETS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTip(t); setCustom(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm ${!custom && tip === t ? 'rlm-btn-primary' : 'bg-white/5 text-gray-300'}`}
            >
              {t === 0 ? 'Nincs' : `${t} Ft`}
            </button>
          ))}
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Egyedi"
            className="w-24 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <button type="button" onClick={submit} disabled={busy} className="rlm-btn-primary px-4 py-2 text-sm disabled:opacity-40">
        {busy ? 'Küldés...' : 'Visszajelzés küldése'}
      </button>
    </div>
  );
}

export default function SheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { updateSheet, publishSheet } = useRLM();

  const id = String(params.id);
  const [data, setData] = useState<SheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<SheetResponse>(`/api/sheets/${id}`);
        setData(res);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Nem sikerült betölteni.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <PageError
        message={error || 'Ez a sheet nem található.'}
        onRetry={() => {
          setLoading(true);
          setError(null);
          void api.get<SheetResponse>(`/api/sheets/${id}`)
            .then((res) => setData(res))
            .catch((e) => setError(e instanceof ApiError ? e.message : 'Nem sikerült betölteni.'))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  const canPublish = data.isOwner || data.canEdit;

  const handleTogglePublish = async (published: boolean) => {
    try {
      const updated = await publishSheet(data.sheet.id, published);
      setData((prev) => (prev ? { ...prev, sheet: updated } : prev));
    } catch (e) {
      showToast(errorMessage(e, 'A publikálás nem sikerült.'));
    }
  };

  return (
    <div className="space-y-6 rlm-fade-up">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <FaChevronLeft className="w-4 h-4" /> Vissza
      </button>

      {data.sheet.playerRank && (
        <p className="text-sm text-gray-500">
          Az értékelés a játékos <span className="text-gray-300">{data.sheet.playerRank}</span> rangjához viszonyítva készült.
        </p>
      )}

      {canPublish && (
        <div className="rlm-card p-4 flex items-start gap-3 border-orange-500/20">
          <FaUsers className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            {data.sheet.published
              ? 'Ez az elemzés publikálva van az RLM+ Replay Elemzések között. A Publikálva gombbal privatizálhatod.'
              : 'Elégedett vagy? A Publikálás gombbal kikerül a publikus RLM+ feedbe.'}
          </p>
        </div>
      )}

      <CoachingSheetView
        sheet={data.sheet}
        editable={data.canEdit}
        onChange={data.canEdit ? updateSheet : undefined}
        onTogglePublish={canPublish ? handleTogglePublish : undefined}
      />

      {data.isOwner && (
        <FeedbackCard
          sheet={data.sheet}
          onDone={(s) => setData((prev) => (prev ? { ...prev, sheet: s } : prev))}
        />
      )}
    </div>
  );
}
