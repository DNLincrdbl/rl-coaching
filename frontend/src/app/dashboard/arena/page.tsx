'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FaLock,
  FaCheck,
  FaTimes,
  FaStar,
  FaRedo,
  FaClock,
  FaPlay,
  FaUpload,
  FaGift,
  FaSearchMinus,
} from 'react-icons/fa';
import { useRLM } from '@/contexts/RLMContext';
import { api, resolveVideoUrl } from '@/lib/api';
import {
  ArenaRank,
  ArenaTreeId,
  ArenaTreeNode,
  ArenaTreeResponse,
  RANK_THEME,
  TREE_META,
  layoutTree,
} from '@/lib/data/arena';
import { ArenaBadge } from '@/lib/data/arenaBadges';
import { TUTORIALS as FALLBACK_TUTORIALS, type Tutorial } from '@/lib/data/learn';
import ArenaRankBadge from '../components/ArenaRankBadge';

const TYPE_PILL: Record<string, string> = {
  precision: 'text-sky-200 bg-sky-500/15 border-sky-400/35',
  speed: 'text-orange-200 bg-orange-500/15 border-orange-400/35',
  control: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/35',
  mechanic: 'text-fuchsia-200 bg-fuchsia-500/15 border-fuchsia-400/35',
};

const MAX_CLIP_BYTES = 200 * 1024 * 1024;

type LayoutPos = { x: number; y: number; size: number };
type Cam = { x: number; y: number; scale: number };

function fitCamera(layout: { width: number; height: number }, vw: number, vh: number): Cam {
  const pad = 28;
  const scale = Math.min((vw - pad * 2) / layout.width, (vh - pad * 2) / layout.height, 1);
  return {
    x: (vw - layout.width * scale) / 2,
    y: (vh - layout.height * scale) / 2,
    scale,
  };
}

function focusPoint(vw: number, vh: number, wide: boolean) {
  const detailsW = wide ? 352 : 0;
  const mapW = wide ? 176 : 0;
  const usable = Math.max(280, vw - detailsW);
  return {
    x: mapW + (usable - mapW) * 0.46,
    y: vh * (wide ? 0.46 : 0.36),
  };
}

function zoomScaleFor(size: number, vw: number, vh: number, wide: boolean) {
  const detailsW = wide ? 352 : 0;
  const usable = Math.max(280, vw - detailsW);
  const target = Math.min(usable * 0.46, vh * 0.5);
  return Math.min(3.9, Math.max(2.4, target / size));
}

function camFromLookAt(lookAt: { x: number; y: number }, scale: number, vw: number, vh: number, wide: boolean): Cam {
  const f = focusPoint(vw, vh, wide);
  return { x: f.x - lookAt.x * scale, y: f.y - lookAt.y * scale, scale };
}

const MAP_W = 148;

