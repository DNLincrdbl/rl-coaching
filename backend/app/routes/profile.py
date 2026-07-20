"""Current user's profile updates."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Notification
from ..utils import current_user, login_required

bp = Blueprint("profile", __name__, url_prefix="/api/profile")

RL_RANKS = {
    "Bronze I", "Bronze II", "Bronze III", "Silver I", "Silver II", "Silver III",
    "Gold I", "Gold II", "Gold III", "Platinum I", "Platinum II", "Platinum III",
    "Diamond I", "Diamond II", "Diamond III", "Champion I", "Champion II", "Champion III",
    "Grand Champion I", "Grand Champion II", "Grand Champion III", "Supersonic Legend",
}
BADGES = {"rookie", "grinder", "aerialist", "dribbler", "legend"}


@bp.patch("")
@login_required
def update_profile():
    user = current_user()
    data = request.get_json(silent=True) or {}

    if "rank" in data:
        rank = data["rank"]
        if rank is not None and rank not in RL_RANKS:
            return jsonify({"error": "Érvénytelen rang."}), 400
        user.rank = rank

    if "selectedBadge" in data:
        badge = data["selectedBadge"]
        if badge not in BADGES:
            return jsonify({"error": "Érvénytelen badge."}), 400
        user.selected_badge = badge

    if "subscriptionTier" in data:
        tier = data["subscriptionTier"]
        if tier not in {"pro", "basic"}:
            return jsonify({"error": "Érvénytelen csomag."}), 400
        user.subscription_tier = tier
        if tier == "basic":
            user.coaching_credits = 0

    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.patch("/course-progress")
@login_required
def update_course_progress():
    user = current_user()
    data = request.get_json(silent=True) or {}
    course_id = data.get("courseId")
    if not course_id:
        return jsonify({"error": "Hiányzó kurzus azonosító."}), 400
    try:
        progress = int(data.get("progress", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Érvénytelen haladás érték."}), 400
    progress = max(0, min(100, progress))

    current = dict(user.course_progress or {})
    # Progress only moves forward (watching an earlier lesson won't reset it).
    current[course_id] = max(progress, int(current.get(course_id, 0)))
    user.course_progress = current
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.post("/notifications/<int:notif_id>/read")
@login_required
def mark_read(notif_id: int):
    user = current_user()
    notif = Notification.query.filter_by(id=notif_id, user_id=user.id).first()
    if notif is None:
        return jsonify({"error": "Not found"}), 404
    notif.read = True
    db.session.commit()
    return jsonify({"ok": True})
