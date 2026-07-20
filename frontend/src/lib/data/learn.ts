// Courses & Tutorials data for the combined "Kurzusok & Tutoriálok" tab.

const DEMO_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  /** The first lesson of every course is the course intro. */
  isIntro?: boolean;
}

export type CourseCategory = 'bronze-plat' | 'dia-gc' | 'gc2-ssl' | 'mental';

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  category: CourseCategory;
  lessons: Lesson[];
}

function lessons(prefix: string, intro: string, titles: string[]): Lesson[] {
  const out: Lesson[] = [
    { id: `${prefix}-intro`, title: intro, duration: '4:30', videoUrl: DEMO_VIDEO, isIntro: true },
  ];
  titles.forEach((t, i) => {
    out.push({ id: `${prefix}-${i + 1}`, title: t, duration: `${12 + i}:00`, videoUrl: DEMO_VIDEO });
  });
  return out;
}

export const COURSES: Course[] = [
  {
    id: 'bronze-plat',
    title: 'Bronze → Platinum Kurzus',
    description: 'Alapok, rotáció, pozícionálás és mechanikák kezdőknek.',
    image: '/kurzus-bronz-plat.jpg',
    category: 'bronze-plat',
    lessons: lessons('bp', 'Kurzus bemutató — mit fogsz tanulni?', [
      'Autó irányítás alapjai',
      'Boost menedzsment',
      'Rotáció alapjai 2v2',
      'Rotáció alapjai 3v3',
      'Védekezés alapjai',
      'Támadás alapjai',
      'Egyszerű aerial-ök',
      'Első flickek',
    ]),
  },
  {
    id: 'dia-gc',
    title: 'Diamond → Grand Champion Kurzus',
    description: 'Haladó mechanikák, csapatkoordináció és játékolvasás.',
    image: '/kurzus-dia-gc.jpg',
    category: 'dia-gc',
    lessons: lessons('dg', 'Kurzus bemutató — a következő szint', [
      'Haladó aerial kontroll',
      'Fast aerial technika',
      'Air roll használata',
      'Backboard olvasás',
      'Double tap alapok',
      'Flip reset bevezető',
      'Haladó rotáció',
      'Shadow defense',
    ]),
  },
  {
    id: 'gc2-ssl',
    title: 'Grand Champion 2 → SSL Kurzus',
    description: 'Pro szintű mechanikák, játékelemzés és versenyfelkészülés.',
    image: '/kurzus-gc2-ssl.jpg',
    category: 'gc2-ssl',
    lessons: lessons('gs', 'Kurzus bemutató — a csúcsra', [
      'Pro szintű air roll',
      'Ceiling shots mastery',
      'Reset variációk',
      'Musty és breezi',
      'Team play koordináció',
      'Replay elemzés módszertan',
      'Mentális felkészülés meccsre',
      'Verseny stratégiák',
    ]),
  },
  {
    id: 'mental',
    title: 'Mentál Kurzus',
    description: 'Tilt kezelés, koncentráció és versenyhelyzetek.',
    image: '/kurzus-mentál.jpg',
    category: 'mental',
    lessons: lessons('m', 'Kurzus bemutató — a fejben dől el', [
      'Mi a tilt és honnan jön?',
      'Tilt megelőzése',
      'Tilt kezelése játék közben',
      'Koncentráció fejlesztés',
      'Versenyhelyzetek kezelése',
      'Teammate kommunikáció',
      'Célok kitűzése',
      'Hosszútávú fejlődés',
    ]),
  },
];

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  /** 1-5 stars */
  difficulty: Difficulty;
  /** 1-5 stars — how useful in ranked play */
  ranked: Difficulty;
  videoUrl: string;
}

function tut(
  id: string,
  title: string,
  description: string,
  category: string,
  duration: string,
  difficulty: Difficulty,
  ranked: Difficulty,
): Tutorial {
  return { id, title, description, category, duration, difficulty, ranked, videoUrl: DEMO_VIDEO };
}

