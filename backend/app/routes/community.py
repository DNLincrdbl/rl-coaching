"""RLM+ Replay Elemzések: publikus feed + saját privát sheeteek + játékos profil."""
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from ..models import CoachingSheet, User
from ..utils import current_user, login_required, platform_unlocks

bp = Blueprint("community", __name__, url_prefix="/api/community")

_SCORE = {"green": 2, "yellow": 1, "orange": 1, "red": 0, "neutral": 1}


def _sheet_score(sheet: CoachingSheet) -> int:
    ratings = sheet.ratings or []
    if not ratings:
        return 0
    return sum(_SCORE.get((r or {}).get("color", "neutral"), 1) for r in ratings if isinstance(r, dict))


@bp.get("/sheets")
@login_required
def published_sheets():
    user = current_user()
    unlocks = platform_unlocks(user)
    scope = (request.args.get("scope") or "public").lower()
    rank = (request.args.get("rank") or "").strip()
    sort = (request.args.get("sort") or "new").lower()
    period = (request.args.get("period") or "all").lower()

    if not user.is_rlm_plus:
        return jsonify({
            "sheets": [],
            "unlocked": False,
            "plusRequired": True,
            "scope": scope,
            **unlocks,
        })

    if scope == "private":
        query = CoachingSheet.query.filter_by(user_id=user.id, published=False)
        query = _apply_filters(query, rank, period)
        sheets = query.order_by(CoachingSheet.created_at.desc()).all()
        sheets = _sort_sheets(sheets, sort)
        return jsonify({
            "sheets": [s.to_dict() for s in sheets],
            "unlocked": True,
            "plusRequired": False,
            "scope": "private",
            **unlocks,
        })

    if not unlocks["communityUnlocked"]:
        return jsonify({
            "sheets": [],
            "unlocked": False,
            "plusRequired": False,
            "scope": "public",
            **unlocks,
        })

    query = CoachingSheet.query.filter_by(published=True)
    query = _apply_filters(query, rank, period)
    sheets = query.order_by(CoachingSheet.created_at.desc()).all()
    sheets = _sort_sheets(sheets, sort)
    return jsonify({
        "sheets": [s.to_dict() for s in sheets],
        "unlocked": True,
        "plusRequired": False,
        "scope": "public",
        **unlocks,
    })


def _apply_filters(query, rank: str, period: str):
    if rank:
        query = query.filter(CoachingSheet.player_rank == rank)
    if period == "week":
        query = query.filter(CoachingSheet.created_at >= datetime.utcnow() - timedelta(days=7))
    elif period == "month":
        query = query.filter(CoachingSheet.created_at >= datetime.utcnow() - timedelta(days=30))
    return query


def _sort_sheets(sheets: list, sort: str) -> list:
    if sort == "popular":
        return sorted(
            sheets,
            key=lambda s: (-(s.feedback_stars or 0), -_sheet_score(s), -(s.created_at.timestamp() if s.created_at else 0)),
        )
    return sheets


@bp.get("/players/<int:user_id>")
@login_required
def player_profile(user_id: int):
    viewer = current_user()
    player = User.query.get(user_id)
    if player is None or (player.role == "admin" and not viewer.is_admin):
        return jsonify({"error": "Játékos nem található."}), 404
    unlocks = platform_unlocks(viewer)
    sheets = []
    if viewer.is_rlm_plus and unlocks["communityUnlocked"]:
        sheets = (
            CoachingSheet.query.filter_by(user_id=player.id, published=True)
            .order_by(CoachingSheet.created_at.desc())
            .all()
        )
    progress = player.arena_progress or {}
    arena_count = len(progress.get("dribble") or []) + len(progress.get("aerial") or [])
    return jsonify({
        "player": {
            **player.to_public(),
            "arenaLevel": arena_count,
        },
        "sheets": [s.to_dict() for s in sheets],
        "canSeeSheets": bool(viewer.is_rlm_plus and unlocks["communityUnlocked"]),
        **unlocks,
    })
