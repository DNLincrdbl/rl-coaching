"""Leaderboard based on Arena Tree performance (completed nodes + XP)."""
from flask import Blueprint, jsonify

from ..models import User
from ..utils import current_user, login_required

bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")


def _arena_level(user: User) -> int:
    progress = user.arena_progress or {}
    return len(progress.get("dribble", [])) + len(progress.get("aerial", []))


@bp.get("")
@login_required
def leaderboard():
    users = User.query.filter_by(role="user").all()
    ranked = sorted(
        users,
        key=lambda u: (_arena_level(u), u.xp),
        reverse=True,
    )

    def row(u: User, position: int) -> dict:
        return {
            "id": u.id,
            "position": position,
            "name": u.display_name,
            "rank": u.rank,
            "arenaLevel": _arena_level(u),
            "score": u.xp,
            "badge": u.selected_badge,
        }

    top = [row(u, i + 1) for i, u in enumerate(ranked[:10])]

    me = current_user()
    my_index = next((i for i, u in enumerate(ranked) if u.id == me.id), None)
    my_row = row(me, my_index + 1) if my_index is not None else None

    return jsonify({"top": top, "me": my_row})
