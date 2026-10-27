"""Flask application factory for the RLM backend."""
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from .config import Config
from .extensions import db, jwt, limiter

_GENERIC_HTTP_TEXT = {
    "bad request",
    "not found",
    "unauthorized",
    "forbidden",
    "method not allowed",
    "request entity too large",
    "too many requests",
    "internal server error",
    "unsupported media type",
}


def _http_error_message(app: Flask, exc: HTTPException) -> str:
    code = exc.code or 500
    if code == 413:
        limit_mb = app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
        return f"A fájl túl nagy (max {limit_mb} MB)."
    mapped = {
        400: "Érvénytelen kérés.",
        401: "Jelentkezz be a folytatáshoz.",
        403: "Nincs jogosultságod ehhez.",
        404: "Nem található.",
        405: "Ez a művelet nem támogatott.",
        415: "Nem támogatott fájltípus.",
        429: "Túl sok kérés. Várj egy kicsit, majd próbáld újra.",
        500: "Valami elromlott a szerveren. Próbáld újra később.",
    }
    desc = (exc.description or "").strip()
    if desc and desc.lower() not in _GENERIC_HTTP_TEXT and not desc.lower().startswith("the "):
        return desc
    return mapped.get(code, desc or "Hiba történt.")


def create_app(config_class: type = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- extensions ---
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    # CORS locked to the frontend origin, with credentials (cookies) allowed.
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-TOKEN"],
        expose_headers=["Content-Type"],
    )

    # --- security response headers ---
    @app.after_request
    def set_security_headers(response):
        from flask import request
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # Uploaded videos are loaded by the frontend <video> element from a
        # different origin/port, so they must be cross-origin readable.
        if request.path.startswith("/api/coaching/videos/"):
            response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        else:
            response.headers["Cross-Origin-Resource-Policy"] = "same-site"
        return response

    # --- JSON error handlers (never return HTML to the SPA) ---
    @app.errorhandler(HTTPException)
    def http_error(exc: HTTPException):
        return jsonify({"error": _http_error_message(app, exc)}), exc.code or 500

    # --- JWT error handlers (return JSON, never redirect) ---
    @jwt.unauthorized_loader
    def _unauthorized(_reason):
        return jsonify({"error": "Jelentkezz be a folytatáshoz."}), 401

    @jwt.invalid_token_loader
    def _invalid(_reason):
        return jsonify({"error": "Érvénytelen munkamenet. Jelentkezz be újra."}), 401

    @jwt.expired_token_loader
    def _expired(_h, _p):
        return jsonify({"error": "A belépésed lejárt. Jelentkezz be újra."}), 401

    # --- blueprints ---
    from .routes.auth import bp as auth_bp
    from .routes.profile import bp as profile_bp
    from .routes.account import bp as account_bp
    from .routes.arena import bp as arena_bp
    from .routes.sheets import bp as sheets_bp
    from .routes.coaching import bp as coaching_bp
    from .routes.community import bp as community_bp
    from .routes.leaderboard import bp as leaderboard_bp
    from .routes.admin import bp as admin_bp
    from .routes.issues import bp as issues_bp
    from .routes.billing import bp as billing_bp
    from .routes.weekly import bp as weekly_bp
    from .routes.learn import bp as learn_bp

    for bp in (
        auth_bp, profile_bp, account_bp, arena_bp, sheets_bp, coaching_bp,
        community_bp, leaderboard_bp, admin_bp, issues_bp, billing_bp, weekly_bp, learn_bp,
    ):
        app.register_blueprint(bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


def _ensure_schema() -> None:
    """create_all + SQLite ALTERs for columns SQLAlchemy will not add on existing DBs."""
    from sqlalchemy import inspect, text

    db.create_all()
    inspector = inspect(db.engine)
    if "users" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("users")}
    if "arena_season" not in cols:
        db.session.execute(text("ALTER TABLE users ADD COLUMN arena_season VARCHAR(7)"))
        db.session.commit()
    if "arena_badges" not in cols:
        db.session.execute(text("ALTER TABLE users ADD COLUMN arena_badges JSON"))
        db.session.commit()
    if "weekly_week" not in cols:
        db.session.execute(text("ALTER TABLE users ADD COLUMN weekly_week VARCHAR(16)"))
        db.session.execute(text("ALTER TABLE users ADD COLUMN weekly_ids JSON"))
        db.session.execute(text("ALTER TABLE users ADD COLUMN weekly_done JSON"))
        db.session.execute(text("ALTER TABLE users ADD COLUMN weekly_reroll_used BOOLEAN DEFAULT 0"))
        db.session.commit()
    if "arena_submissions" in inspector.get_table_names():
        db.session.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_arena_pending_slot "
            "ON arena_submissions (user_id, tree, slot, month) "
            "WHERE status = 'pending'"
        ))
        db.session.commit()
    if "email_verified" not in cols:
        db.session.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1"))
        db.session.commit()
    token_cols = {
        "email_confirm_hash": "VARCHAR(64)",
        "email_confirm_expires": "DATETIME",
        "password_reset_hash": "VARCHAR(64)",
        "password_reset_expires": "DATETIME",
    }
    for name, sql_type in token_cols.items():
        if name not in cols:
            db.session.execute(text(f"ALTER TABLE users ADD COLUMN {name} {sql_type}"))
            db.session.commit()
    account_cols = {
        "username": "VARCHAR(24)",
        "pending_email": "VARCHAR(255)",
        "pending_email_hash": "VARCHAR(64)",
        "pending_email_expires": "DATETIME",
    }
    for name, sql_type in account_cols.items():
        if name not in cols:
            db.session.execute(text(f"ALTER TABLE users ADD COLUMN {name} {sql_type}"))
            db.session.commit()
    if "session_version" not in cols:
        db.session.execute(text(
            "ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0"
        ))
        db.session.commit()
    from .identity import backfill_usernames
    backfill_usernames()
    db.session.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON users (username)"
    ))
    db.session.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_pending_email "
        "ON users (pending_email) WHERE pending_email IS NOT NULL"
    ))
    db.session.commit()
    if "discord_id" not in cols:
        db.session.execute(text("ALTER TABLE users ADD COLUMN discord_id VARCHAR(40)"))
        db.session.commit()
    from .catalog import seed_defaults
    seed_defaults()
