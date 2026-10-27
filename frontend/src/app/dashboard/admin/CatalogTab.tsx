'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage, showToast } from '@/lib/toast';

type WeeklyRow = { id: string; title: string; text: string; xp: number; credit: number };
type ArenaRow = {
  id: string;
  tree: string;
  rank: string;
  type?: string;
  text: string;
  xp: number;
  videoUrl?: string;
};
type Lesson = { id: string; title: string; duration?: string; videoUrl: string; isIntro?: boolean };
type Course = { id: string; title: string; description: string; image: string; category: string; rankRange: string; lessons: Lesson[] };
type Tutorial = { id: string; title: string; description: string; category: string; duration: string; difficulty: number; ranked: number; videoUrl: string };

export default function CatalogTab() {
  const [section, setSection] = useState<'weekly' | 'arena' | 'learn'>('weekly');
  const [weekly, setWeekly] = useState<WeeklyRow[]>([]);
  const [arena, setArena] = useState<ArenaRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const load = async () => {
    const [w, a, l] = await Promise.all([
      api.get<{ payload: WeeklyRow[] }>('/api/admin/catalog/weekly'),
      api.get<{ payload: ArenaRow[] }>('/api/admin/catalog/arena'),
      api.get<{ payload: { courses: Course[]; tutorials: Tutorial[] } }>('/api/admin/catalog/learn'),
    ]);
    setWeekly(w.payload || []);
    setArena(a.payload || []);
    setCourses(l.payload?.courses || []);
    setTutorials(l.payload?.tutorials || []);
  };

  useEffect(() => {
    void load().catch((e) => showToast(errorMessage(e, 'A tartalom betöltése nem sikerült.')));
  }, []);

  const saveWeekly = async () => {
    setBusy(true);
    try {
      await api.put('/api/admin/catalog/weekly', { payload: weekly });
      showToast('Heti pool mentve.', 'success');
    } catch (e) {
      showToast(errorMessage(e, 'Mentés sikertelen.'));
    } finally {
      setBusy(false);
    }
  };

  const saveArena = async () => {
    setBusy(true);
    try {
      await api.put('/api/admin/catalog/arena', { payload: arena });
      showToast('Aréna pool mentve.', 'success');
    } catch (e) {
      showToast(errorMessage(e, 'Mentés sikertelen.'));
    } finally {
      setBusy(false);
    }
  };

  const saveLearn = async () => {
    setBusy(true);
    try {
      await api.put('/api/admin/catalog/learn', { payload: { courses, tutorials } });
      showToast('Kurzusok / tutoriálok mentve.', 'success');
    } catch (e) {
      showToast(errorMessage(e, 'Mentés sikertelen.'));
    } finally {
      setBusy(false);
    }
  };

  const filteredArena = arena.filter((m) => {
    const q = filter.toLowerCase();
    if (!q) return true;
    return `${m.id} ${m.tree} ${m.rank} ${m.text}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Itt szerkesztheted a heti küldetéseket, az aréna poolt és a kurzus / tutoriál videókat. A játékosok a mentés után a backendről kapják.
      </p>
      <div className="flex flex-wrap gap-1 rlm-card !rounded-xl p-1 w-fit">
        {([
          ['weekly', 'Heti pool'],
          ['arena', 'Aréna pool'],
          ['learn', 'Kurzusok'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${section === id ? 'rlm-btn-primary' : 'text-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {section === 'weekly' && (
        <div className="space-y-3">
          {weekly.map((row, i) => (
            <div key={row.id} className="rlm-card p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <input value={row.id} disabled className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-500 w-32" />
                <input
                  value={row.title}
                  onChange={(e) => setWeekly((prev) => prev.map((r, idx) => idx === i ? { ...r, title: e.target.value } : r))}
                  className="flex-1 min-w-[12rem] bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                />
                <input
                  type="number"
                  value={row.xp}
                  onChange={(e) => setWeekly((prev) => prev.map((r, idx) => idx === i ? { ...r, xp: Number(e.target.value) } : r))}
                  className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                />
                <input
                  type="number"
                  value={row.credit}
                  onChange={(e) => setWeekly((prev) => prev.map((r, idx) => idx === i ? { ...r, credit: Number(e.target.value) } : r))}
                  className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                  title="RLM+ kredit"
                />
              </div>
              <textarea
                value={row.text}
                onChange={(e) => setWeekly((prev) => prev.map((r, idx) => idx === i ? { ...r, text: e.target.value } : r))}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-gray-200"
              />
            </div>
          ))}
          <button type="button" disabled={busy} onClick={() => void saveWeekly()} className="rlm-btn-primary px-5 py-2.5 text-sm">
            {busy ? 'Mentés...' : 'Heti pool mentése'}
          </button>
        </div>
      )}

      {section === 'arena' && (
        <div className="space-y-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Szűrés (id, fa, rang, szöveg)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          />
          {filteredArena.map((row) => {
            const i = arena.findIndex((m) => m.id === row.id);
            return (
              <div key={row.id} className="rlm-card p-4 space-y-2">
                <p className="text-xs text-gray-500">{row.id} · {row.tree} · {row.rank}</p>
                <textarea
                  value={row.text}
                  onChange={(e) => setArena((prev) => prev.map((r, idx) => idx === i ? { ...r, text: e.target.value } : r))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-gray-200"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    value={row.xp}
                    onChange={(e) => setArena((prev) => prev.map((r, idx) => idx === i ? { ...r, xp: Number(e.target.value) } : r))}
                    className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    value={row.videoUrl || ''}
                    onChange={(e) => setArena((prev) => prev.map((r, idx) => idx === i ? { ...r, videoUrl: e.target.value } : r))}
                    placeholder="Videó URL"
                    className="flex-1 min-w-[12rem] bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            );
          })}
          <button type="button" disabled={busy} onClick={() => void saveArena()} className="rlm-btn-primary px-5 py-2.5 text-sm">
            {busy ? 'Mentés...' : 'Aréna pool mentése'}
          </button>
        </div>
      )}

      {section === 'learn' && (
        <div className="space-y-4">
          {courses.map((course, ci) => (
            <div key={course.id} className="rlm-card p-4 space-y-2">
              <input
                value={course.title}
                onChange={(e) => setCourses((prev) => prev.map((c, idx) => idx === ci ? { ...c, title: e.target.value } : c))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white font-semibold"
              />
              <textarea
                value={course.description}
                onChange={(e) => setCourses((prev) => prev.map((c, idx) => idx === ci ? { ...c, description: e.target.value } : c))}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-gray-200"
              />
              {course.lessons.map((lesson, li) => (
                <div key={lesson.id} className="flex flex-col sm:flex-row gap-2">
                  <span className="text-xs text-gray-500 sm:w-48 shrink-0 pt-2">{lesson.title}</span>
                  <input
                    value={lesson.videoUrl}
                    onChange={(e) => setCourses((prev) => prev.map((c, idx) => {
                      if (idx !== ci) return c;
                      const lessons = c.lessons.map((l, j) => j === li ? { ...l, videoUrl: e.target.value } : l);
                      return { ...c, lessons };
                    }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          ))}
          <h3 className="text-white font-semibold pt-2">Tutoriál videók</h3>
          {tutorials.map((t, i) => (
            <div key={t.id} className="flex flex-col sm:flex-row gap-2 rlm-card p-3">
              <span className="text-sm text-gray-300 sm:w-48 shrink-0">{t.title}</span>
              <input
                value={t.videoUrl}
                onChange={(e) => setTutorials((prev) => prev.map((row, idx) => idx === i ? { ...row, videoUrl: e.target.value } : row))}
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
              />
            </div>
          ))}
          <button type="button" disabled={busy} onClick={() => void saveLearn()} className="rlm-btn-primary px-5 py-2.5 text-sm">
            {busy ? 'Mentés...' : 'Kurzusok mentése'}
          </button>
        </div>
      )}
    </div>
  );
}
