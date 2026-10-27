"""Helper utilities: auth guards, validation, XP, notifications."""
from __future__ import annotations

import os
import re
import hmac
import hashlib
import time
import uuid
from functools import wraps

from flask import current_app, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from sqlalchemy.orm.attributes import flag_modified
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from .extensions import db
from .models import Notification, User

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Speed & Boost Management replaces the old Recovery & Speed topic.
RATING_TOPICS = {"decision_making", "positioning", "mechanics", "speed_boost", "awareness"}
TOPIC_ALIASES = {"recovery_speed": "speed_boost"}
RATING_COLORS = {"green", "yellow", "red", "neutral"}
COLOR_ALIASES = {"orange": "yellow"}
ARENA_TREES = {"dribble", "aerial"}

COMMUNITY_UNLOCK_THRESHOLD = 15
LEADERBOARD_UNLOCK_THRESHOLD = 20
EXTRA_REPLAY_PRICE_HUF = 5990
FEEDBACK_XP = 1000


def current_user() -> User | None:
    identity = get_jwt_identity()
    if identity is None:
        return None
    return db_get_user(identity)


def db_get_user(identity):
    try:
        return User.query.get(int(identity))
    except (ValueError, TypeError):
        return None


def session_current(user: User) -> bool:
    """Access and refresh tokens carry sv. Password changes bump it and kill other sessions."""
    try:
        claimed = int(get_jwt().get("sv", 0))
    except (TypeError, ValueError):
        return False
    return claimed == int(user.session_version or 0)


def _stale_session():
    return jsonify({"error": "A jelszavad megváltozott. Jelentkezz be újra."}), 401


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user()
        if user is None:
            return jsonify({"error": "Jelentkezz be a folytatáshoz."}), 401
        if not session_current(user):
            return _stale_session()
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user()
        if user is None:
            return jsonify({"error": "Jelentkezz be a folytatáshoz."}), 401
        if not session_current(user):
            return _stale_session()
        if not user.is_admin:
            return jsonify({"error": "Nincs jogosultságod ehhez."}), 403
        return fn(*args, **kwargs)

    return wrapper


# XP: level 2 requires 700, then +100 per level (lvl3=800, lvl4=900, …).
def xp_required_for_level(level: int) -> int:
    """XP needed to go from `level` to `level + 1`."""
    return 700 + max(0, level - 1) * 100


def level_from_xp(xp: int) -> int:
    level = 1
    remaining = max(0, int(xp or 0))
    while remaining >= xp_required_for_level(level):
        remaining -= xp_required_for_level(level)
        level += 1
        if level > 200:
            break
    return level


def xp_progress(xp: int) -> tuple[int, int, int]:
    """Return (level, current_in_level, required_for_next)."""
    level = 1
    remaining = max(0, int(xp or 0))
    while remaining >= xp_required_for_level(level):
        remaining -= xp_required_for_level(level)
        level += 1
        if level > 200:
            break
    return level, remaining, xp_required_for_level(level)


def grant_xp(user: User, amount: int) -> None:
    user.xp = max(0, (user.xp or 0) + int(amount))
    user.level = level_from_xp(user.xp)


def unlock_title(user: User, title_id: str) -> None:
    titles = list(user.unlocked_titles or [])
    if title_id in titles:
        return
    titles.append(title_id)
    user.unlocked_titles = titles
    flag_modified(user, "unlocked_titles")


def ensure_arena_season(user: User) -> tuple[str, bool]:
    """Wipe monthly arena progress when the calendar month rolls over.

    Returns (month, changed) so callers only commit when something actually mutated.
    """
    from .arena_data import current_month

    month = current_month()
    progress = user.arena_progress or {}
    if user.arena_season != month:
        user.arena_season = month
        user.arena_progress = {"dribble": [], "aerial": []}
        flag_modified(user, "arena_progress")
        return month, True
    if "dribble" not in progress or "aerial" not in progress:
        user.arena_progress = {
            "dribble": list(progress.get("dribble") or []),
            "aerial": list(progress.get("aerial") or []),
        }
        flag_modified(user, "arena_progress")
        return month, True
    return month, False


