"""Weekly challenge pool — 5 missions per ISO week, one reroll."""
from __future__ import annotations

from datetime import datetime, timedelta

WEEKLY_COUNT = 5
BONUS_ALL_XP = 250

DEFAULT_CHALLENGES = [
    {"id": "w-kickoff", "title": "Kickoff fegyelem", "text": "Játssz 8 ranked meccset, és minden kickoffnál döntsd el előre: go / cheat / stay. Írd fel, hányszor nyerted a labdát.", "xp": 140, "credit": 0},
    {"id": "w-boost", "title": "Boost útvonal", "text": "Egy edzésben (15 perc) csak 100-as és sarok boostot szedsz, pad boost nélkül. Figyeld, hol fogy el a pad.", "xp": 120, "credit": 0},
    {"id": "w-shadow", "title": "Shadow defense", "text": "Freeplay: 10 perc shadow a labda mögött, ne előzd meg. Majd 3 meccsben tudatosan második ember maradsz.", "xp": 150, "credit": 0},
    {"id": "w-aerial", "title": "Fast aerial sorozat", "text": "Custom training: 30 sikeres fast aerial a kapuba 10 percen belül. Lassú felugrás nem számít.", "xp": 160, "credit": 0},
    {"id": "w-dribble", "title": "Földi kontroll", "text": "Vezesd a labdát a tetődön kaputól kapuig 5-ször megállás nélkül, majd flick a kapuba.", "xp": 150, "credit": 0},
    {"id": "w-rotate", "title": "Harmadik ember", "text": "5 meccsben ha te vagy a last man, ne challenge-elj 50/50-re. Írd meg, hányszor mentetted a kaput.", "xp": 140, "credit": 0},
    {"id": "w-wall", "title": "Fal read", "text": "10 wall-to-air dribble kísérlet freeplayben, utána 20 perc ranked, és keresd a falas átadásokat.", "xp": 130, "credit": 0},
    {"id": "w-recover", "title": "Half-flip recovery", "text": "Minden landolás után half-flip vagy powerslide cut. 20 perc freeplay, majd 4 meccs.", "xp": 120, "credit": 0},
    {"id": "w-demo", "title": "Demo tudatosság", "text": "Nézz vissza 2 replayt: hányszor kaptál demót, és hol voltál. Következő 5 meccsben kerüld a prediktálható vonalat.", "xp": 110, "credit": 0},
    {"id": "w-pass", "title": "Pass play", "text": "3s-ban 6 meccs: ha a párod elöl van, ne lődd a kaput — passz vagy backboard.", "xp": 150, "credit": 0},
    {"id": "w-speedflip", "title": "Speedflip kickoff", "text": "Gyakorold a speedflip kickoffot 40-szer. 70%+ eltalált labda a cél.", "xp": 170, "credit": 0},
    {"id": "w-save", "title": "Backboard save", "text": "Custom: 25 backboard save. Utána rankedben ha a labda a deszkán van, te mész.", "xp": 140, "credit": 0},
    {"id": "w-airroll", "title": "Air roll kontroll", "text": "15 perc air roll jobbra/balra freeplay, kapura lövés landolás nélkül.", "xp": 130, "credit": 0},
    {"id": "w-booststarve", "title": "Kis boost", "text": "3 meccsben soha ne vedd fel a 100-ast, csak pad. Tanuld meg a pad útvonalat.", "xp": 160, "credit": 0},
    {"id": "w-replay", "title": "Saját hiba", "text": "Nézd meg a legutóbbi vereséged 1 gólját 3-szor. Írj 3 konkrét hibát, és a következő edzésen ezekre gyújts.", "xp": 100, "credit": 0},
    {"id": "w-mechanic", "title": "Egy mechanika", "text": "Válassz EGY mechanikát (musty / breezi / ceiling shot), 20 perc csak az. Ne keverj más trükköt.", "xp": 150, "credit": 0},
    {"id": "w-comm", "title": "Kommunikáció", "text": "Ha van párod: 5 meccs quick chat fegyelem (I got it / Defending / Centering). Szólj, mielőtt mész.", "xp": 110, "credit": 0},
    {"id": "w-warmup", "title": "Melegítés", "text": "Ranked előtt 12 perc: 4 perc shooting, 4 perc recoveries, 4 perc kickoff. Ne skippeld.", "xp": 100, "credit": 0},
    {"id": "w-plusclip", "title": "Klippeld a jót", "text": "Ments el 3 jó labdádat a héten (save, pass vagy air dribble). RLM+ tagként +1 extra replay kredit jár.", "xp": 180, "credit": 1},
    {"id": "w-patience", "title": "Türelem challenge", "text": "5 meccs: ne lődd az első érintésed a kapura, ha a labda a középső zónában van. Keress 2. érintést.", "xp": 140, "credit": 0},
]

def get_challenges() -> list[dict]:
    from .catalog import load

    data = load("weekly")
    if isinstance(data, list) and data:
        return data
    return list(DEFAULT_CHALLENGES)


def challenge_by_id() -> dict[str, dict]:
    return {c["id"]: c for c in get_challenges() if isinstance(c, dict) and c.get("id")}


def current_week() -> str:
    return datetime.utcnow().strftime("%G-W%V")


def week_end_iso(week: str) -> str:
    try:
        y, w = week.split("-W")
        start = datetime.strptime(f"{y}-W{w}-1", "%G-W%V-%u")
    except ValueError:
        start = datetime.utcnow()
    end = start + timedelta(days=6, hours=23, minutes=59)
    return end.strftime("%Y-%m-%dT23:59:59")


def _djb2(s: str) -> int:
    h = 5381
    for ch in s:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return h


def pick_week(week: str, exclude_ids: set[str] | None = None, n: int = WEEKLY_COUNT) -> list[str]:
    exclude = exclude_ids or set()
    all_ch = get_challenges()
    pool = [c for c in all_ch if c.get("id") not in exclude]
    if len(pool) < n:
        pool = list(all_ch)
    pool.sort(key=lambda c: _djb2(f"{week}|{c['id']}"))
    return [c["id"] for c in pool[:n]]


def public_challenge(cid: str, done: bool) -> dict:
    c = challenge_by_id().get(cid) or {"id": cid, "title": cid, "text": "", "xp": 100, "credit": 0}
    return {**c, "done": done}
