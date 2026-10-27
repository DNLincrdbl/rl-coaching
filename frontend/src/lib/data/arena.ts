export type ArenaTreeId = 'dribble' | 'aerial';
export type ArenaRank = 'silver' | 'gold' | 'plat' | 'master';
export type ArenaType = 'precision' | 'speed' | 'control' | 'mechanic';
export type ArenaNodeState = 'locked' | 'unlocked' | 'pending' | 'completed' | 'claimable';

export const MONTHLY_SLOTS_PER_TREE = 25;
export const MONTHLY_ARENA_NODES = MONTHLY_SLOTS_PER_TREE * 2;

export const RANK_XP: Record<ArenaRank, number> = {
  silver: 100,
  gold: 200,
  plat: 300,
  master: 500,
};

export const TREE_META: Record<ArenaTreeId, { name: string; icon: string }> = {
  dribble: { name: 'Dribble', icon: '/DribbleArena.png' },
  aerial: { name: 'Aerial', icon: '/AerialArena.png' },
};

export const RANK_THEME: Record<ArenaRank, {
  label: string;
  pool: string;
  glow: string;
  ring: string;
  rim: string;
  face: string;
  size: number;
}> = {
  silver: {
    label: 'Silver Aréna',
    pool: 'Könnyű küldetés pool',
    glow: 'rgba(198, 210, 224, 0.55)',
    ring: '#d7dee8',
    rim: 'linear-gradient(145deg, #f6f8fb 0%, #c7d0dc 16%, #8b96a6 46%, #eef2f7 70%, #6a7382 100%)',
    face: 'radial-gradient(circle at 36% 28%, #4a5566 0%, #1c222c 48%, #0b0e13 100%)',
    size: 68,
  },
  gold: {
    label: 'Gold Aréna',
    pool: 'Közepes küldetés pool',
    glow: 'rgba(255, 176, 64, 0.6)',
    ring: '#ffb347',
    rim: 'linear-gradient(145deg, #ffe9b8 0%, #ffc14d 16%, #c07212 46%, #ffe08a 70%, #8a4e0c 100%)',
    face: 'radial-gradient(circle at 36% 28%, #5a3a14 0%, #1c1208 50%, #0c0804 100%)',
    size: 76,
  },
  plat: {
    label: 'Platinum Aréna',
    pool: 'Nehéz küldetés pool',
    glow: 'rgba(90, 196, 255, 0.6)',
    ring: '#5cc8ff',
    rim: 'linear-gradient(145deg, #edf9ff 0%, #7ad4ff 16%, #2a7fb8 46%, #c4efff 70%, #185986 100%)',
    face: 'radial-gradient(circle at 36% 28%, #1e4a64 0%, #08141c 50%, #04080c 100%)',
    size: 86,
  },
  master: {
    label: 'Master Aréna',
    pool: 'Extrém küldetés pool',
    glow: 'rgba(196, 130, 255, 0.7)',
    ring: '#d8b4fe',
    rim: 'linear-gradient(145deg, #f4e8ff 0%, #d9a8ff 14%, #7c3aed 46%, #edd5ff 70%, #4c1d95 100%)',
    face: 'radial-gradient(circle at 36% 28%, #4a2268 0%, #140818 50%, #08040c 100%)',
    size: 108,
  },
};

export const STAGE = {
  width: 1120,
  colGap: 72,
  rowGap: 56,
  padY: 36,
};

export function layoutTree(nodes: ArenaTreeNode[]) {
  const maxTier = nodes.reduce((m, n) => Math.max(m, n.tier), 0);
  const pos: Record<string, { x: number; y: number; size: number }> = {};
  let y = STAGE.padY;
  for (let t = maxTier; t >= 0; t -= 1) {
    const row = nodes.filter((n) => n.tier === t).sort((a, b) => a.col - b.col);
    if (row.length === 0) continue;
    const size = RANK_THEME[row[0].rank].size;
    const rowW = row.length * size + (row.length - 1) * STAGE.colGap;
    const start = (STAGE.width - rowW) / 2;
    const cy = y + size / 2;
    row.forEach((n, i) => {
      pos[n.slot] = {
        x: start + i * (size + STAGE.colGap) + size / 2,
        y: cy,
        size,
      };
    });
    y += size + STAGE.rowGap;
  }
  return { pos, height: Math.max(y - STAGE.rowGap + STAGE.padY, 320), width: STAGE.width };
}

export interface ArenaMission {
  id: string;
  type: ArenaType;
  typeLabel: string;
  rankLabel: string;
  text: string;
  xp: number;
  videoUrl: string;
  relatedTutorialIds: string[];
}

export interface ArenaTreeNode {
  slot: string;
  rank: ArenaRank;
  tier: number;
  col: number;
  cols: number;
  parents: string[];
  state: ArenaNodeState;
  xp: number;
  mission: ArenaMission | null;
}

export interface ArenaTreeResponse {
  tree: ArenaTreeId;
  treeLabel: string;
  icon: string;
  month: string;
  resetsAt: string;
  nodes: ArenaTreeNode[];
  completed: string[];
  pending: string[];
  claimable?: string[];
}

/** Kept so dashboard / older imports still compile. Monthly tree has 25 slots per side. */
export const ARENA_TREES: Record<ArenaTreeId, { name: string; icon: string; nodes: { length: number } }> = {
  dribble: { name: 'Dribble', icon: '/DribbleArena.png', nodes: { length: MONTHLY_SLOTS_PER_TREE } },
  aerial: { name: 'Aerial', icon: '/AerialArena.png', nodes: { length: MONTHLY_SLOTS_PER_TREE } },
};
