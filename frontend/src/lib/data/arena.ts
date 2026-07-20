// Arena Tree data — Dribble & Aerial skill trees.
// Modeled from the client's reference images. Each tree is a set of nodes
// arranged in tiers (rows). A node unlocks once at least one of its parents
// (the closest nodes in the tier below) is completed. Tier 0 is always open.

export type ArenaTreeId = 'dribble' | 'aerial';

export interface ArenaNode {
  id: string;
  label: string;
  /** Short coaching description shown in the detail panel. */
  description: string;
  /** XP awarded for completing this move. */
  xp: number;
  /** Row index, 0 = bottom (easiest / root). */
  tier: number;
  /** Horizontal slot within the tier, 0-based left→right. */
  col: number;
  /** Number of columns in this tier (for centering). */
  cols: number;
  /** Placeholder move video. */
  videoUrl: string;
}

const DEMO_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

function node(
  id: string,
  label: string,
  description: string,
  tier: number,
  col: number,
  cols: number,
): ArenaNode {
  // XP scales with tier difficulty.
  const xp = 100 + tier * 50;
  return { id, label, description, xp, tier, col, cols, videoUrl: DEMO_VIDEO };
}

export const DRIBBLE_TREE: ArenaNode[] = [
  node('d-t0-0', 'Középről földön bevezetni', 'Vezesd be a labdát középről a földön kontrolláltan.', 0, 0, 1),

  node('d-t1-0', 'Powershot', 'Erős, pontos powershot a földről.', 1, 0, 2),
  node('d-t1-1', 'Keresztflick', 'Oldalra irányzott keresztflick gólra.', 1, 1, 2),

  node('d-t2-0', 'B. dribble powershot', 'Balance dribble után powershot.', 2, 0, 3),
  node('d-t2-1', '45 fokos', '45 fokos flick alapok.', 2, 1, 3),
  node('d-t2-2', 'Flick utána p shot', 'Flick megjátszás, majd power shot.', 2, 2, 3),

  node('d-t3-0', 'Középről magadon bevezetni', 'Középről magadon átvezetett labda.', 3, 0, 3),
  node('d-t3-1', 'Pslide cut pshot', 'Powerslide cut, majd power shot.', 3, 1, 3),
  node('d-t3-2', 'D. 45 fokos', 'Delayed 45 fokos flick.', 3, 2, 3),

  node('d-t4-0', 'Egyik kapuból a másikba bevezetni', 'Teljes pályás labdavezetés kaputól kapuig.', 4, 0, 3),
  node('d-t4-1', 'Pslide kanyar aztán flick', 'Powerslide kanyar után flick.', 4, 1, 3),
  node('d-t4-2', 'Musty', 'Musty flick alapok.', 4, 2, 3),

  node('d-t5-0', 'Kaputól kapuig magadon, 0 boost', 'Magadon vezetve, boost nélkül.', 5, 0, 4),
  node('d-t5-1', 'Flick, catch flick', 'Flick, elkapás, majd újabb flick.', 5, 1, 4),
  node('d-t5-2', '2x pslide kanyar aztán flick', 'Dupla powerslide kanyar, majd flick.', 5, 2, 4),
  node('d-t5-3', 'D. musty', 'Delayed musty flick.', 5, 3, 4),

  node('d-t6-0', 'Tenni egy kört 0 boosttal', 'Teljes kör a labdával boost nélkül.', 6, 0, 4),
  node('d-t6-1', 'B. dribble catch 45 degree', 'Balance dribble catch 45 fokra.', 6, 1, 4),
  node('d-t6-2', 'Pslide turn aztán másik kapu flick', 'Powerslide fordulás, majd flick a másik kapura.', 6, 2, 4),
  node('d-t6-3', 'Breezi', 'Breezi flick alapok.', 6, 3, 4),

  node('d-t7-0', 'Háttal elvezetni egyikből a másikba', 'Háttal vezetve kaputól kapuig.', 7, 0, 3),
  node('d-t7-1', 'Háttal flick', 'Flick háttal a kapunak.', 7, 1, 3),
  node('d-t7-2', '1 pslide full kör flick', 'Egy powerslide-os teljes kör, majd flick.', 7, 2, 3),

  node('d-t8-0', 'Háttal egy teljes kör a labdával', 'Teljes kör háttal, kontrollal.', 8, 0, 2),
  node('d-t8-1', 'D. breezi', 'Delayed breezi flick.', 8, 1, 2),

  node('d-t9-0', 'Turn, backflip x4', 'Fordulás + backflip kombó ismételve.', 9, 0, 2),
  node('d-t9-1', 'Delayed breezi sidewallra, redirect', 'Delayed breezi az oldalfalra, onnan redirect.', 9, 1, 2),
];