function ArenaNodeButton({
  node,
  treeId,
  selected,
  dimmed,
  onSelect,
}: {
  node: ArenaTreeNode;
  treeId: ArenaTreeId;
  selected: boolean;
  dimmed: boolean;
  onSelect: (node: ArenaTreeNode) => void;
}) {
  const theme = RANK_THEME[node.rank];
  const size = theme.size;
  const icon = TREE_META[treeId].icon;
  const live = node.state === 'unlocked';
  const done = node.state === 'completed';
  const pending = node.state === 'pending';
  const claimable = node.state === 'claimable';
  const locked = node.state === 'locked';

  const mark = size * 0.3;

  return (
    <div
      className={`relative ${selected ? 'arena-medal-focus' : ''} ${dimmed ? 'opacity-40' : ''}`}
      style={{ width: size, height: size, ['--arena-glow' as string]: theme.glow }}
    >
      {live && !dimmed && <span className="arena-medal-bloom" />}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
        aria-label={locked ? 'Zárt küldetés' : `${theme.label} küldetés`}
        className="arena-medal absolute inset-0 z-[1] rounded-full"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: locked
              ? 'linear-gradient(145deg, #6b7280 0%, #374151 45%, #111827 100%)'
              : theme.rim,
            boxShadow: claimable
              ? `0 8px 18px rgba(0,0,0,0.5), 0 0 18px rgba(251,191,36,0.45)`
              : done
                ? `0 8px 16px rgba(0,0,0,0.5), 0 0 14px rgba(52,226,122,0.35)`
                : pending
                  ? `0 8px 16px rgba(0,0,0,0.5), 0 0 12px rgba(251,191,36,0.3)`
                  : `0 8px 16px rgba(0,0,0,0.5)`,
            opacity: locked ? 0.7 : 1,
          }}
        />
        <span
          className="absolute inset-[10%] rounded-full overflow-hidden"
          style={{ background: locked ? '#14161c' : theme.face }}
        >
          <img
            src={icon}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain p-[14%] select-none pointer-events-none"
            style={{
              opacity: locked ? 0.4 : done ? 0.85 : 1,
              filter: locked ? 'grayscale(1) brightness(0.75)' : undefined,
            }}
          />
          {locked && <span className="absolute inset-0 bg-black/30" />}
        </span>
      </button>
      {done && (
        <span className="arena-status bg-emerald-500 text-white" style={{ width: mark, height: mark, right: -mark * 0.12, bottom: -mark * 0.12 }}>
          <svg viewBox="0 0 20 20" className="w-[62%] h-[62%]" fill="none" aria-hidden>
            <path d="M4.5 10.5 8.2 14.2 15.5 6.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {claimable && (
        <span className="arena-status bg-yellow-400 text-black" style={{ width: mark, height: mark, right: -mark * 0.12, bottom: -mark * 0.12 }}>
          <FaGift className="w-[55%] h-[55%]" />
        </span>
      )}
      {pending && (
        <span className="arena-status bg-amber-400 text-black" style={{ width: mark, height: mark, right: -mark * 0.12, bottom: -mark * 0.12 }}>
          <FaClock className="w-[55%] h-[55%]" />
        </span>
      )}
      {locked && (
        <span className="arena-status bg-[#1a1a22] text-gray-400 !border-white/15" style={{ width: mark, height: mark, right: -mark * 0.12, bottom: -mark * 0.12 }}>
          <FaLock className="w-[50%] h-[50%]" />
        </span>
      )}
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Minimap({
  nodes,
  layout,
  selectedSlot,
  cam,
  viewport,
  onPick,
  onPan,
  onPanStart,
  onPanEnd,
}: {
  nodes: ArenaTreeNode[];
  layout: { pos: Record<string, LayoutPos>; width: number; height: number };
  selectedSlot: string | null;
  cam: Cam;
  viewport: { w: number; h: number };
  onPick: (node: ArenaTreeNode) => void;
  onPan: (lookAt: { x: number; y: number }) => void;
  onPanStart: () => void;
  onPanEnd: () => void;
}) {
  const mapScale = MAP_W / layout.width;
  const h = layout.height * mapScale;
  const vx = (-cam.x / cam.scale) * mapScale;
  const vy = (-cam.y / cam.scale) * mapScale;
  const vw = (viewport.w / cam.scale) * mapScale;
  const vh = (viewport.h / cam.scale) * mapScale;
  const drag = useRef<{
    pointer: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const toTree = (clientX: number, clientY: number) => {
    const rect = mapRef.current!.getBoundingClientRect();
    return {
      x: clamp((clientX - rect.left) / mapScale, 0, layout.width),
      y: clamp((clientY - rect.top) / mapScale, 0, layout.height),
    };
  };

  const nearest = (pt: { x: number; y: number }) => {
    let best: ArenaTreeNode | null = null;
    let bestD = Infinity;
    for (const n of nodes) {
      const p = layout.pos[n.slot];
      if (!p) continue;
      const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const look = toTree(e.clientX, e.clientY);
    drag.current = {
      pointer: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: look.x,
      originY: look.y,
      moved: false,
    };
    onPanStart();
    onPan(look);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    if (dist > 4) d.moved = true;
    onPan(toTree(e.clientX, e.clientY));
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    drag.current = null;
    onPanEnd();
    if (!d.moved) {
      const node = nearest(toTree(e.clientX, e.clientY));
      if (node) onPick(node);
    }
  };

  return (
    <div className="arena-minimap rounded-2xl border border-white/15 bg-black/70 p-2 shadow-2xl">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 px-1 pb-1">Térkép · húzd a kamerához</p>
      <div
        ref={mapRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: MAP_W, height: h }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {nodes.map((n) => {
          const p = layout.pos[n.slot];
          if (!p) return null;
          const r = Math.max(3.5, p.size * mapScale * 0.38);
          const color = n.state === 'locked' ? 'rgba(255,255,255,0.22)' : RANK_THEME[n.rank].ring;
          return (
            <span
              key={n.slot}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.x * mapScale - r,
                top: p.y * mapScale - r,
                width: r * 2,
                height: r * 2,
                background: color,
                outline: selectedSlot === n.slot ? '2px solid #fff' : undefined,
                outlineOffset: 1,
              }}
            />
          );
        })}
        <div
          className="absolute border-2 border-orange-400/90 rounded-sm pointer-events-none bg-orange-400/10"
          style={{ left: vx, top: vy, width: vw, height: vh }}
        />
      </div>
    </div>
  );
}

