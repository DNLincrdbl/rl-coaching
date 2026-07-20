"""Helper utilities: auth guards, validation, XP/arena logic."""
from __future__ import annotations

import os
import re
import uuid
from functools import wraps

from flask import current_app, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from .models import User

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
RATING_TOPICS = {"decision_making", "positioning", "mechanics", "recovery_speed", "awareness"}
RATING_COLORS = {"green", "orange", "red", "neutral"}
ARENA_TREES = {"dribble", "aerial"}


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


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user()
        if user is None:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user()
        if user is None:
            return jsonify({"error": "Unauthorized"}), 401
        if not user.is_admin:
            return jsonify({"error": "Forbidden"}), 403
        return fn(*args, **kwargs)

    return wrapper


# --- XP / level (mirrors the frontend formula) ---
def level_from_xp(xp: int) -> int:
    level = 1
    required = 100
    total = 0
    while total + required <= xp:
        total += required
        level += 1
        required = 100 + (level - 1) * 10
    return level


def arena_node_xp(node_id: str) -> int:
    """Derive XP from the node id (e.g. 'd-t3-1' -> tier 3). Server-authoritative."""
    match = re.search(r"-t(\d+)-", node_id or "")
    tier = int(match.group(1)) if match else 0
    return 100 + tier * 50


# --- video upload helpers ---
def _upload_dir() -> str:
    path = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(path, exist_ok=True)
    return path


def allowed_video(filename: str) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config["ALLOWED_VIDEO_EXTENSIONS"]


def save_video(file: FileStorage) -> str:
    """Persist an uploaded video under a random, safe filename. Returns the name."""
    ext = file.filename.rsplit(".", 1)[1].lower()
    name = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(_upload_dir(), name))
    return name


def delete_video(filename: str | None) -> None:
    if not filename:
        return
    safe = secure_filename(filename)
    if not safe:
        return
    try:
        os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], safe))
    except OSError:
        pass


# --- validation helpers ---
def valid_email(value: str) -> bool:
    return bool(value and EMAIL_RE.match(value))


def sanitize_ratings(ratings) -> list:
    out = []
    if not isinstance(ratings, list):
        return out
    for r in ratings:
        if not isinstance(r, dict):
            continue
        topic = r.get("topic")
        color = r.get("color")
        if topic in RATING_TOPICS and color in RATING_COLORS:
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
        topic = t.get("topic")
        if topic not in RATING_TOPICS:
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
