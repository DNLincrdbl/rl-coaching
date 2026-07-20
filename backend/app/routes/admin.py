"""Admin panel API (owner = Zoli). Full visibility + replay evaluation."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import CoachingSheet, Notification, ReplaySubmission, User
from ..utils import admin_required, sanitize_ratings, sanitize_timestamps

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/stats")
@admin_required
def stats():
    return jsonify({
        "users": User.query.filter_by(role="user").count(),
        "admins": User.query.filter_by(role="admin").count(),
        "pendingSubmissions": ReplaySubmission.query.filter_by(status="pending").count(),
        "totalSheets": CoachingSheet.query.count(),
        "publishedSheets": CoachingSheet.query.filter_by(published=True).count(),
    })


@bp.get("/users")
@admin_required
def list_users():
    users = User.query.order_by(User.created_at.asc()).all()
    out = []
    for u in users:
        out.append({
            **u.to_public(),
            "email": u.email,
            "role": u.role,
            "subscriptionTier": u.subscription_tier,
            "xp": u.xp,
            "coachingCredits": u.coaching_credits,
            "extraReplayCredits": u.extra_replay_credits,
            "sheetCount": u.sheets.count(),
            "pendingSubmissions": u.submissions.filter_by(status="pending").count(),
            "createdAt": u.created_at.isoformat(),
        })
    return jsonify({"users": out})


@bp.get("/users/<int:user_id>")
@admin_required
def get_user(user_id: int):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "Felhasználó nem található."}), 404
    return jsonify({"user": user.to_profile()})


@bp.get("/submissions")
@admin_required
def list_submissions():
    status = request.args.get("status")  # optional filter
    query = ReplaySubmission.query
    if status in {"pending", "reviewed"}:
        query = query.filter_by(status=status)
    subs = query.order_by(ReplaySubmission.created_at.desc()).all()
    out = []
    for s in subs:
        item = s.to_dict()
        item["user"] = s.user.to_public()
        out.append(item)
    return jsonify({"submissions": out})


def _create_sheet(user: User, data: dict, video_filename: str | None = None) -> CoachingSheet:
    sheet = CoachingSheet(
        user_id=user.id,
        title=str(data.get("title") or "Replay Elemzés")[:200],
        # An uploaded video (from the submission) takes precedence over any URL.
        video_url="" if video_filename else str(data.get("videoUrl") or "")[:500],
        video_filename=video_filename,
        summary=str(data.get("summary") or "")[:4000],
        ratings=sanitize_ratings(data.get("ratings")),
        timestamps=sanitize_timestamps(data.get("timestamps")),
        published=False,
    )
    db.session.add(sheet)
    db.session.flush()  # get sheet.id
    return sheet


@bp.post("/submissions/<int:sub_id>/review")
@admin_required
def review_submission(sub_id: int):
    """Evaluate a submitted replay: build a coaching sheet for the user."""
    sub = ReplaySubmission.query.get(sub_id)
    if sub is None:
        return jsonify({"error": "Beküldés nem található."}), 404

    data = request.get_json(silent=True) or {}
    sheet = _create_sheet(sub.user, data, video_filename=sub.video_filename)
    sub.status = "reviewed"
    sub.sheet_id = sheet.id
    sub.reviewed_at = datetime.utcnow()
    db.session.add(Notification(
        user_id=sub.user_id,
        message="Elkészült a replay elemzésed! Nézd meg a profilodon.",
        type="success",
    ))
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict()})


@bp.post("/users/<int:user_id>/sheets")
@admin_required
def create_sheet_for_user(user_id: int):
    """Create a coaching sheet directly for a user (without a submission)."""
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "Felhasználó nem található."}), 404
    data = request.get_json(silent=True) or {}
    sheet = _create_sheet(user, data)
    db.session.add(Notification(
        user_id=user.id,
        message="Új replay elemzés érkezett a profilodra!",
        type="success",
    ))
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict()})


@bp.post("/users/<int:user_id>/grant-credit")
@admin_required
def grant_credit(user_id: int):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "Felhasználó nem található."}), 404
    data = request.get_json(silent=True) or {}
    kind = data.get("kind", "coaching")
    amount = int(data.get("amount", 1))
    if kind == "coaching":
        user.coaching_credits = max(0, user.coaching_credits + amount)
    elif kind == "extra_replay":
        user.extra_replay_credits = max(0, user.extra_replay_credits + amount)
    else:
        return jsonify({"error": "Érvénytelen kredit típus."}), 400
    db.session.commit()
    return jsonify({"user": user.to_profile()})
