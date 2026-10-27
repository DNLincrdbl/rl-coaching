"""Signed-in account settings: name, username, email change, password change.

The authenticated user is taken from the session. The body cannot set role,
subscription, xp, credits, or another user's id.
"""
from __future__ import annotations

from datetime import datetime, timedelta

import secrets

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy.exc import IntegrityError

from ..email_templates import render_letter
from ..extensions import db, limiter
from ..identity import (
    bump_session,
    clean_name,
    frontend_link,
    issue_tokens,
    normalize_username,
    parse_fields,
    password_error,
    token_digest,
)
from ..mail import send_email
from ..models import Notification, User
from ..utils import current_user, login_required, session_current, valid_email

bp = Blueprint("account", __name__, url_prefix="/api/account")

_EMAIL_CHANGE_TTL = timedelta(hours=24)


def _account_key() -> str:
    return f"account:{get_jwt_identity() or 'anon'}"


def _optional_actor() -> User | None:
    try:
        verify_jwt_in_request(optional=True)
    except Exception as exc:
        current_app.logger.info("Email confirm without session: %s", exc.__class__.__name__)
        return None
    user = current_user()
    if user is None or not session_current(user):
        return None
    return user


def _email_taken(email: str, user_id: int) -> bool:
    other = User.query.filter(User.email == email, User.id != user_id).first()
    if other is not None:
        return True
    pending = User.query.filter(User.pending_email == email, User.id != user_id).first()
    return pending is not None


@bp.patch("/identity")
@login_required
@limiter.limit("40 per hour")
@limiter.limit("20 per hour", key_func=_account_key)
def update_identity():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), {"displayName", "username"})
    if err:
        return jsonify({"error": err}), 400
    if not data:
        return jsonify({"error": "Nincs módosítható mező."}), 400

    new_name = user.display_name
    new_username = user.username or ""
    if "displayName" in data:
        cleaned = clean_name(data.get("displayName") or "")
        if cleaned is None:
            return jsonify({"error": "A név 1–80 karakter legyen."}), 400
        new_name = cleaned
    if "username" in data:
        parsed = normalize_username(data.get("username") or "")
        if parsed is None:
            return jsonify({"error": "A felhasználónév 3–24 karakter, csak kisbetű, szám és aláhúzás."}), 400
        new_username = parsed

    if new_username != (user.username or ""):
        taken = User.query.filter(User.username == new_username, User.id != user.id).first()
        if taken is not None:
            return jsonify({"error": "Ez a felhasználónév már foglalt."}), 409

    user.display_name = new_name
    if "username" in data:
        user.username = new_username
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Ez a felhasználónév már foglalt."}), 409
    return jsonify({"user": user.to_profile()})


@bp.post("/email")
@login_required
@limiter.limit("10 per hour")
@limiter.limit("5 per hour", key_func=_account_key)
def request_email_change():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), {"email", "currentPassword"})
    if err:
        return jsonify({"error": err}), 400

    current_password = data.get("currentPassword") or ""
    if not isinstance(current_password, str) or not current_password:
        return jsonify({"error": "Add meg a jelenlegi jelszavad."}), 400
    if not user.check_password(current_password):
        return jsonify({"error": "A jelenlegi jelszó hibás."}), 400

    email = str(data.get("email") or "").strip().lower()
    if not valid_email(email) or len(email) > 254:
        return jsonify({"error": "Érvénytelen e-mail cím."}), 400
    if email == user.email:
        return jsonify({"error": "Ez már a jelenlegi e-mail címed."}), 400
    if _email_taken(email, user.id):
        return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409

    token = secrets.token_urlsafe(32)
    user.pending_email = email
    user.pending_email_hash = token_digest(token)
    user.pending_email_expires = datetime.utcnow() + _EMAIL_CHANGE_TTL
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409

    link = frontend_link("emailChange", token)
    plain, html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="Új e-mail cím.",
        paragraphs=[
            f"Szia {user.display_name}!",
            f"A fiókod új címe ez lesz: {email}. A link 24 óráig él, és csak egyszer használható. A régi cím addig működik, amíg meg nem erősíted.",
        ],
        button_label="Megerősítem az új címet",
        button_url=link,
        footnote="Ha nem te kérted, hagyd figyelmen kívül. A belépés a régi címmel megy, amíg ezt a linket meg nem nyitod.",
    )
    sent = send_email(email, "RLM — erősítsd meg az új e-mail címed", plain, html)

    notice, notice_html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="E-mail cím változtatás.",
        paragraphs=[
            f"Szia {user.display_name}!",
            f"A fiókodhoz új címet kértek: {email}. Ha te voltál, a megerősítő levél az új címre ment. Ha nem, lépj be és változtasd meg a jelszavad.",
        ],
        footnote="A régi címeddel addig be tudsz lépni, amíg az új címet meg nem erősítik.",
    )
    send_email(user.email, "RLM — e-mail cím változtatást kértek", notice, notice_html)

    message = (
        "Megerősítő levelet küldtünk az új címre. A jelenlegi címed addig él, amíg meg nem nyitod a linket."
        if sent
        else "A címváltást rögzítettük, de a levelet most nem sikerült elküldeni. Próbáld újra."
    )
    return jsonify({
        "user": user.to_profile(),
        "emailSent": sent,
        "pendingEmail": user.pending_email,
        "message": message,
    })