function NodeDock({
  node,
  treeId,
  onClose,
  onSubmitted,
  onClaimed,
  tutorialList,
}: {
  node: ArenaTreeNode;
  treeId: ArenaTreeId;
  onClose: () => void;
  onSubmitted: () => void;
  onClaimed: (reward: { xp: number; badge: ArenaBadge | null }) => void;
  tutorialList: Tutorial[];
}) {
  const { submitArenaMission, claimArenaReward } = useRLM();
  const [panel, setPanel] = useState<'view' | 'submit'>('view');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = RANK_THEME[node.rank];
  const mission = node.mission;
  const tutorials = (mission?.relatedTutorialIds || [])
    .map((id) => tutorialList.find((t) => t.id === id))
    .filter((t): t is Tutorial => Boolean(t));

  const submit = async () => {
    if (!mission) return;
    const trimmed = note.trim();
    if (!file && trimmed.length < 8) {
      setError('Írj legalább egy rövid megjegyzést, vagy csatolj videót.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitArenaMission(treeId, node.slot, { note: trimmed, video: file });
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Beküldés sikertelen.');
    } finally {
      setBusy(false);
    }
  };

  const claim = async () => {
    setBusy(true);
    setError(null);
    try {
      const reward = await claimArenaReward({ tree: treeId, slot: node.slot });
      onClaimed({ xp: reward.xp, badge: reward.badge });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Az átvétel nem sikerült.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="arena-dock rlm-scroll overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a12]/95 shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a12]">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">{theme.label}</p>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Bezárás">
          <FaTimes className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {!mission ? (
          <div className="text-center py-6">
            <FaLock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Zárt küldetés</h3>
            <p className="text-sm text-gray-400">Előbb teljesítsd az alatta lévő nyitott node-okat. A feladat szövege zárva marad.</p>
          </div>
        ) : (
          <>
            {panel === 'view' && mission.videoUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <video src={resolveVideoUrl(mission.videoUrl)} controls preload="metadata" className="w-full h-full" />
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-white leading-tight">{mission.typeLabel}</h3>
              <span className="inline-flex items-center gap-1 text-yellow-300 text-xs font-semibold bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-full shrink-0">
                <FaStar className="w-3 h-3" /> {mission.xp} XP
              </span>
            </div>
            <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_PILL[mission.type] || ''}`}>
              {mission.typeLabel}
            </span>
            {panel === 'view' ? (
              <>
                <p className="text-sm text-gray-200 leading-relaxed">{mission.text}</p>
                {tutorials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tutorials.map((t) => (
                      <Link key={t!.id} href="/dashboard/learn" className="text-[11px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                        {t!.title}
                      </Link>
                    ))}
                  </div>
                )}
                {node.state === 'completed' && (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/15 text-green-400 font-semibold text-sm">
                    <FaCheck /> Teljesítve
                  </div>
                )}
                {node.state === 'pending' && (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 font-semibold text-sm">
                    <FaClock /> Ellenőrzésre vár
                  </div>
                )}
                {node.state === 'claimable' && (
                  <button type="button" disabled={busy} onClick={claim} className="w-full rlm-btn-primary py-3 flex items-center justify-center gap-2">
                    <FaGift /> {busy ? 'Átvétel…' : `Jutalom átvétele (+${mission.xp} XP)`}
                  </button>
                )}
                {node.state === 'unlocked' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPanel('view')} className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold">
                      <span className="inline-flex items-center justify-center gap-2"><FaPlay className="w-3 h-3" /> Videó</span>
                    </button>
                    <button type="button" onClick={() => setPanel('submit')} className="rlm-btn-primary py-2.5 text-sm">Beküldés</button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Klipp vagy megjegyzés — Zoli bírálja, az XP a jutalom átvételekor jár.</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 2000))}
                  rows={4}
                  maxLength={2000}
                  placeholder="Pl. melyik map, hanyadik próba…"
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3 text-sm outline-none focus:border-orange-400/50"
                />
                <label className="flex items-center gap-3 rounded-xl bg-white/5 border border-dashed border-white/15 px-3 py-2.5 text-sm text-gray-300 cursor-pointer">
                  <FaUpload className="text-orange-400" />
                  <span className="truncate">{file ? file.name : 'Videó (opcionális, max 200 MB)'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                    className="hidden"
                    onChange={(e) => {
                      const next = e.target.files?.[0] || null;
                      if (next && next.size > MAX_CLIP_BYTES) {
                        setError('A videó maximum 200 MB lehet.');
                        setFile(null);
                        return;
                      }
                      setError(null);
                      setFile(next);
                    }}
                  />
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPanel('view')} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 font-semibold text-sm">Vissza</button>
                  <button type="button" disabled={busy} onClick={submit} className="flex-1 rlm-btn-primary py-2.5 text-sm disabled:opacity-60">
                    {busy ? 'Küldés…' : 'Beküldöm'}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </>
        )}
      </div>
    </aside>
  );
}

export default function ArenaPage() {
  const { profile } = useRLM();
  const [treeId, setTreeId] = useState<ArenaTreeId>('dribble');
  const [data, setData] = useState<ArenaTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ArenaTreeNode | null>(null);
  const [lookAt, setLookAt] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewport, setViewport] = useState({ w: 880, h: 720 });
  const [reward, setReward] = useState<{ xp: number; badge: ArenaBadge | null } | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>(FALLBACK_TUTORIALS);
  const cacheRef = useRef<Partial<Record<ArenaTreeId, ArenaTreeResponse>>>({});
  const stageRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (id: ArenaTreeId) => {
    const cached = cacheRef.current[id];
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await api.get<ArenaTreeResponse>(`/api/arena/tree?tree=${id}`);
      cacheRef.current[id] = res;
      setData(res);
      setSelected((prev) => {
        if (!prev || prev.slot == null) return prev;
        return res.nodes.find((n) => n.slot === prev.slot) || prev;
      });
    } catch (e) {
      if (!cached) setError(e instanceof Error ? e.message : 'Nem sikerült betölteni az arénát.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(treeId);
    const other: ArenaTreeId = treeId === 'dribble' ? 'aerial' : 'dribble';
    if (!cacheRef.current[other]) {
      void api.get<ArenaTreeResponse>(`/api/arena/tree?tree=${other}`)
        .then((res) => { cacheRef.current[other] = res; })
        .catch(() => {});
    }
  }, [treeId, load]);

  useEffect(() => {
    void api.get<{ tutorials: Tutorial[] }>('/api/learn')
      .then((res) => { if (res.tutorials?.length) setTutorials(res.tutorials); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setViewport({ w: Math.max(320, r.width), h: Math.max(480, r.height) });
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setLookAt(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nodes = data?.tree === treeId ? data.nodes : (cacheRef.current[treeId]?.nodes || []);
  const layout = useMemo(() => layoutTree(nodes), [nodes]);
  const wide = viewport.w >= 880;
  const selectedPos = selected ? layout.pos[selected.slot] : null;
  const cam = useMemo(() => {
    if (selected && (lookAt || selectedPos)) {
      const target = lookAt || selectedPos!;
      const size = selectedPos?.size || 76;
      return camFromLookAt(target, zoomScaleFor(size, viewport.w, viewport.h, wide), viewport.w, viewport.h, wide);
    }
    return fitCamera(layout, viewport.w, viewport.h);
  }, [selected, selectedPos, lookAt, viewport, layout, wide]);

  const completedCount = nodes.filter((n) => n.state === 'completed').length;
  const claimableCount = nodes.filter((n) => n.state === 'claimable').length;
  const totalXP = nodes.reduce((s, n) => s + n.xp, 0);
  const earnedXP = nodes.filter((n) => n.state === 'completed').reduce((s, n) => s + n.xp, 0);
  const progressPct = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0;
  const resetLabel = data?.resetsAt
    ? new Date(data.resetsAt).toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })
    : '';

  const rankCounts = (['master', 'plat', 'gold', 'silver'] as ArenaRank[]).map((rank) => ({
    rank,
    total: nodes.filter((n) => n.rank === rank).length,
    done: nodes.filter((n) => n.rank === rank && n.state === 'completed').length,
  }));

  const zoomOut = () => {
    setSelected(null);
    setLookAt(null);
  };
  const pickNode = (node: ArenaTreeNode) => {
    setSelected(node);
    const p = layout.pos[node.slot];
    if (p) setLookAt({ x: p.x, y: p.y });
  };
  const refreshTree = () => {
    delete cacheRef.current[treeId];
    void load(treeId);
  };

  return (
    <div className="space-y-5">
      {reward && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={() => setReward(null)}>
          <div className="rlm-card p-8 max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <FaGift className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">Jutalom átvéve</h3>
            <p className="text-orange-300 font-semibold mb-4">+{reward.xp} XP</p>
            {reward.badge && <div className="flex justify-center mb-4"><ArenaRankBadge badge={reward.badge} size={64} showMeta /></div>}
            <button type="button" onClick={() => setReward(null)} className="rlm-btn-primary px-6 py-2.5">Szép volt</button>
          </div>
        </div>
      )}

      <div>
        <p className="rlm-eyebrow mb-3">Havi skill tree</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Aréna</h1>
        <p className="text-gray-400 mt-2 max-w-xl">
          Kattints egy golyóra: a fa oda zoomol. A bal oldali térképet húzva mozog a kamera.
          Következő reset: {resetLabel || 'hónap vége'}.
        </p>
      </div>

      {claimableCount > 0 && (
        <button
          type="button"
          onClick={() => {
            const first = nodes.find((n) => n.state === 'claimable');
            if (first) pickNode(first);
          }}
          className="w-full rlm-card p-3 flex items-center gap-3 text-left hover:bg-white/5"
        >
          <FaGift className="text-yellow-400" />
          <span className="text-sm text-white font-semibold">
            {claimableCount} elfogadott küldetés vár — vedd át az XP-t és a badge-et
          </span>
        </button>
      )}

      {(profile.arenaBadges?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-4 items-end">
          {profile.arenaBadges!.map((b) => (
            <ArenaRankBadge key={b.id} badge={b} size={40} showMeta />
          ))}
        </div>
      )}

      <div className="rlm-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{completedCount}/{nodes.length || 25} küldetés ebben a hónapban</span>
            <span className="text-orange-400 font-medium">{earnedXP}/{totalXP} XP</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
          <FaRedo className="w-3 h-3" /> Havonta reset · előző havi pool kihagyva
        </div>
      </div>

      <div
        ref={stageRef}
        className="arena-stage relative rounded-[1.6rem] border border-white/10 overflow-hidden"
        style={{ height: 'min(78vh, 860px)' }}
        onClick={zoomOut}
      >
        <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/15 bg-black/70 shadow-2xl">
            {(Object.keys(TREE_META) as ArenaTreeId[]).map((id) => {
              const active = treeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setTreeId(id); setSelected(null); setLookAt(null); }}
                  className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl ${active ? 'bg-white/10' : 'opacity-55 hover:opacity-100'}`}
                >
                  <img src={TREE_META[id].icon} alt="" className="w-10 h-10 object-contain" />
                  <span className="text-sm font-bold text-white">{TREE_META[id].name}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <>
              <Minimap
                nodes={nodes}
                layout={layout}
                selectedSlot={selected.slot}
                cam={cam}
                viewport={viewport}
                onPick={pickNode}
                onPan={(pt) => setLookAt(pt)}
                onPanStart={() => setDragging(true)}
                onPanEnd={() => setDragging(false)}
              />
              <button
                type="button"
                onClick={zoomOut}
                className="w-full text-xs font-semibold py-2 rounded-xl bg-black/70 border border-white/15 text-gray-200 flex items-center justify-center gap-1.5"
              >
                <FaSearchMinus /> Teljes fa
              </button>
            </>
          )}
        </div>

        {selected && (
          <div
            className={`absolute z-20 ${wide ? 'right-3 top-3 bottom-3 w-[340px]' : 'left-3 right-3 bottom-3 max-h-[46%]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <NodeDock
              node={selected}
              treeId={treeId}
              tutorialList={tutorials}
              onClose={zoomOut}
              onSubmitted={refreshTree}
              onClaimed={(r) => {
                setReward(r);
                refreshTree();
              }}
            />
          </div>
        )}

        {error && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <p className="text-red-300 text-center mb-4">{error}</p>
              <button type="button" onClick={() => void load(treeId)} className="rlm-btn-primary px-5 py-2.5 mx-auto block">
                Újrapróbálás
              </button>
            </div>
          </div>
        )}
        {loading && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">Aréna betöltése…</div>
        )}

        {nodes.length > 0 && (
          <div
            className={`arena-camera absolute top-0 left-0 ${dragging ? 'arena-camera-drag' : ''}`}
            style={{
              width: layout.width,
              height: layout.height,
              transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.scale})`,
            }}
          >
            <svg className="absolute inset-0 pointer-events-none" width={layout.width} height={layout.height}>
              {nodes.flatMap((node) =>
                node.parents.map((parentId) => {
                  const a = layout.pos[node.slot];
                  const b = layout.pos[parentId];
                  if (!a || !b) return null;
                  const parent = nodes.find((n) => n.slot === parentId);
                  const lit = parent?.state === 'completed';
                  const color = lit ? RANK_THEME[node.rank].ring : 'rgba(255,255,255,0.18)';
                  const midY = (a.y + b.y) / 2;
                  return (
                    <path
                      key={`${node.slot}-${parentId}`}
                      d={`M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={lit ? 2.2 : 1.5}
                      opacity={lit ? 0.85 : 0.5}
                    />
                  );
                }),
              )}
            </svg>
            {nodes.map((node) => {
              const p = layout.pos[node.slot];
              if (!p) return null;
              return (
                <div
                  key={node.slot}
                  className="absolute"
                  style={{
                    left: p.x - p.size / 2,
                    top: p.y - p.size / 2,
                    width: p.size,
                    height: p.size,
                    overflow: 'visible',
                  }}
                >
                  <ArenaNodeButton
                    node={node}
                    treeId={treeId}
                    selected={selected?.slot === node.slot}
                    dimmed={Boolean(selected) && selected?.slot !== node.slot}
                    onSelect={pickNode}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap gap-3">
          {rankCounts.map(({ rank, done, total }) => (
            <div key={rank} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: RANK_THEME[rank].ring }} />
              {RANK_THEME[rank].label.split(' ')[0]} {done}/{total}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5"><FaCheck className="text-emerald-400" /> Kész</span>
          <span className="inline-flex items-center gap-1.5"><FaGift className="text-yellow-400" /> Átvehető</span>
          <span className="inline-flex items-center gap-1.5"><FaClock className="text-amber-400" /> Bírálás</span>
          <span className="inline-flex items-center gap-1.5"><FaLock /> Zárva</span>
        </div>
      </div>
    </div>
  );
}
