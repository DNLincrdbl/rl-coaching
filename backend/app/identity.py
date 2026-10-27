"""Account identity helpers: usernames, password policy, session version, mail links.

Security-sensitive values (role, xp, credits, subscription) are never accepted here.
"""
from __future__ import annotations

import hashlib
import re
import secrets
import unicodedata
from urllib.parse import quote

from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies

from .extensions import db
from .models import User

USERNAME_RE = re.compile(r"^[a-z0-9_]{3,24}$")
RESERVED_USERNAMES = {
    "admin",
    "administrator",
    "root",
    "support",
    "help",
    "rlm",
    "system",
    "moderator",
    "mod",
    "staff",
    "null",
    "undefined",
    "api",
    "me",
    "user",
    "coach",
}


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def frontend_link(key: str, token: str) -> str:
    origin = current_app.config.get("FRONTEND_ORIGIN", "http://localhost:3000")
    return f"{origin}/?{key}={quote(token, safe='')}"


def password_error(password: str) -> str | None:
    if not isinstance(password, str) or len(password) < 8:
        return "A jelszó legalább 8 karakter legyen."
    if len(password) > 128:
        return "A jelszó túl hosszú."
    if not any(ch.isalpha() for ch in password) or not any(ch.isdigit() for ch in password):
        return "A jelszó tartalmazzon betűt és számot is."
    return None


def clean_name(name: str) -> str | None:
    cleaned = " ".join(str(name or "").split())
    if not cleaned or any(ord(ch) < 32 for ch in cleaned):
        return None
    if len(cleaned) > 80:
        return None
    return cleaned


def normalize_username(raw: str) -> str | None:
    text = str(raw or "").strip().lower()
    if not USERNAME_RE.match(text) or text in RESERVED_USERNAMES:
        return None
    return text


def _slug(name: str) -> str:
    decomposed = unicodedata.normalize("NFKD", name or "")
    ascii_name = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    base = re.sub(r"[^a-z0-9_]", "", ascii_name.lower()).strip("_")[:20]
    if len(base) < 3:
        base = (base + "player")[:24]
    return base


def _acceptable(name: str) -> bool:
    return bool(USERNAME_RE.match(name)) and name not in RESERVED_USERNAMES


def take_username(display_name: str, used: set[str]) -> str:
    base = _slug(display_name)
    for n in range(10000):
        suffix = "" if n == 0 else str(n)
        candidate = f"{base[: 24 - len(suffix)]}{suffix}"
        if candidate in used or not _acceptable(candidate):
            continue
        used.add(candidate)
        return candidate
    fallback = f"u{secrets.token_hex(6)}"[:24]
    used.add(fallback)
    return fallback


def allocate_username(display_name: str, exclude_user_id: int | None = None) -> str:
    db.session.flush()
    rows = db.session.query(User.username).filter(User.username.isnot(None), User.username != "")
    if exclude_user_id is not None:
        rows = rows.filter(User.id != exclude_user_id)
    used = {str(name).lower() for (name,) in rows.all() if name}
    return take_username(display_name, used)


def backfill_usernames() -> None:
    missing = (
        User.query.filter((User.username.is_(None)) | (User.username == ""))
        .order_by(User.id)
        .all()
    )
    if not missing:
        return
    used = {
        str(name).lower()
        for (name,) in db.session.query(User.username).filter(User.username.isnot(None), User.username != "").all()
        if name
    }
    for user in missing:
        user.username = take_username(user.display_name or "player", used)
    db.session.commit()


def bump_session(user: User) -> None:
    user.session_version = int(user.session_version or 0) + 1


def session_claims(user: User) -> dict:
    return {"sv": int(user.session_version or 0)}


def issue_tokens(response, user: User):
    identity = str(user.id)
    claims = session_claims(user)
    set_access_cookies(response, create_access_token(identity=identity, additional_claims=claims))
    set_refresh_cookies(response, create_refresh_token(identity=identity, additional_claims=claims))
    return response


def parse_fields(data, allowed: set[str]) -> tuple[dict | None, str | None]:
    if not isinstance(data, dict):
        return None, "Érvénytelen kérés."
    if set(data) - allowed:
        return None, "Ismeretlen mező a kérésben."
    return data, None
