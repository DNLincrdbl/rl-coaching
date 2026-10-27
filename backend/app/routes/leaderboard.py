"""Leaderboard based on Arena Tree performance (completed nodes + XP)."""
from datetime import datetime

from flask import Blueprint, jsonify

from ..models import User
from ..utils import current_user, login_required, platform_unlocks

bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")


def _arena_level(user: User) -> int:
    progress = user.arena_progress or {}
    return len(progress.get("dribble", [])) + len(progress.get("aerial", []))


def _tie_key(user: User):
    # Earlier first arena submit ranks higher when scores tie.
    first = user.arena_first_at or datetime.max
    return first, user.created_at or datetime.max


@bp.get("")
@login_required
def leaderboard():
    user = current_user()
    unlocks = platform_unlocks(user)
    if not unlocks["leaderboardUnlocked"]:
        return jsonify({"top": [], "me": None, "unlocked": False, **unlocks})

    users = User.query.filter_by(role="user").all()
    ranked = sorted(
        users,
        key=lambda u: (-_arena_level(u), -u.xp, _tie_key(u)),
    )

    def row(u: User, position: int) -> dict:
        public = u.to_public()
        return {
            "id": u.id,
            "position": position,
            "name": public["displayName"],
            "rank": public["rank"],
            "level": public["level"],
            "arenaLevel": _arena_level(u),
            "score": u.xp,
            "badge": public["selectedBadge"],
            "arenaBadge": public.get("arenaBadge"),
            "title": public["selectedTitle"],
            "avatarColor": public["avatarColor"],
        }

    top = [row(u, i + 1) for i, u in enumerate(ranked[:10])]

    my_index = next((i for i, u in enumerate(ranked) if u.id == user.id), None)
    my_row = row(user, my_index + 1) if my_index is not None else None

    return jsonify({"top": top, "me": my_row, "unlocked": True, **unlocks})
