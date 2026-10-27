export type ArenaRank = 'silver' | 'gold' | 'plat' | 'master';
export type ArenaTreeId = 'dribble' | 'aerial';

export interface ArenaBadge {
  id: string;
  tree: ArenaTreeId;
  rank: ArenaRank;
  stars: number;
  acquired: string;
  lastMonth?: string;
}

export const ARENA_BADGE_THEME: Record<ArenaRank, { label: string; ring: string; face: string }> = {
  silver: { label: 'Silver', ring: '#d7dee8', face: 'linear-gradient(145deg, #e8eef5, #7b8494)' },
  gold: { label: 'Gold', ring: '#ffb347', face: 'linear-gradient(145deg, #ffe08a, #c07212)' },
  plat: { label: 'Platinum', ring: '#5cc8ff', face: 'linear-gradient(145deg, #c4efff, #2a7fb8)' },
  master: { label: 'Master', ring: '#d8b4fe', face: 'linear-gradient(145deg, #edd5ff, #7c3aed)' },
};

export function formatAcquired(month: string | undefined): string {
  if (!month) return '';
  return `Megszerezve: ${month.replace('-', '.')}`;
}

export function badgeLabel(badge: ArenaBadge): string {
  const tree = badge.tree === 'dribble' ? 'Dribble' : 'Aerial';
  return `${tree} ${ARENA_BADGE_THEME[badge.rank].label}`;
}
