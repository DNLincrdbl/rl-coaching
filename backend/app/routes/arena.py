"""Arena Tree progress. XP is computed server-side from the node id."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..utils import ARENA_TREES, arena_node_xp, current_user, level_from_xp, login_required

bp = Blueprint("arena", __name__, url_prefix="/api/arena")


@bp.post("/complete")
@login_required
def complete_node():
    user = current_user()
    data = request.get_json(silent=True) or {}
    tree = data.get("tree")
    node_id = data.get("nodeId")

    if tree not in ARENA_TREES or not node_id:
        return jsonify({"error": "Érvénytelen kérés."}), 400

    progress = dict(user.arena_progress or {"dribble": [], "aerial": []})
    completed = list(progress.get(tree, []))
    if node_id in completed:
        return jsonify({"user": user.to_profile()})  # idempotent

    completed.append(node_id)
    progress[tree] = completed
    user.arena_progress = progress
    user.xp += arena_node_xp(node_id)
    user.level = level_from_xp(user.xp)
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.post("/reset")
@login_required
def reset_tree():
    user = current_user()
    data = request.get_json(silent=True) or {}
    tree = data.get("tree")
    if tree not in ARENA_TREES:
        return jsonify({"error": "Érvénytelen fa."}), 400
    progress = dict(user.arena_progress or {"dribble": [], "aerial": []})
    progress[tree] = []
    user.arena_progress = progress
    db.session.commit()
    return jsonify({"user": user.to_profile()})
