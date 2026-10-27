"""Authentication: register, login, logout, me, refresh, email confirm, Discord OAuth."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, redirect, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from sqlalchemy.exc import IntegrityError

from ..email_templates import render_letter
from ..extensions import db, limiter
from ..identity import (
    allocate_username,
    bump_session,
    clean_name,
    frontend_link,
    issue_tokens,
    password_error,
    token_digest,
)
from ..models import User
from ..mail import send_email
from ..utils import current_user, ensure_arena_season, login_required, session_current, valid_email

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

_CONFIRM_TTL = timedelta(days=3)
_RESET_TTL = timedelta(hours=1)
_DISCORD_SALT = "discord-oauth"
_DISCORD_MAX_AGE = 600


def _discord_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=_DISCORD_SALT)


def _frontend_origin() -> str:
    return current_app.config.get("FRONTEND_ORIGIN", "http://localhost:3000")


def _digest(token: str) -> str:
    return token_digest(token)


def _action_link(key: str, token: str) -> str:
    return frontend_link(key, token)


def _send_confirm_email(user: User) -> bool:
    token = secrets.token_urlsafe(32)
    user.email_confirm_hash = _digest(token)
    user.email_confirm_expires = datetime.utcnow() + _CONFIRM_TTL
    db.session.add(user)
    db.session.commit()
    link = _action_link("confirm", token)
    plain, html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="Erősítsd meg a fiókod.",
        paragraphs=[
            f"Szia {user.display_name}!",
            "A regisztrációd megérkezett. Egy kattintás, és a fiókod a tiéd — a link 3 napig él.",
        ],
        button_label="Megerősítem",
        button_url=link,
        footnote="Ha nem te regisztráltál, hagyd figyelmen kívül ezt a levelet.",
    )
    return send_email(user.email, "RLM — erősítsd meg az e-mail címed", plain, html)


def _send_reset_email(user: User) -> bool:
    token = secrets.token_urlsafe(32)
    user.password_reset_hash = _digest(token)
    user.password_reset_expires = datetime.utcnow() + _RESET_TTL
    db.session.commit()
    link = _action_link("reset", token)
    plain, html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="Új jelszó.",
        paragraphs=[
            f"Szia {user.display_name}!",
            "Jelszó-visszaállítást kértél. A link egy órán át érvényes, és csak egyszer használható.",
        ],
        button_label="Új jelszó megadása",
        button_url=link,
        footnote="Ha nem te kérted, hagyd figyelmen kívül. A régi jelszavad addig működik, amíg ezt nem használod.",
    )
    return send_email(user.email, "RLM — jelszó visszaállítás", plain, html)


def _issue_tokens(response, user: User):
    return issue_tokens(response, user)


@bp.post("/register")
@limiter.limit("10 per hour")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = clean_name(data.get("name") or "")

    if not valid_email(email) or len(email) > 254:
        return jsonify({"error": "Érvénytelen e-mail cím."}), 400
    policy = password_error(password)
    if policy:
        return jsonify({"error": policy}), 400
    if name is None:
        return jsonify({"error": "A név 1–80 karakter legyen."}), 400
    if password.lower() == email.lower() or password.lower() == name.lower():
        return jsonify({"error": "A jelszó ne egyezzen a neveddel vagy az e-mail címeddel."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409

    user = User(email=email, display_name=name, role="user", email_verified=False)
    user.set_password(password)
    user.username = allocate_username(name)
    try:
        sent = _send_confirm_email(user)
    except IntegrityError:
        db.session.rollback()
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409
        return jsonify({"error": "A fiókot most nem sikerült létrehozni. Próbáld újra."}), 409
    body = {"user": user.to_profile(), "emailSent": sent}
    resp = jsonify(body)
    return _issue_tokens(resp, user), 201


@bp.post("/login")
@limiter.limit("15 per 5 minutes")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        # Same message for both cases to avoid user enumeration.
        return jsonify({"error": "Hibás e-mail cím vagy jelszó."}), 401

    resp = jsonify({"user": user.to_profile()})
    return _issue_tokens(resp, user)


@bp.post("/forgot-password")
@limiter.limit("5 per 15 minutes")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    # Generic response regardless of whether the email exists (avoid enumeration).
    result = {
        "message": "Ha létezik fiók ezzel az e-mail címmel, elküldtük a jelszó-visszaállítási linket.",
    }

    if valid_email(email) and len(email) <= 254:
        user = User.query.filter_by(email=email).first()
        if user is not None:
            _send_reset_email(user)

    return jsonify(result)


@bp.post("/reset-password")
@limiter.limit("10 per hour")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    password = data.get("password") or ""

    if not token or len(token) > 200:
        return jsonify({"error": "Hiányzó visszaállítási kód."}), 400
    policy = password_error(password)
    if policy:
        return jsonify({"error": policy}), 400

    user = User.query.filter_by(password_reset_hash=_digest(token)).first()
    if user is None:
        return jsonify({"error": "Érvénytelen vagy már felhasznált visszaállítási kód."}), 400
    if user.password_reset_expires is None or user.password_reset_expires < datetime.utcnow():
        user.password_reset_hash = None
        user.password_reset_expires = None
        db.session.commit()
        return jsonify({"error": "A visszaállítási kód lejárt. Kérj újat."}), 400
    if password.lower() == user.email.lower() or password.lower() == (user.display_name or "").lower():
        return jsonify({"error": "A jelszó ne egyezzen a neveddel vagy az e-mail címeddel."}), 400

    user.set_password(password)
    user.password_reset_hash = None
    user.password_reset_expires = None
    bump_session(user)
    db.session.commit()

    resp = jsonify({"user": user.to_profile()})
    return _issue_tokens(resp, user)


@bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user = current_user()
    if user is None or not session_current(user):
        resp = jsonify({"error": "A jelszavad megváltozott. Jelentkezz be újra."})
        unset_jwt_cookies(resp)
        return resp, 401
    resp = jsonify({"ok": True})
    set_access_cookies(
        resp,
        create_access_token(identity=str(user.id), additional_claims={"sv": int(user.session_version or 0)}),
    )
    return resp


@bp.post("/logout")
def logout():
    resp = jsonify({"ok": True})
    unset_jwt_cookies(resp)
    return resp


@bp.get("/me")
@login_required
def me():
    user = current_user()
    month, changed = ensure_arena_season(user)
    if changed:
        db.session.commit()
    return jsonify({"user": user.to_profile()})


def _apply_confirm_token(token: str) -> tuple[User | None, str | None]:
    if not token or len(token) > 200:
        return None, "Hiányzó megerősítő kód."
    user = User.query.filter_by(email_confirm_hash=_digest(token)).first()
    if user is None:
        return None, "Érvénytelen vagy már felhasznált megerősítő link."
    if user.email_confirm_expires is None or user.email_confirm_expires < datetime.utcnow():
        user.email_confirm_hash = None
        user.email_confirm_expires = None
        db.session.commit()
        return None, "A megerősítő link lejárt. Kérj újat."
    user.email_verified = True
    user.email_confirm_hash = None
    user.email_confirm_expires = None
    db.session.commit()
    return user, None


@bp.post("/confirm-email")
@limiter.limit("20 per hour")
def confirm_email():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or request.args.get("token") or "").strip()
    user, err = _apply_confirm_token(token)
    if err:
        return jsonify({"error": err}), 400
    resp = jsonify({"user": user.to_profile(), "ok": True})
    return _issue_tokens(resp, user)


@bp.get("/confirm-email")
@limiter.limit("20 per hour")
def confirm_email_redirect():
    token = (request.args.get("token") or "").strip()
    origin = _frontend_origin()
    user, err = _apply_confirm_token(token)
    if err:
        return redirect(f"{origin}/?confirm=error")
    resp = redirect(f"{origin}/dashboard?confirmed=1")
    return _issue_tokens(resp, user)


@bp.post("/resend-confirmation")
@login_required
@limiter.limit("5 per 15 minutes")
def resend_confirmation():
    user = current_user()
    if user.email_verified:
        return jsonify({"ok": True, "message": "Az e-mail címed már meg van erősítve."})
    sent = _send_confirm_email(user)
    if not sent:
        return jsonify({"error": "A megerősítő levelet most nem sikerült elküldeni. Próbáld újra."}), 503
    return jsonify({"ok": True, "message": "Elküldtük a megerősítő levelet. Nézd meg a postaládád."})


def _discord_configured() -> bool:
    cfg = current_app.config
    return bool(cfg.get("DISCORD_CLIENT_ID") and cfg.get("DISCORD_CLIENT_SECRET"))


@bp.get("/discord/status")
def discord_status():
    return jsonify({"configured": _discord_configured()})


@bp.get("/discord/start")
@login_required
def discord_start():
    if not _discord_configured():
        return jsonify({
            "configured": False,
            "error": "A Discord OAuth nincs beállítva. Add meg a felhasználóneved kézzel, vagy töltsd ki a DISCORD_CLIENT_ID-t a .env-ben.",
        }), 400
    state = _discord_serializer().dumps({"uid": current_user().id})
    params = {
        "client_id": current_app.config["DISCORD_CLIENT_ID"],
        "redirect_uri": current_app.config["DISCORD_REDIRECT_URI"],
        "response_type": "code",
        "scope": "identify",
        "state": state,
        "prompt": "consent",
    }
    import urllib.parse
    url = "https://discord.com/api/oauth2/authorize?" + urllib.parse.urlencode(params)
    return jsonify({"url": url, "configured": True})


@bp.get("/discord/callback")
def discord_callback():
    origin = _frontend_origin()
    err = request.args.get("error")
    if err:
        return redirect(f"{origin}/dashboard?discord=error")
    code = (request.args.get("code") or "").strip()
    state = (request.args.get("state") or "").strip()
    if not code or not state:
        return redirect(f"{origin}/dashboard?discord=error")
    try:
        payload = _discord_serializer().loads(state, max_age=_DISCORD_MAX_AGE)
    except (SignatureExpired, BadSignature):
        return redirect(f"{origin}/dashboard?discord=error")
    user = User.query.get(payload.get("uid"))
    if user is None:
        return redirect(f"{origin}/dashboard?discord=error")
    try:
        info = _exchange_discord_code(code)
    except Exception:
        current_app.logger.exception("Discord OAuth failed")
        return redirect(f"{origin}/dashboard?discord=error")
    discord_id = str(info.get("id") or "")
    username = (info.get("global_name") or info.get("username") or "").strip()[:80]
    if not discord_id:
        return redirect(f"{origin}/dashboard?discord=error")
    taken = User.query.filter(User.discord_id == discord_id, User.id != user.id).first()
    if taken is not None:
        return redirect(f"{origin}/dashboard?discord=taken")
    user.discord_id = discord_id
    if username:
        user.discord_username = username
    db.session.commit()
    return redirect(f"{origin}/dashboard?discord=ok")


def _exchange_discord_code(code: str) -> dict:
    import json
    import urllib.parse
    import urllib.request

    cfg = current_app.config
    body = urllib.parse.urlencode({
        "client_id": cfg["DISCORD_CLIENT_ID"],
        "client_secret": cfg["DISCORD_CLIENT_SECRET"],
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": cfg["DISCORD_REDIRECT_URI"],
    }).encode()
    token_req = urllib.request.Request(
        "https://discord.com/api/oauth2/token",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(token_req, timeout=20) as resp:
        token_data = json.loads(resp.read().decode())
    access = token_data.get("access_token")
    if not access:
        raise RuntimeError("no access token")
    me_req = urllib.request.Request(
        "https://discord.com/api/users/@me",
        headers={"Authorization": f"Bearer {access}"},
    )
    with urllib.request.urlopen(me_req, timeout=20) as resp:
        return json.loads(resp.read().decode())

