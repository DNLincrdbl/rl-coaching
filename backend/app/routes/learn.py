"""Courses and tutorials served from the site catalog (admin-editable)."""
from flask import Blueprint, jsonify

from ..catalog import load_or_default
from ..utils import login_required

bp = Blueprint("learn", __name__, url_prefix="/api/learn")


@bp.get("")
@login_required
def get_learn():
    payload = load_or_default("learn")
    courses = payload.get("courses") if isinstance(payload, dict) else []
    tutorials = payload.get("tutorials") if isinstance(payload, dict) else []
    cats = []
    for t in tutorials:
        cat = (t or {}).get("category")
        if cat and cat not in cats:
            cats.append(cat)
    return jsonify({
        "courses": courses or [],
        "tutorials": tutorials or [],
        "tutorialCategories": cats,
    })
