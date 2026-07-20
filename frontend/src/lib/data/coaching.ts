// Coaching "sheet" model — the core deliverable of a replay analysis.
// A sheet contains: the analysed video, a rating for each of the 5 topics
// (green = good for rank / orange = needs work / red = major weakness), a
// written summary, and timestamped notes that let the viewer jump to a moment
// in the video and highlight the related topic.

export type RatingTopicId =
  | 'decision_making'
  | 'positioning'
  | 'mechanics'
  | 'recovery_speed'
  | 'awareness';

export type RatingColor = 'green' | 'orange' | 'red' | 'neutral';

export interface RatingTopicMeta {
  id: RatingTopicId;
  label: string;
  short: string;
}

export const RATING_TOPICS: RatingTopicMeta[] = [
  { id: 'decision_making', label: 'Decision Making', short: 'Döntéshozatal' },
  { id: 'positioning', label: 'Positioning', short: 'Pozícionálás' },
  { id: 'mechanics', label: 'Mechanics', short: 'Mechanika' },
  { id: 'recovery_speed', label: 'Recovery & Speed', short: 'Recovery & Sebesség' },
  { id: 'awareness', label: 'Awareness', short: 'Térérzék' },
];

export const RATING_COLOR_META: Record<RatingColor, { label: string; css: string; hex: string }> = {
  green: { label: 'Rangodhoz megfelelő', css: 'rate-green', hex: '#3BD97E' },
  orange: { label: 'Javításra szorul', css: 'rate-orange', hex: '#FFA23A' },
  red: { label: 'Nagy hiányosság', css: 'rate-red', hex: '#FF5A5F' },
  neutral: { label: 'Nincs értékelve', css: 'rate-neutral', hex: '#8892A6' },
};

export interface TopicRating {
  topic: RatingTopicId;
  color: RatingColor;
  /** For orange/red topics: the single biggest mistake to highlight. */
  biggestMistake?: string;
}

export interface SheetTimestamp {
  id: string;
  /** seconds into the video */
  time: number;
  topic: RatingTopicId;
  note: string;
}

export interface CoachingSheet {
  id: string;
  title: string;
  createdAt: string; // ISO string
  videoUrl: string;
  /** Short summary shown on the profile card. */
  summary: string;
  ratings: TopicRating[];
  timestamps: SheetTimestamp[];
  /** Whether the user published this to "Tanuljunk egymástól". */
  published: boolean;
  /** Author info shown in the community feed. */
  authorName: string;
  authorRank: string;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ratingColorFor(sheet: CoachingSheet, topic: RatingTopicId): RatingColor {
  return sheet.ratings.find((r) => r.topic === topic)?.color ?? 'neutral';
}

/** A simple overall score (green=2, orange=1, red=0) → 0-100. */
export function sheetScore(sheet: CoachingSheet): number {
  const map: Record<RatingColor, number> = { green: 2, orange: 1, red: 0, neutral: 1 };
  const total = sheet.ratings.reduce((sum, r) => sum + map[r.color], 0);
  return Math.round((total / (sheet.ratings.length * 2)) * 100);
}

const DEMO_VIDEO = '/sample-replay.mp4';

// A worked example sheet so the profile & community pages have real content.
export const SAMPLE_SHEET: CoachingSheet = {
  id: 'sheet-demo-1',
  title: 'Replay Elemzés — 2v2 ranked',
  createdAt: new Date().toISOString(),
  videoUrl: DEMO_VIDEO,
  summary:
    'Erős mechanikai alapok, de a pozícionálás és a térérzék javításával sokat lépnél. A rotációknál gyakran túl mélyre mész.',
  ratings: [
    { topic: 'decision_making', color: 'green' },
    { topic: 'positioning', color: 'orange', biggestMistake: 'Túl gyakran mész be másodikként, üresen hagyva a hátsó teret.' },
    { topic: 'mechanics', color: 'green' },
    { topic: 'recovery_speed', color: 'orange', biggestMistake: 'Landolás után nem fordulsz azonnal a labda felé.' },
    { topic: 'awareness', color: 'red', biggestMistake: 'Nem nézed a boostkészletet és a párod pozícióját challenge előtt.' },
  ],
  timestamps: [
    { id: 'ts-1', time: 12, topic: 'positioning', note: 'Itt beszorulsz a sarokba, pedig a párod már támad — maradj magasabban.' },
    { id: 'ts-2', time: 45, topic: 'positioning', note: 'Ebben a helyzetben másodikként mész be, így üresen marad a kapu előtti tér.' },
    { id: 'ts-3', time: 78, topic: 'awareness', note: 'Nem látod, hogy az ellenfél a hátad mögött van boostért — ellenőrizd a mini-mapet.' },
    { id: 'ts-4', time: 120, topic: 'recovery_speed', note: 'Landolás után lassan fordulsz vissza; half-flippel gyorsabb lennél.' },
  ],
  published: false,
  authorName: 'Te',
  authorRank: 'Diamond II',
};

// Sample community sheets (published replay analyses of other members).
export const COMMUNITY_SHEETS: CoachingSheet[] = [
  {
    ...SAMPLE_SHEET,
    id: 'sheet-comm-1',
    title: 'Champ 1 → Champ 2 fejlődés',
    published: true,
    authorName: 'RocketMaster',
    authorRank: 'Champion I',
    summary: 'Jó agresszió, de a boost menedzsment és az 50/50-ek időzítése javítható.',
  },
  {
    ...SAMPLE_SHEET,
    id: 'sheet-comm-2',
    title: 'Diamond replay — védekezés fókusz',
    published: true,
    authorName: 'AerialKing',
    authorRank: 'Diamond III',
    summary: 'Mechanikailag erős, de a shadow defense pozíciók pontatlanok.',
    ratings: [
      { topic: 'decision_making', color: 'orange', biggestMistake: 'Túl korán challenge-elsz kétesélyes helyzetben.' },
      { topic: 'positioning', color: 'green' },
      { topic: 'mechanics', color: 'green' },
      { topic: 'recovery_speed', color: 'green' },
      { topic: 'awareness', color: 'orange', biggestMistake: 'Nem követed a párod rotációját.' },
    ],
  },
];
