'use client';

import React from 'react';
import { FaStar } from 'react-icons/fa';
import { ArenaBadge, ARENA_BADGE_THEME, badgeLabel, formatAcquired } from '@/lib/data/arenaBadges';
import { TREE_META } from '@/lib/data/arena';

export default function ArenaRankBadge({
  badge,
  size = 44,
  showMeta = false,
}: {
  badge: ArenaBadge;
  size?: number;
  showMeta?: boolean;
}) {
  const theme = ARENA_BADGE_THEME[badge.rank];
  const stars = Math.max(1, Math.min(5, badge.stars || 1));
  return (
    <div className="inline-flex flex-col items-center gap-1" title={`${badgeLabel(badge)} · ${formatAcquired(badge.acquired)}`}>
      <span
        className="relative rounded-full flex items-center justify-center border"
        style={{
          width: size,
          height: size,
          background: theme.face,
          borderColor: theme.ring,
          boxShadow: `0 0 0 1px ${theme.ring}55`,
        }}
      >
        <img
          src={TREE_META[badge.tree].icon}
          alt=""
          className="object-contain pointer-events-none"
          style={{ width: size * 0.62, height: size * 0.62 }}
        />
      </span>
      <span className="flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <FaStar key={i} className="text-yellow-300" style={{ width: Math.max(7, size * 0.16), height: Math.max(7, size * 0.16) }} />
        ))}
      </span>
      {showMeta && (
        <span className="text-[10px] text-gray-400 text-center leading-tight">
          {badgeLabel(badge)}
          <br />
          {formatAcquired(badge.acquired)}
        </span>
      )}
    </div>
  );
}
