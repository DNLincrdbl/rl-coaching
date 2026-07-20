"""Application configuration.

Values come from environment variables (loaded from a local .env in
development). Safe development defaults are provided so the app runs
out-of-the-box, but production MUST override the secrets.
"""
import os
from datetime import timedelta

from dotenv import load_dotenv

# Load backend/.env if present.
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


def _bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    # --- Core secrets ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-jwt-secret-change-me")

    # --- Database ---
    _db_url = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'prisma', 'rlm.db')}")
    # Default to an sqlite file inside backend/ if a bare sqlite url is given.
    if _db_url == "sqlite:///rlm.db":
        _db_url = f"sqlite:///{os.path.join(BASE_DIR, 'rlm.db')}"
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Replay video uploads ---
    # Uploaded replay videos are stored on disk and served back through the API.
    _upload = os.environ.get("UPLOAD_FOLDER", "uploads")
    UPLOAD_FOLDER = _upload if os.path.isabs(_upload) else os.path.join(BASE_DIR, _upload)
    # Max upload size (default 200 MB) — short gameplay clips.
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_UPLOAD_MB", "200")) * 1024 * 1024
    ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "m4v", "ogg", "ogv"}

    # --- JWT (stored in httpOnly cookies) ---
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = _bool(os.environ.get("COOKIE_SECURE"), False)
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ACCESS_COOKIE_PATH = "/"
    JWT_REFRESH_COOKIE_PATH = "/api/auth/refresh"

    # --- CORS ---
    # Comma-separated list of allowed frontend origins. Defaults cover the two
    # common local hosts so the app works whether opened via localhost or 127.0.0.1.
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
    CORS_ORIGINS = [
        o.strip()
        for o in os.environ.get(
            "FRONTEND_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if o.strip()
    ]

    # --- Seed admin ---
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "zoli@rlm.hu")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin1234!")
    ADMIN_NAME = os.environ.get("ADMIN_NAME", "JusTZoly")