export const TUTORIALS: Tutorial[] = [
  // Aerial
  tut('t1', 'Basic Aerial', 'Aerial alapok és időzítés.', 'Aerial', '8:30', 1, 5),
  tut('t2', 'Fast Aerial', 'Gyors felszállás technikája.', 'Aerial', '10:15', 2, 5),
  tut('t3', 'Air Roll Aerial', 'Air roll használata aerial közben.', 'Aerial', '12:00', 3, 4),
  tut('t4', 'Double Jump Aerial', 'Dupla ugrás optimalizálás.', 'Aerial', '9:45', 2, 4),
  // Wall play
  tut('t5', 'Wall Hit Basics', 'Fal menti labdakezelés.', 'Wall Play', '7:20', 1, 5),
  tut('t6', 'Wall to Air Dribble', 'Falról air dribble indítás.', 'Wall Play', '14:30', 4, 2),
  tut('t7', 'Wall Shot Accuracy', 'Pontos lövések falról.', 'Wall Play', '11:00', 2, 4),
  // Dribbling
  tut('t8', 'Ground Dribble', 'Földi labdavezetés alapjai.', 'Dribbling', '10:00', 2, 3),
  tut('t9', 'Flicks', 'Front, side és 45 fokos flick.', 'Dribbling', '12:30', 3, 4),
  tut('t10', '45 Degree Flick', '45 fokos flick technika.', 'Dribbling', '8:45', 3, 4),
  tut('t11', 'Musty Flick', 'Musty flick lépésről lépésre.', 'Dribbling', '15:00', 4, 3),
  tut('t12', 'Breezi Flick', 'Breezi flick tutorial.', 'Dribbling', '18:00', 5, 2),
  // Mechanics
  tut('t13', 'Half Flip', 'Half flip megtanulása.', 'Mechanics', '6:00', 1, 5),
  tut('t14', 'Wave Dash', 'Wave dash használata.', 'Mechanics', '8:00', 2, 5),
  tut('t15', 'Speed Flip', 'Speed flip technika.', 'Mechanics', '12:00', 3, 5),
  tut('t16', 'Ceiling Shot', 'Ceiling shot alapok.', 'Mechanics', '14:00', 4, 2),
  tut('t17', 'Flip Reset', 'Flip reset megszerzése.', 'Mechanics', '20:00', 5, 2),
  tut('t18', 'Double Tap', 'Double tap technika.', 'Mechanics', '13:00', 4, 3),
  tut('t19', 'Air Dribble', 'Air dribble kontroll.', 'Mechanics', '13:30', 4, 3),
  tut('t20', 'Musty Double Tap', 'Musty double tap kombó.', 'Mechanics', '16:00', 5, 2),
  // Defense
  tut('t21', 'Positioning Basics', 'Védekezési pozíció alapok.', 'Defense', '10:00', 1, 5),
  tut('t22', 'Shadow Defense', 'Shadow defense technika.', 'Defense', '15:00', 3, 5),
  tut('t23', 'Saving Shots', 'Védések különböző helyzetekben.', 'Defense', '12:00', 2, 5),
  // Rotation
  tut('t24', '2v2 Rotation', '2v2 rotáció alapok.', 'Rotation', '18:00', 2, 5),
  tut('t25', '3v3 Rotation', '3v3 rotáció alapok.', 'Rotation', '20:00', 2, 5),
  tut('t26', 'Advanced Rotation', 'Haladó rotációs minták.', 'Rotation', '25:00', 4, 5),
  // Boost
  tut('t27', 'Boost Management', 'Boost hatékony használata.', 'Boost', '10:00', 1, 5),
  tut('t28', 'Boost Starving', 'Ellenfél boost megvonása.', 'Boost', '12:00', 3, 4),
  tut('t29', 'Small Pad Routes', 'Kis boost útvonalak.', 'Boost', '14:00', 2, 5),
  // Kickoff
  tut('t30', 'Basic Kickoff', 'Kickoff alapok.', 'Kickoff', '8:00', 1, 5),
  tut('t31', 'Speed Flip Kickoff', 'Speed flip kickoff.', 'Kickoff', '12:00', 4, 5),
];

export const TUTORIAL_CATEGORIES = Array.from(new Set(TUTORIALS.map((t) => t.category)));
