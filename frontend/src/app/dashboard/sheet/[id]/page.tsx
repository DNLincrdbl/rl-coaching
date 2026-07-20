'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaChevronLeft, FaUsers } from 'react-icons/fa';
import { useRLM } from '@/contexts/RLMContext';
import { CoachingSheet } from '@/lib/data/coaching';
import { api, ApiError } from '@/lib/api';
import CoachingSheetView from '@/app/dashboard/components/CoachingSheetView';

interface SheetResponse {
  sheet: CoachingSheet;
  canEdit: boolean;
  isOwner: boolean;
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
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">{error || 'Ez a sheet nem található.'}</p>
        <button onClick={() => router.push('/dashboard')} className="rlm-btn-primary px-5 py-2.5">
          Vissza a profilhoz
        </button>
      </div>
    );
  }

  const canPublish = data.isOwner || data.canEdit;

  const handleTogglePublish = async (published: boolean) => {
    const updated = await publishSheet(data.sheet.id, published);
    setData((prev) => (prev ? { ...prev, sheet: updated } : prev));
  };

  return (
    <div className="space-y-6 rlm-fade-up">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <FaChevronLeft className="w-4 h-4" /> Vissza
      </button>

      {canPublish && (
        <div className="rlm-card p-4 flex items-start gap-3 border-orange-500/20">
          <FaUsers className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            {data.sheet.published
              ? 'Ez az elemzés publikálva van a "Tanuljunk egymástól" oldalon. A jobb felső Publikálva gombbal bármikor visszavonhatod.'
              : 'Elégedett vagy az elemzéssel? A jobb felső Publikálás gombbal megoszthatod a közösséggel a "Tanuljunk egymástól" oldalon.'}
          </p>
        </div>
      )}

      <CoachingSheetView
        sheet={data.sheet}
        editable={data.canEdit}
        onChange={data.canEdit ? updateSheet : undefined}
        onTogglePublish={canPublish ? handleTogglePublish : undefined}
      />
    </div>
  );
}