def ensure_weekly_week(user: User) -> tuple[str, bool]:
    from .weekly_data import current_week, pick_week

    week = current_week()
    if user.weekly_week == week and isinstance(user.weekly_ids, list) and len(user.weekly_ids) == 5:
        return week, False
    user.weekly_week = week
    user.weekly_ids = pick_week(week)
    user.weekly_done = []
    user.weekly_reroll_used = False
    flag_modified(user, "weekly_ids")
    flag_modified(user, "weekly_done")
    return week, True


def arena_node_xp(node_id: str) -> int:
    from .arena_data import arena_xp
    return arena_xp(node_id or "")


def notify_user(user: User, message: str, ntype: str = "info", email_subject: str | None = None) -> None:
    """In-app notification + email (SMTP if configured, otherwise terminal log)."""
    from .mail import send_email

    db.session.add(Notification(user_id=user.id, message=message[:500], type=ntype))
    send_email(user.email, email_subject or "RLM értesítés", message)


def platform_unlocks(user: User | None = None) -> dict:
    member_count = User.query.filter_by(role="user").count()
    is_admin = bool(user is not None and user.is_admin)
    plus = bool(user is not None and user.is_rlm_plus)
    community_open = member_count >= COMMUNITY_UNLOCK_THRESHOLD or is_admin
    leaderboard_open = member_count >= LEADERBOARD_UNLOCK_THRESHOLD or is_admin
    return {
        "memberCount": member_count,
        "communityUnlockThreshold": COMMUNITY_UNLOCK_THRESHOLD,
        "leaderboardUnlockThreshold": LEADERBOARD_UNLOCK_THRESHOLD,
        "communityUnlocked": community_open,
        "leaderboardUnlocked": leaderboard_open,
        "isRlmPlus": plus,
        "canAccessReplayFeed": bool((plus and community_open) or is_admin),
    }


def maybe_grant_og(user: User) -> None:
    """OG title for the first 20 RLM+ members."""
    from .cosmetics import OG_MEMBER_LIMIT

    titles = list(user.unlocked_titles or [])
    if "og" in titles:
        return
    plus_count = User.query.filter(User.subscription_tier.in_(["rlm_plus", "pro"])).count()
    if plus_count <= OG_MEMBER_LIMIT:
        titles.append("og")
        user.unlocked_titles = titles
        if not user.selected_title:
            user.selected_title = "og"


def activate_tier(user: User, tier: str) -> None:
    normalized = "rlm_plus" if tier in {"rlm_plus", "pro", "rlm+"} else "rlm"
    user.subscription_tier = normalized
    if normalized == "rlm_plus":
        if user.coaching_credits < 1:
            user.coaching_credits = 1
        maybe_grant_og(user)
    else:
        user.coaching_credits = 0


# --- video upload helpers ---
VIDEO_NAME_RE = re.compile(r"^[a-f0-9]{32}\.(mp4|webm|mov|m4v|ogg|ogv)$")


def sanitize_user_text(value: str | None, max_len: int) -> str:
    raw = (value or "").replace("\x00", "")
    cleaned = "".join(ch for ch in raw if ch in "\n\r\t" or ord(ch) >= 32)
    return cleaned.strip()[:max_len]


def _upload_dir() -> str:
    path = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(path, exist_ok=True)
    return path


def allowed_video(filename: str) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config["ALLOWED_VIDEO_EXTENSIONS"]


def sniff_video_ext(file: FileStorage) -> str | None:
    """Return a trusted extension from magic bytes, or None if not a video."""
    pos = file.stream.tell()
    head = file.stream.read(16)
    file.stream.seek(pos)
    if len(head) < 8:
        return None
    if head[4:8] == b"ftyp":
        return "mp4"
    if head.startswith(b"\x1aE\xdf\xa3"):
        return "webm"
    if head.startswith(b"OggS"):
        return "ogg"
    return None


