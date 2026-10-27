"""Profile cosmetics: avatar colors, titles, badges. Keep in sync with frontend/src/lib/data/cosmetics.ts."""
from __future__ import annotations

import re

PROFILE_COLORS = [
    {"id": "black", "hex": "#0A0A0C", "name": "Fekete", "level": 1},
    {"id": "green", "hex": "#16A34A", "name": "Zöld", "level": 2},
    {"id": "blue", "hex": "#2563EB", "name": "Kék", "level": 3},
    {"id": "red", "hex": "#DC2626", "name": "Piros", "level": 4},
    {"id": "pink", "hex": "#EC4899", "name": "Rózsaszín", "level": 5},
    {"id": "orange", "hex": "#EA580C", "name": "Narancs", "level": 6},
    {"id": "purple", "hex": "#7C3AED", "name": "Lila", "level": 7},
    {"id": "gold", "hex": "#CA8A04", "name": "Arany", "level": 8},
    {"id": "teal", "hex": "#0D9488", "name": "Türkiz", "level": 9},
    {"id": "white", "hex": "#E5E7EB", "name": "Fehér", "level": 10},
]

PROFILE_COLOR_IDS = {c["id"] for c in PROFILE_COLORS}

PROFILE_TITLES = [
    {"id": "og", "name": "OG", "kind": "founding"},
    {"id": "dribble_master", "name": "Dribble Master", "kind": "arena"},
    {"id": "aerial_master", "name": "Aerial Master", "kind": "arena"},
]

PROFILE_TITLE_IDS = {t["id"] for t in PROFILE_TITLES}

BADGES = {"rookie", "grinder", "aerialist", "dribbler", "legend"}
ARENA_BADGE_RE = re.compile(r"^(dribble|aerial)-(silver|gold|plat|master)$")

# First N RLM+ subscribers unlock the OG title.
OG_MEMBER_LIMIT = 20


def color_for_level(level: int) -> dict:
    unlocked = [c for c in PROFILE_COLORS if c["level"] <= max(1, level)]
    return unlocked[-1] if unlocked else PROFILE_COLORS[0]


def next_color_for_level(level: int) -> dict | None:
    upcoming = [c for c in PROFILE_COLORS if c["level"] == level + 1]
    return upcoming[0] if upcoming else None


def unlocked_color_ids(level: int) -> list[str]:
    return [c["id"] for c in PROFILE_COLORS if c["level"] <= max(1, level)]


def is_owned_badge(user, badge_id: str | None) -> bool:
    if not badge_id:
        return True
    if badge_id in BADGES:
        return True
    if not ARENA_BADGE_RE.match(badge_id):
        return False
    return any(isinstance(b, dict) and b.get("id") == badge_id for b in (user.arena_badges or []))
