// Coaching "sheet" model — the core deliverable of a replay analysis.

export type RatingTopicId =
  | 'decision_making'
  | 'positioning'
  | 'mechanics'
  | 'speed_boost'
  | 'awareness'
  | 'recovery_speed'; // legacy alias, mapped to speed_boost

export type RatingColor = 'green' | 'yellow' | 'red' | 'neutral' | 'orange';

export interface RatingTopicMeta {
  id: Exclude<RatingTopicId, 'recovery_speed'>;
  label: string;
  short: string;
}

export const RATING_TOPICS: RatingTopicMeta[] = [
  { id: 'decision_making', label: 'Decision Making', short: 'Döntés' },
  { id: 'positioning', label: 'Positioning', short: 'Pozíció' },
  { id: 'mechanics', label: 'Mechanics', short: 'Mechanika' },
  { id: 'speed_boost', label: 'Speed & Boost Management', short: 'Speed & Boost' },
  { id: 'awareness', label: 'Awareness', short: 'Térérzék' },
];

export const RATING_COLOR_META: Record<RatingColor, { label: string; css: string; hex: string }> = {
  green: { label: 'Rangodhoz megfelelő', css: 'rate-green', hex: '#3BD97E' },
  yellow: { label: 'Hiányos', css: 'rate-yellow', hex: '#F5C518' },
  orange: { label: 'Hiányos', css: 'rate-yellow', hex: '#F5C518' },
  red: { label: 'Javításra szorul', css: 'rate-red', hex: '#FF5A5F' },
  neutral: { label: 'Nincs értékelve', css: 'rate-neutral', hex: '#8892A6' },
};

export interface TopicRating {
  topic: RatingTopicId;
  color: RatingColor;
  biggestMistake?: string;
}

export interface SheetTimestamp {
  id: string;
  time: number;
  topic: RatingTopicId;
  note: string;
}

export interface CoachingSheet {
  id: string;
  title: string;
  createdAt: string;
  videoUrl: string;
  summary: string;
  ratings: TopicRating[];
  timestamps: SheetTimestamp[];
  published: boolean;
  authorName: string;
  authorRank: string;
  userId?: number;
  playerRank?: string;
  feedbackStars?: number | null;
  feedbackMessage?: string | null;
  feedbackTip?: number;
  hasFeedback?: boolean;
}

export function canonTopic(topic: RatingTopicId | string): RatingTopicMeta['id'] {
  if (topic === 'recovery_speed') return 'speed_boost';
  return topic as RatingTopicMeta['id'];
}

export function canonColor(color: RatingColor): Exclude<RatingColor, 'orange'> {
  if (color === 'orange') return 'yellow';
  return color;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ratingColorFor(sheet: CoachingSheet, topic: RatingTopicId): RatingColor {
  const want = canonTopic(topic);
  const found = sheet.ratings.find((r) => canonTopic(r.topic) === want);
  return found ? canonColor(found.color) : 'neutral';
}

export function sheetScore(sheet: CoachingSheet): number {
  const map: Record<string, number> = { green: 2, yellow: 1, orange: 1, red: 0, neutral: 1 };
  if (!sheet.ratings.length) return 0;
  const total = sheet.ratings.reduce((sum, r) => sum + (map[r.color] ?? 1), 0);
  return Math.round((total / (sheet.ratings.length * 2)) * 100);
}
