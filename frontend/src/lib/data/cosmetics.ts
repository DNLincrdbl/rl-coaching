// Profile cosmetics. Keep in sync with backend/app/cosmetics.py.

export interface ProfileColor {
  id: string;
  hex: string;
  name: string;
  level: number;
}

export const PROFILE_COLORS: ProfileColor[] = [
  { id: 'black', hex: '#0A0A0C', name: 'Fekete', level: 1 },
  { id: 'green', hex: '#16A34A', name: 'Zöld', level: 2 },
  { id: 'blue', hex: '#2563EB', name: 'Kék', level: 3 },
  { id: 'red', hex: '#DC2626', name: 'Piros', level: 4 },
  { id: 'pink', hex: '#EC4899', name: 'Rózsaszín', level: 5 },
  { id: 'orange', hex: '#EA580C', name: 'Narancs', level: 6 },
  { id: 'purple', hex: '#7C3AED', name: 'Lila', level: 7 },
  { id: 'gold', hex: '#CA8A04', name: 'Arany', level: 8 },
  { id: 'teal', hex: '#0D9488', name: 'Türkiz', level: 9 },
  { id: 'white', hex: '#E5E7EB', name: 'Fehér', level: 10 },
];

export interface ProfileTitle {
  id: string;
  name: string;
  kind: 'founding' | 'arena';
  hint: string;
}

export const PROFILE_TITLES: ProfileTitle[] = [
  { id: 'og', name: 'OG', kind: 'founding', hint: 'Az első 20 RLM+ tag' },
  { id: 'dribble_master', name: 'Dribble Master', kind: 'arena', hint: 'Aréna — Dribble fa' },
  { id: 'aerial_master', name: 'Aerial Master', kind: 'arena', hint: 'Aréna — Aerial fa' },
];

export function colorById(id: string | null | undefined): ProfileColor {
  return PROFILE_COLORS.find((c) => c.id === id) ?? PROFILE_COLORS[0];
}

export function titleById(id: string | null | undefined): ProfileTitle | null {
  if (!id) return null;
  return PROFILE_TITLES.find((t) => t.id === id) ?? null;
}

export function isLightHex(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