@bp.post("/email/cancel")
@login_required
@limiter.limit("20 per hour")
@limiter.limit("10 per hour", key_func=_account_key)
def cancel_email_change():
    user = current_user()
    raw = request.get_json(silent=True)
    data, err = parse_fields({} if raw is None else raw, set())
    if err:
        return jsonify({"error": err}), 400
    user.pending_email = None
    user.pending_email_hash = None
    user.pending_email_expires = None
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.post("/email/confirm")
@limiter.limit("20 per hour")
def confirm_email_change():
    data, err = parse_fields(request.get_json(silent=True), {"token"})
    if err:
        return jsonify({"error": err}), 400
    token = str(data.get("token") or "").strip()
    if not token or len(token) > 200:
        return jsonify({"error": "Hiányzó megerősítő kód."}), 400

    digest = token_digest(token)
    user = User.query.filter_by(pending_email_hash=digest).first()
    if user is None:
        return jsonify({"error": "Érvénytelen vagy már felhasznált megerősítő link."}), 400
    if user.pending_email_expires is None or user.pending_email_expires < datetime.utcnow():
        user.pending_email = None
        user.pending_email_hash = None
        user.pending_email_expires = None
        db.session.commit()
        return jsonify({"error": "A megerősítő link lejárt. Kérj újat a beállításokban."}), 400

    new_email = (user.pending_email or "").strip().lower()
    if not valid_email(new_email):
        return jsonify({"error": "Érvénytelen e-mail cím."}), 400

    actor = _optional_actor()
    if actor is not None and actor.id != user.id:
        return jsonify({"error": "Ez a link nem a bejelentkezett fiókodhoz tartozik."}), 400

    old_email = user.email
    user_id = user.id
    try:
        rows = User.query.filter(
            User.id == user_id,
            User.pending_email_hash == digest,
        ).update(
            {
                User.email: new_email,
                User.email_verified: True,
                User.pending_email: None,
                User.pending_email_hash: None,
                User.pending_email_expires: None,
                User.password_reset_hash: None,
                User.password_reset_expires: None,
                User.email_confirm_hash: None,
                User.email_confirm_expires: None,
            },
            synchronize_session=False,
        )
        if rows != 1:
            db.session.rollback()
            return jsonify({"error": "Érvénytelen vagy már felhasznált megerősítő link."}), 400
        db.session.commit()
        db.session.expire_all()
    except IntegrityError:
        db.session.rollback()
        owner = User.query.get(user_id)
        if owner is not None:
            owner.pending_email = None
            owner.pending_email_hash = None
            owner.pending_email_expires = None
            db.session.commit()
        return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409

    fresh = User.query.get(user_id)
    db.session.add(Notification(
        user_id=user_id,
        message="Az e-mail címed megváltozott.",
        type="success",
    ))
    db.session.commit()

    plain, html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="Az e-mail címed megváltozott.",
        paragraphs=[
            f"A fiókod új címe: {new_email}.",
            "Ha nem te erősítetted meg, lépj be a régi jelszóval és kérj jelszó-visszaállítást.",
        ],
    )
    send_email(old_email, "RLM — az e-mail címed megváltozott", plain, html)

    if actor is not None and actor.id == user_id and fresh is not None:
        return jsonify({"user": fresh.to_profile(), "ok": True})
    return jsonify({
        "ok": True,
        "message": "Az új e-mail cím megerősítve. Mostantól ezzel lépsz be.",
    })


@bp.post("/password")
@login_required
@limiter.limit("10 per hour")
@limiter.limit("5 per hour", key_func=_account_key)
def change_password():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), {"currentPassword", "newPassword"})
    if err:
        return jsonify({"error": err}), 400

    current_password = data.get("currentPassword") or ""
    new_password = data.get("newPassword") or ""
    if not isinstance(current_password, str) or not current_password:
        return jsonify({"error": "Add meg a jelenlegi jelszavad."}), 400
    if not user.check_password(current_password):
        return jsonify({"error": "A jelenlegi jelszó hibás."}), 400

    policy = password_error(new_password)
    if policy:
        return jsonify({"error": policy}), 400
    if user.check_password(new_password):
        return jsonify({"error": "Az új jelszó ne egyezzen a jelenlegivel."}), 400
    lowered = new_password.lower()
    if lowered in {
        user.email.lower(),
        (user.display_name or "").lower(),
        (user.username or "").lower(),
    }:
        return jsonify({"error": "A jelszó ne egyezzen a neveddel, a felhasználóneveddel vagy az e-mail címeddel."}), 400

    user.set_password(new_password)
    user.password_reset_hash = None
    user.password_reset_expires = None
    bump_session(user)
    db.session.commit()

    plain, html = render_letter(
        eyebrow="Rocket League Mesterfokon",
        headline="Új jelszó.",
        paragraphs=[
            f"Szia {user.display_name}!",
            "A jelszavad megváltozott. A többi eszközön újra be kell lépned. Ha nem te voltál, kérj jelszó-visszaállítást.",
        ],
    )
    send_email(user.email, "RLM — a jelszavad megváltozott", plain, html)

    resp = jsonify({"user": user.to_profile()})
    return issue_tokens(resp, user)