export const AERIAL_TREE: ArenaNode[] = [
  node('a-t0-0', 'Középről másikba berepülni', 'Alap aerial: középről a labdába repülni.', 0, 0, 1),

  node('a-t1-0', 'Egyik kapuból másikba repülni háttal', 'Aerial háttal, kaputól kapuig.', 1, 0, 2),
  node('a-t1-1', 'Kapuból másikba air rollt lenyomva', 'Folyamatos air roll aerial közben.', 1, 1, 2),

  node('a-t2-0', 'Aerial shot (4-es gomb)', 'Aerial lövés alap gombkiosztással.', 2, 0, 2),
  node('a-t2-1', 'Oldalfalról ugorva üsd el a labdát', 'Oldalfalról elrugaszkodva megjátszás.', 2, 1, 2),

  node('a-t3-0', 'Air dribble oldalfalról', 'Air dribble indítása oldalfalról.', 3, 0, 3),
  node('a-t3-1', 'Basic double tap', 'Alap double tap a hátfalról.', 3, 1, 3),
  node('a-t3-2', 'Redirect', 'Levegőben irányváltás gólra.', 3, 2, 3),

  node('a-t4-0', 'Félpályáról air dribble', 'Air dribble félpályáról indítva.', 4, 0, 3),
  node('a-t4-1', 'Air dribble double tap', 'Air dribble, majd double tap.', 4, 1, 3),
  node('a-t4-2', 'Földről félp. air dribble double tap', 'Földről félpályás air dribble double tap.', 4, 2, 3),

  node('a-t5-0', 'Ceiling shot', 'Ceiling shot alapok.', 5, 0, 3),
  node('a-t5-1', 'Flip reset', 'Flip reset megszerzése.', 5, 1, 3),
  node('a-t5-2', 'Pop reset', 'Pop reset technika.', 5, 2, 3),

  node('a-t6-0', 'Ground pinch', 'Földi pinch erős lövésre.', 6, 0, 3),
  node('a-t6-1', 'Flip reset pogo', 'Ismételt flip reset pogo.', 6, 1, 3),
  node('a-t6-2', 'Stall reset', 'Stall és reset kombináció.', 6, 2, 3),

  node('a-t7-0', 'Kuxir pinch', 'Kuxir pinch technika.', 7, 0, 3),
  node('a-t7-1', 'Maktuf reset', 'Maktuf reset megjátszás.', 7, 1, 3),
  node('a-t7-2', 'Musty sidewall redirect', 'Musty redirect az oldalfalról.', 7, 2, 3),

  node('a-t8-0', 'Ceiling pinch', 'Ceiling pinch erős befejezésre.', 8, 0, 3),
  node('a-t8-1', 'Falról reset', 'Reset a falról indítva.', 8, 1, 3),
  node('a-t8-2', 'Double flip reset', 'Két flip reset egy repülésben.', 8, 2, 3),

  node('a-t9-0', 'Ceiling p. + ground p.', 'Ceiling és ground pinch kombó.', 9, 0, 2),
  node('a-t9-1', 'Cross map air dribble, flip reset, musty', 'Cross map air dribble → flip reset → musty double tap.', 9, 1, 2),
];

export const ARENA_TREES: Record<ArenaTreeId, { name: string; nodes: ArenaNode[] }> = {
  dribble: { name: 'Dribble', nodes: DRIBBLE_TREE },
  aerial: { name: 'Aerial', nodes: AERIAL_TREE },
};

/** Parents of a node = nodes in the tier below whose column is closest. */
export function getParents(tree: ArenaNode[], node: ArenaNode): ArenaNode[] {
  if (node.tier === 0) return [];
  const below = tree.filter((n) => n.tier === node.tier - 1);
  if (below.length === 0) return [];
  // Normalize columns to 0..1 for both tiers, then link to nearest.
  const norm = (n: ArenaNode) => (n.cols <= 1 ? 0.5 : n.col / (n.cols - 1));
  const target = norm(node);
  let minDist = Infinity;
  below.forEach((n) => {
    const d = Math.abs(norm(n) - target);
    if (d < minDist) minDist = d;
  });
  return below.filter((n) => Math.abs(norm(n) - target) <= minDist + 0.001);
}

/** A node is unlocked if it's tier 0 or any parent is completed. */
export function isNodeUnlocked(tree: ArenaNode[], node: ArenaNode, completed: string[]): boolean {
  if (node.tier === 0) return true;
  const parents = getParents(tree, node);
  return parents.some((p) => completed.includes(p.id));
}
