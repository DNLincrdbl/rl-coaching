"""Flask application factory for the RLM backend."""
from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt, limiter


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

    # --- JSON error handlers ---
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(413)
    def payload_too_large(_):
        limit_mb = app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
        return jsonify({"error": f"A fájl túl nagy (max {limit_mb} MB)."}), 413

    @app.errorhandler(429)
    def rate_limited(_):
        return jsonify({"error": "Too many requests, please slow down."}), 429

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"error": "Internal server error"}), 500

    # --- JWT error handlers (return JSON, never redirect) ---
    @jwt.unauthorized_loader
    def _unauthorized(_reason):
        return jsonify({"error": "Missing or invalid credentials"}), 401

    @jwt.invalid_token_loader
    def _invalid(_reason):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.expired_token_loader
    def _expired(_h, _p):
        return jsonify({"error": "Token expired"}), 401

    # --- blueprints ---
    from .routes.auth import bp as auth_bp
    from .routes.profile import bp as profile_bp
    from .routes.arena import bp as arena_bp
    from .routes.sheets import bp as sheets_bp
    from .routes.coaching import bp as coaching_bp
    from .routes.community import bp as community_bp
    from .routes.leaderboard import bp as leaderboard_bp
    from .routes.admin import bp as admin_bp

    for bp in (auth_bp, profile_bp, arena_bp, sheets_bp, coaching_bp, community_bp, leaderboard_bp, admin_bp):
        app.register_blueprint(bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app
