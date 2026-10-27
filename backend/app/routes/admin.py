"""Admin panel API (owner = Zoli). Full visibility + replay evaluation."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from ..arena_data import LAYOUT
from ..extensions import db, limiter
from ..models import ArenaSubmission, CoachingSheet, IssueReport, ReplaySubmission, User
from ..utils import admin_required, ensure_arena_season, notify_user, sanitize_ratings, sanitize_timestamps, sanitize_user_text

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
        "openIssues": IssueReport.query.count(),
        "pendingArena": ArenaSubmission.query.filter_by(status="pending").count(),
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
            "discordUsername": u.discord_username,
            "emailVerified": bool(u.email_verified),
            "discordLinked": bool(u.discord_id),
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
    auto = bool(user.auto_publish_sheets) and user.is_rlm_plus
    sheet = CoachingSheet(
        user_id=user.id,
        title=str(data.get("title") or "Replay Elemzés")[:200],
        video_url="" if video_filename else str(data.get("videoUrl") or "")[:500],
        video_filename=video_filename,
        summary=str(data.get("summary") or "")[:4000],
        ratings=sanitize_ratings(data.get("ratings")),
        timestamps=sanitize_timestamps(data.get("timestamps")),
        published=auto,
        player_rank=user.rank,
    )
    db.session.add(sheet)
    db.session.flush()
    if auto and not user.hide_auto_share_prompt:
        user.pending_share_sheet_id = sheet.id
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
    notify_user(
        sub.user,
        "Elkészült a replay elemzésed! Nézd meg a profilodon.",
        "success",
        email_subject="RLM — kész a replay elemzésed",
    )
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
    notify_user(
        user,
        "Új replay elemzés érkezett a profilodra!",
        "success",
        email_subject="RLM — új replay elemzés",
    )
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


@bp.patch("/users/<int:user_id>")
@admin_required
def patch_user(user_id: int):
    from .profile import RL_RANKS
    from ..utils import activate_tier

    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "Felhasználó nem található."}), 404
    data = request.get_json(silent=True) or {}
    if "subscriptionTier" in data:
        activate_tier(user, str(data.get("subscriptionTier") or "rlm"))
    if "rank" in data:
        rank = data["rank"]
        if rank in (None, ""):
            user.rank = None
        elif rank not in RL_RANKS:
            return jsonify({"error": "Érvénytelen rang."}), 400
        else:
            user.rank = rank
    if "emailVerified" in data:
        user.email_verified = bool(data["emailVerified"])
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.get("/catalog/<key>")
@admin_required
def get_catalog(key: str):
    from ..catalog import CATALOG_KEYS, load_or_default

    if key not in CATALOG_KEYS:
        return jsonify({"error": "Ismeretlen katalógus."}), 404
    return jsonify({"key": key, "payload": load_or_default(key)})


@bp.put("/catalog/<key>")
@admin_required
def put_catalog(key: str):
    from ..catalog import CATALOG_KEYS, save

    if key not in CATALOG_KEYS:
        return jsonify({"error": "Ismeretlen katalógus."}), 404
    data = request.get_json(silent=True) or {}
    payload = data.get("payload", data)
    if key == "weekly":
        if not isinstance(payload, list) or not payload:
            return jsonify({"error": "A heti pool lista legyen, üresen nem menthető."}), 400
        for row in payload:
            if not isinstance(row, dict) or not row.get("id") or not row.get("title"):
                return jsonify({"error": "Minden heti küldetésnek kell id és title."}), 400
    elif key == "arena":
        if not isinstance(payload, list) or not payload:
            return jsonify({"error": "Az aréna pool lista legyen."}), 400
    elif key == "learn":
        if not isinstance(payload, dict) or "courses" not in payload or "tutorials" not in payload:
            return jsonify({"error": "A learn katalógus {courses, tutorials} legyen."}), 400
    try:
        save(key, payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True, "key": key, "payload": payload})


@bp.get("/issues")
@admin_required
def list_issues():
    rows = IssueReport.query.order_by(IssueReport.created_at.desc()).limit(100).all()
    return jsonify({"issues": [r.to_dict() for r in rows]})


@bp.get("/arena")
@admin_required
def list_arena():
    status = request.args.get("status")
    query = ArenaSubmission.query
    if status in {"pending", "accepted", "rejected"}:
        query = query.filter_by(status=status)
    rows = query.order_by(ArenaSubmission.created_at.desc()).limit(150).all()
    return jsonify({"submissions": [r.to_dict() for r in rows]})


@bp.post("/arena/<int:sub_id>/review")
@admin_required
@limiter.limit("30 per minute")
def review_arena(sub_id: int):
    sub = ArenaSubmission.query.filter_by(id=sub_id, status="pending").first()
    if sub is None:
        return jsonify({"error": "Beküldés nem található."}), 404
    if sub.status != "pending":
        return jsonify({"error": "Ezt a beküldést már elbírálták."}), 409

    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").lower()
    user = sub.user
    if user is None:
        return jsonify({"error": "Felhasználó nem található."}), 404

    if action == "accept":
        month, _changed = ensure_arena_season(user)
        if sub.month != month:
            return jsonify({"error": "Ez a beküldés előző hónapból van — utasítsd el, vagy várj a resetre."}), 409
        if sub.slot not in {s["slot"] for s in LAYOUT}:
            return jsonify({"error": "Érvénytelen küldetés."}), 400
        sub.status = "accepted"
        sub.reviewed_at = datetime.utcnow()
        notify_user(
            user,
            "Aréna küldetés elfogadva. Vedd át a jutalmat az Arénában — az XP akkor jár.",
            "success",
            email_subject="RLM — aréna küldetés elfogadva",
        )
    elif action == "reject":
        sub.status = "rejected"
        sub.reviewed_at = datetime.utcnow()
        reason = sanitize_user_text(data.get("reason"), 400)
        msg = "Aréna küldetés elutasítva. Próbáld újra tisztább klippel."
        if reason:
            msg = f"Aréna küldetés elutasítva: {reason}"
        notify_user(user, msg, "warning", email_subject="RLM — aréna küldetés elutasítva")
    else:
        return jsonify({"error": "Érvénytelen művelet."}), 400

    db.session.commit()
    return jsonify({"ok": True, "submission": sub.to_dict(), "user": user.to_profile()})
