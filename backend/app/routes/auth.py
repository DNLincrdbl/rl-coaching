"""Authentication: register, login, logout, me, refresh.

Uses JWT stored in httpOnly cookies with CSRF protection.
Passwords are hashed with PBKDF2-SHA256 (werkzeug).
"""
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from ..extensions import db, limiter
from ..models import User
from ..utils import current_user, login_required, valid_email

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Password reset tokens are signed (no DB storage needed) and expire after 1 hour.
_RESET_SALT = "password-reset"
_RESET_MAX_AGE = 3600


def _reset_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=_RESET_SALT)


def _issue_tokens(response, user: User):
    identity = str(user.id)
    set_access_cookies(response, create_access_token(identity=identity))
    set_refresh_cookies(response, create_refresh_token(identity=identity))
    return response


@bp.post("/register")
@limiter.limit("10 per hour")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()

    if not valid_email(email):
        return jsonify({"error": "Érvénytelen e-mail cím."}), 400
    if len(password) < 8:
        return jsonify({"error": "A jelszó legalább 8 karakter legyen."}), 400
    if not name:
        return jsonify({"error": "A név megadása kötelező."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Ez az e-mail cím már foglalt."}), 409

    user = User(email=email, display_name=name, role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    resp = jsonify({"user": user.to_profile()})
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

    if valid_email(email):
        user = User.query.filter_by(email=email).first()
        if user is not None:
            token = _reset_serializer().dumps({"uid": user.id})
            # No email service is configured, so the token is returned directly for the demo.
            # In production this token should be emailed to the user instead.
            result["resetToken"] = token

    return jsonify(result)


@bp.post("/reset-password")
@limiter.limit("10 per hour")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    password = data.get("password") or ""

    if not token:
        return jsonify({"error": "Hiányzó visszaállítási kód."}), 400
    if len(password) < 8:
        return jsonify({"error": "A jelszó legalább 8 karakter legyen."}), 400

    try:
        payload = _reset_serializer().loads(token, max_age=_RESET_MAX_AGE)
    except SignatureExpired:
        return jsonify({"error": "A visszaállítási kód lejárt. Kérj újat."}), 400
    except BadSignature:
        return jsonify({"error": "Érvénytelen visszaállítási kód."}), 400

    user = User.query.get(payload.get("uid"))
    if user is None:
        return jsonify({"error": "Érvénytelen visszaállítási kód."}), 400

    user.set_password(password)
    db.session.commit()

    resp = jsonify({"user": user.to_profile()})
    return _issue_tokens(resp, user)


@bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user = current_user()
    if user is None:
        return jsonify({"error": "Unauthorized"}), 401
    resp = jsonify({"ok": True})
    set_access_cookies(resp, create_access_token(identity=str(user.id)))
    return resp


@bp.post("/logout")
def logout():
    resp = jsonify({"ok": True})
    unset_jwt_cookies(resp)
    return resp


@bp.get("/me")
@login_required
def me():
    return jsonify({"user": current_user().to_profile()})
