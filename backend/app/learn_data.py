"""Default courses and tutorials. Editable via SiteCatalog (admin CMS)."""
from __future__ import annotations

DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"


def _lessons(prefix: str, intro: str, titles: list[str]) -> list[dict]:
    out = [{"id": f"{prefix}-intro", "title": intro, "duration": "4:30", "videoUrl": DEMO_VIDEO, "isIntro": True}]
    for i, title in enumerate(titles):
        out.append({
            "id": f"{prefix}-{i + 1}",
            "title": title,
            "duration": f"{12 + i}:00",
            "videoUrl": DEMO_VIDEO,
        })
    return out


COURSES = [
    {
        "id": "bronze-plat",
        "title": "Bronze → Platinum Kurzus",
        "description": "Alapok, rotáció, pozícionálás és mechanikák kezdőknek.",
        "image": "/kurzus-bronz-plat.jpg",
        "category": "bronze-plat",
        "rankRange": "Bronze – Platinum",
        "lessons": _lessons("bp", "Kurzus bemutató — mit fogsz tanulni?", [
            "Autó irányítás alapjai", "Boost menedzsment", "Rotáció alapjai 2v2", "Rotáció alapjai 3v3",
            "Védekezés alapjai", "Támadás alapjai", "Egyszerű aerial-ök", "Első flickek",
        ]),
    },
    {
        "id": "dia-gc",
        "title": "Diamond → Grand Champion Kurzus",
        "description": "Haladó mechanikák, csapatkoordináció és játékolvasás.",
        "image": "/kurzus-dia-gc.jpg",
        "category": "dia-gc",
        "rankRange": "Diamond – GC",
        "lessons": _lessons("dg", "Kurzus bemutató — a következő szint", [
            "Haladó aerial kontroll", "Fast aerial technika", "Air roll használata", "Backboard olvasás",
            "Double tap alapok", "Flip reset bevezető", "Haladó rotáció", "Shadow defense",
        ]),
    },
    {
        "id": "gc2-ssl",
        "title": "Grand Champion 2 → SSL Kurzus",
        "description": "Pro szintű mechanikák, játékelemzés és versenyfelkészülés.",
        "image": "/kurzus-gc2-ssl.jpg",
        "category": "gc2-ssl",
        "rankRange": "GC2 – SSL",
        "lessons": _lessons("gs", "Kurzus bemutató — a csúcsra", [
            "Pro szintű air roll", "Ceiling shots mastery", "Reset variációk", "Musty és breezi",
            "Team play koordináció", "Replay elemzés módszertan", "Mentális felkészülés meccsre", "Verseny stratégiák",
        ]),
    },
    {
        "id": "mental",
        "title": "Mentál Kurzus",
        "description": "Tilt kezelés, koncentráció és versenyhelyzetek.",
        "image": "/kurzus-mentál.jpg",
        "category": "mental",
        "rankRange": "Minden rang",
        "lessons": _lessons("m", "Kurzus bemutató — a fejben dől el", [
            "Mi a tilt és honnan jön?", "Tilt megelőzése", "Tilt kezelése játék közben", "Koncentráció fejlesztés",
            "Versenyhelyzetek kezelése", "Teammate kommunikáció", "Célok kitűzése", "Hosszútávú fejlődés",
        ]),
    },
]

