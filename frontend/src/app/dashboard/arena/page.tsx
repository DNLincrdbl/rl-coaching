'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaProjectDiagram,
  FaLock,
  FaCheck,
  FaPlay,
  FaTimes,
  FaStar,
  FaRedo,
} from 'react-icons/fa';
import { useRLM } from '@/contexts/RLMContext';
import {
  ARENA_TREES,
  ArenaTreeId,
  ArenaNode,
  getParents,
  isNodeUnlocked,
} from '@/lib/data/arena';

type NodeState = 'completed' | 'unlocked' | 'locked';

function nodeState(tree: ArenaNode[], node: ArenaNode, completed: string[]): NodeState {
  if (completed.includes(node.id)) return 'completed';
  if (isNodeUnlocked(tree, node, completed)) return 'unlocked';
  return 'locked';
}

function NodeDetail({
  node,
  state,
  onComplete,
  onClose,
}: {
  node: ArenaNode;
  state: NodeState;
  onComplete: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rlm-card max-w-lg w-full overflow-hidden"
      >
        <div className="relative aspect-video bg-black">
          <video src={node.videoUrl} controls className="w-full h-full" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80">
            <FaTimes className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{node.label}</h3>
            <span className="flex items-center gap-1.5 text-yellow-400 font-semibold whitespace-nowrap">
              <FaStar className="w-4 h-4" /> +{node.xp} XP
            </span>
          </div>
          <p className="text-gray-400 mb-6">{node.description}</p>

          {state === 'completed' ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/15 text-green-400 font-semibold">
              <FaCheck /> Teljesítve
            </div>
          ) : state === 'unlocked' ? (
            <button onClick={onComplete} className="w-full rlm-btn-primary py-3 flex items-center justify-center gap-2">
              <FaCheck /> Megcsináltam (+{node.xp} XP)
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-gray-500 font-semibold">
              <FaLock /> Előbb teljesítsd az előző szintet
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ArenaPage() {
  const { profile, completeArenaNode } = useRLM();
  const [treeId, setTreeId] = useState<ArenaTreeId>('dribble');
  const [selected, setSelected] = useState<ArenaNode | null>(null);

  const tree = ARENA_TREES[treeId].nodes;
  const completed = profile.arenaProgress[treeId];

  // Group nodes by tier and render from highest tier (top) to root (bottom).
  const tiers = useMemo(() => {
    const maxTier = Math.max(...tree.map((n) => n.tier));
    const rows: ArenaNode[][] = [];
    for (let t = maxTier; t >= 0; t--) {
      rows.push(tree.filter((n) => n.tier === t).sort((a, b) => a.col - b.col));
    }
    return rows;
  }, [tree]);

  // Measure node centers to draw connector lines.
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const box = container.getBoundingClientRect();
      const pos: Record<string, { x: number; y: number }> = {};
      Object.entries(nodeRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        pos[id] = { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      setPositions(pos);
      setSize({ w: box.width, h: box.height });
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [treeId, tiers]);

  const totalXP = tree.reduce((s, n) => s + n.xp, 0);
  const earnedXP = tree.filter((n) => completed.includes(n.id)).reduce((s, n) => s + n.xp, 0);
  const progressPct = Math.round((completed.length / tree.length) * 100);

  // Arena tree resets monthly — show the first day of next month.
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return (
    <div className="space-y-6 rlm-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaProjectDiagram className="text-orange-500" /> Aréna
          </h1>
          <p className="text-gray-400 mt-1">
            Teljesíts mozdulatokat, szerezz XP-t. A fa havonta resetelődik — következő:{' '}
            {nextReset.toLocaleDateString('hu-HU')}.
          </p>
        </div>

        {/* Tree toggle */}
        <div className="flex items-center gap-1 rlm-card !rounded-xl p-1">
          {(Object.keys(ARENA_TREES) as ArenaTreeId[]).map((id) => (
            <button
              key={id}
              onClick={() => { setTreeId(id); setSelected(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                treeId === id ? 'rlm-btn-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              {ARENA_TREES[id].name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="rlm-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{completed.length}/{tree.length} mozdulat</span>
            <span className="text-orange-400 font-medium">{earnedXP}/{totalXP} XP</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FaRedo className="w-3 h-3" /> Havi reset
        </div>
      </div>

      {/* Tree */}
      <div className="rlm-card p-6 overflow-x-auto rlm-scroll">
        <div ref={containerRef} className="relative min-w-[640px] mx-auto max-w-3xl py-4">
          {/* Connectors */}
          <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
            {tree.map((node) =>
              getParents(tree, node).map((parent) => {
                const a = positions[node.id];
                const b = positions[parent.id];
                if (!a || !b) return null;
                const parentDone = completed.includes(parent.id);
                return (
                  <line
                    key={`${node.id}-${parent.id}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={parentDone ? 'rgba(255,107,44,0.5)' : 'rgba(255,255,255,0.12)'}
                    strokeWidth={2}
                  />
                );
              }),
            )}
          </svg>

          {/* Node rows */}
          <div className="relative flex flex-col gap-8">
            {tiers.map((row, i) => (
              <div key={i} className="flex items-center justify-center gap-6 sm:gap-10">
                {row.map((node) => {
                  const state = nodeState(tree, node, completed);
                  return (
                    <div key={node.id} className="flex flex-col items-center gap-1.5 w-24">
                      <button
                        ref={(el) => { nodeRefs.current[node.id] = el; }}
                        onClick={() => setSelected(node)}
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                          state === 'completed'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                            : state === 'unlocked'
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 rlm-pulse'
                            : 'bg-white/5 border border-white/10'
                        }`}
                        title={node.label}
                      >
                        {state === 'completed' ? (
                          <FaCheck className="w-5 h-5 text-white" />
                        ) : state === 'unlocked' ? (
                          <FaPlay className="w-4 h-4 text-white ml-0.5" />
                        ) : (
                          <FaLock className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <span className={`text-[10px] text-center leading-tight ${state === 'locked' ? 'text-gray-600' : 'text-gray-300'}`}>
                        {node.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <NodeDetail
            node={selected}
            state={nodeState(tree, selected, completed)}
            onComplete={() => {
              completeArenaNode(treeId, selected.id, selected.xp);
              setSelected(null);
            }}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