def save_video(file: FileStorage) -> str:
    """Persist an uploaded video under a random, safe filename. Returns the name."""
    sniffed = sniff_video_ext(file)
    if not sniffed:
        raise ValueError("A fájl nem tűnik érvényes videónak.")
    claimed = (file.filename or "").rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    if claimed not in current_app.config["ALLOWED_VIDEO_EXTENSIONS"]:
        raise ValueError("Nem támogatott videóformátum.")
    # Keep the claimed container if it matches the sniff family (mp4/mov/m4v share ftyp).
    if sniffed == "mp4" and claimed in {"mp4", "mov", "m4v"}:
        ext = claimed
    elif sniffed == "ogg" and claimed in {"ogg", "ogv"}:
        ext = claimed
    elif sniffed == claimed:
        ext = sniffed
    else:
        raise ValueError("A fájl kiterjesztése nem egyezik a tartalommal.")
    name = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(_upload_dir(), name))
    return name


def signed_video_path(filename: str | None) -> str | None:
    """Time-limited URL for <video src> (cross-origin, no cookies)."""
    if not filename:
        return None
    safe = secure_filename(filename)
    if not VIDEO_NAME_RE.match(safe):
        return None
    exp = int(time.time()) + 12 * 3600
    secret = current_app.config["SECRET_KEY"]
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    sig = hmac.new(secret, f"{safe}|{exp}".encode("utf-8"), hashlib.sha256).hexdigest()
    return f"/api/coaching/videos/{safe}?e={exp}&s={sig}"


def verify_video_signature(filename: str, exp: str, sig: str) -> bool:
    if not VIDEO_NAME_RE.match(filename) or not exp or not sig:
        return False
    try:
        exp_i = int(exp)
    except (TypeError, ValueError):
        return False
    if exp_i < int(time.time()):
        return False
    secret = current_app.config["SECRET_KEY"]
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    expected = hmac.new(secret, f"{filename}|{exp_i}".encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


def delete_video(filename: str | None) -> None:
    if not filename:
        return
    safe = secure_filename(filename)
    if not VIDEO_NAME_RE.match(safe):
        return
    try:
        os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], safe))
    except OSError:
        pass


def valid_email(value: str) -> bool:
    return bool(value and EMAIL_RE.match(value))


def _canon_topic(topic) -> str | None:
    if not isinstance(topic, str):
        return None
    topic = TOPIC_ALIASES.get(topic, topic)
    return topic if topic in RATING_TOPICS else None


def _canon_color(color) -> str | None:
    if not isinstance(color, str):
        return None
    color = COLOR_ALIASES.get(color, color)
    return color if color in RATING_COLORS else None


def sanitize_ratings(ratings) -> list:
    out = []
    if not isinstance(ratings, list):
        return out
    for r in ratings:
        if not isinstance(r, dict):
            continue
        topic = _canon_topic(r.get("topic"))
        color = _canon_color(r.get("color"))
        if topic and color:
            item = {"topic": topic, "color": color}
            if r.get("biggestMistake"):
                item["biggestMistake"] = str(r["biggestMistake"])[:500]
            out.append(item)
    return out


def sanitize_timestamps(timestamps) -> list:
    out = []
    if not isinstance(timestamps, list):
        return out
    for t in timestamps:
        if not isinstance(t, dict):
            continue
        topic = _canon_topic(t.get("topic"))
        if not topic:
            continue
        try:
            time_val = float(t.get("time", 0))
        except (ValueError, TypeError):
            time_val = 0.0
        out.append({
            "id": str(t.get("id") or f"ts-{len(out)}"),
            "time": max(0.0, time_val),
            "topic": topic,
            "note": str(t.get("note", ""))[:1000],
        })
    return out