TUTORIALS = [
    {"id": "t1", "title": "Basic Aerial", "description": "Aerial alapok és időzítés.", "category": "Aerial", "duration": "8:30", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t2", "title": "Fast Aerial", "description": "Gyors felszállás technikája.", "category": "Aerial", "duration": "10:15", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t3", "title": "Air Roll Aerial", "description": "Air roll használata aerial közben.", "category": "Aerial", "duration": "12:00", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t4", "title": "Double Jump Aerial", "description": "Dupla ugrás optimalizálás.", "category": "Aerial", "duration": "9:45", "difficulty": 2, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t5", "title": "Wall Hit Basics", "description": "Fal menti labdakezelés.", "category": "Wall Play", "duration": "7:20", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t6", "title": "Wall to Air Dribble", "description": "Falról air dribble indítás.", "category": "Wall Play", "duration": "14:30", "difficulty": 4, "ranked": 2, "videoUrl": DEMO_VIDEO},
    {"id": "t7", "title": "Wall Shot Accuracy", "description": "Pontos lövések falról.", "category": "Wall Play", "duration": "11:00", "difficulty": 2, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t8", "title": "Ground Dribble", "description": "Földi labdavezetés alapjai.", "category": "Dribbling", "duration": "10:00", "difficulty": 2, "ranked": 3, "videoUrl": DEMO_VIDEO},
    {"id": "t9", "title": "Flicks", "description": "Front, side és 45 fokos flick.", "category": "Dribbling", "duration": "12:30", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t10", "title": "45 Degree Flick", "description": "45 fokos flick technika.", "category": "Dribbling", "duration": "8:45", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t11", "title": "Musty Flick", "description": "Musty flick lépésről lépésre.", "category": "Dribbling", "duration": "15:00", "difficulty": 4, "ranked": 3, "videoUrl": DEMO_VIDEO},
    {"id": "t12", "title": "Breezi Flick", "description": "Breezi flick tutorial.", "category": "Dribbling", "duration": "18:00", "difficulty": 5, "ranked": 2, "videoUrl": DEMO_VIDEO},
    {"id": "t13", "title": "Half Flip", "description": "Half flip megtanulása.", "category": "Mechanics", "duration": "6:00", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t14", "title": "Wave Dash", "description": "Wave dash használata.", "category": "Mechanics", "duration": "8:00", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t15", "title": "Speed Flip", "description": "Speed flip technika.", "category": "Mechanics", "duration": "12:00", "difficulty": 3, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t16", "title": "Ceiling Shot", "description": "Ceiling shot alapok.", "category": "Mechanics", "duration": "14:00", "difficulty": 4, "ranked": 2, "videoUrl": DEMO_VIDEO},
    {"id": "t17", "title": "Flip Reset", "description": "Flip reset megszerzése.", "category": "Mechanics", "duration": "20:00", "difficulty": 5, "ranked": 2, "videoUrl": DEMO_VIDEO},
    {"id": "t18", "title": "Double Tap", "description": "Double tap technika.", "category": "Mechanics", "duration": "13:00", "difficulty": 4, "ranked": 3, "videoUrl": DEMO_VIDEO},
    {"id": "t19", "title": "Air Dribble", "description": "Air dribble kontroll.", "category": "Mechanics", "duration": "13:30", "difficulty": 4, "ranked": 3, "videoUrl": DEMO_VIDEO},
    {"id": "t20", "title": "Musty Double Tap", "description": "Musty double tap kombó.", "category": "Mechanics", "duration": "16:00", "difficulty": 5, "ranked": 2, "videoUrl": DEMO_VIDEO},
    {"id": "t21", "title": "Positioning Basics", "description": "Védekezési pozíció alapok.", "category": "Defense", "duration": "10:00", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t22", "title": "Shadow Defense", "description": "Shadow defense technika.", "category": "Defense", "duration": "15:00", "difficulty": 3, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t23", "title": "Saving Shots", "description": "Védések különböző helyzetekben.", "category": "Defense", "duration": "12:00", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t24", "title": "2v2 Rotation", "description": "2v2 rotáció alapok.", "category": "Rotation", "duration": "18:00", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t25", "title": "3v3 Rotation", "description": "3v3 rotáció alapok.", "category": "Rotation", "duration": "20:00", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t26", "title": "Advanced Rotation", "description": "Haladó rotációs minták.", "category": "Rotation", "duration": "25:00", "difficulty": 4, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t27", "title": "Boost Management", "description": "Boost hatékony használata.", "category": "Boost", "duration": "10:00", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t28", "title": "Boost Starving", "description": "Ellenfél boost megvonása.", "category": "Boost", "duration": "12:00", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t29", "title": "Small Pad Routes", "description": "Kis boost útvonalak.", "category": "Boost", "duration": "14:00", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t30", "title": "Basic Kickoff", "description": "Kickoff alapok.", "category": "Kickoff", "duration": "8:00", "difficulty": 1, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t31", "title": "Speed Flip Kickoff", "description": "Speed flip kickoff.", "category": "Kickoff", "duration": "12:00", "difficulty": 4, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t32", "title": "Fake Kickoff", "description": "Fake kickoff időzítés.", "category": "Kickoff", "duration": "9:30", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t33", "title": "Demo Awareness", "description": "Demók olvasása és elkerülése.", "category": "Defense", "duration": "11:00", "difficulty": 3, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t34", "title": "Boost Steal Routes", "description": "Boost lopás 2v2-ben.", "category": "Boost", "duration": "10:45", "difficulty": 3, "ranked": 4, "videoUrl": DEMO_VIDEO},
    {"id": "t35", "title": "Recovery After 50", "description": "Gyors recovery 50/50 után.", "category": "Mechanics", "duration": "8:20", "difficulty": 2, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t36", "title": "Backboard Defense", "description": "Backboard védések időzítése.", "category": "Defense", "duration": "13:10", "difficulty": 3, "ranked": 5, "videoUrl": DEMO_VIDEO},
    {"id": "t37", "title": "Air Roll Shot", "description": "Air roll lövés kontroll.", "category": "Aerial", "duration": "14:40", "difficulty": 4, "ranked": 3, "videoUrl": DEMO_VIDEO},
]


def default_learn() -> dict:
    return {"courses": COURSES, "tutorials": TUTORIALS}
