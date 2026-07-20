"""Community: published coaching sheets ('Tanuljunk egymástól')."""
from flask import Blueprint, jsonify

from ..models import CoachingSheet, User
from ..utils import current_user, login_required

bp = Blueprint("community", __name__, url_prefix="/api/community")

# Members threshold at which the tab unlocks (mirrors the frontend concept).
UNLOCK_THRESHOLD = 20


@bp.get("/sheets")
@login_required
def published_sheets():
    sheets = (
        CoachingSheet.query.filter_by(published=True)
        .order_by(CoachingSheet.created_at.desc())
        .all()
    )
    member_count = User.query.filter_by(role="user").count()
    user = current_user()
    # Admins (Zoli) always have access, regardless of the member threshold.
    unlocked = member_count >= UNLOCK_THRESHOLD or (user is not None and user.is_admin)
    return jsonify({
        "sheets": [s.to_dict() for s in sheets],
        "memberCount": member_count,
        "unlockThreshold": UNLOCK_THRESHOLD,
        "unlocked": unlocked,
    })
