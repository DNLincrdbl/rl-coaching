"""Monthly Arena trees: pool assignment, submit, Zoli review."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.attributes import flag_modified

from ..arena_data import (
    LAYOUT,
    MASTER_TITLES,
    TYPE_LABELS,
    RANK_LABELS,
    TREE_LABELS,
    award_arena_badge,
    arena_xp,
    is_unlocked,
    month_end_iso,
    monthly_assignment,
    parents_of,
    slot_by_id,
)
from ..extensions import db, limiter
from ..models import ArenaSubmission
from ..utils import (
    ARENA_TREES,
    allowed_video,
    current_user,
    ensure_arena_season,
    grant_xp,
    login_required,
    notify_user,
    sanitize_user_text,
    save_video,
    unlock_title,
)

bp = Blueprint("arena", __name__, url_prefix="/api/arena")
VALID_SLOTS = {s["slot"] for s in LAYOUT}


def _completed_slots(user, tree: str) -> set:
    raw = (user.arena_progress or {}).get(tree) or []
    if not isinstance(raw, list):
        return set()
    return {s for s in raw if isinstance(s, str) and s in VALID_SLOTS}


def _public_mission(mission: dict, reveal: bool) -> dict | None:
    if not reveal:
        return None
    return {
        "id": mission["id"],
        "type": mission["type"],
        "typeLabel": TYPE_LABELS[mission["type"]],
        "rankLabel": RANK_LABELS[mission["rank"]],
        "text": mission["text"],
        "xp": mission["xp"],
        "videoUrl": mission["videoUrl"],
        "relatedTutorialIds": mission["relatedTutorialIds"],
    }


@bp.get("/tree")
@login_required
@limiter.limit("60 per minute")
def get_tree():
    user = current_user()
    tree = (request.args.get("tree") or "dribble").strip().lower()
    if tree not in ARENA_TREES:
        return jsonify({"error": "Érvénytelen fa."}), 400
    month, changed = ensure_arena_season(user)
    completed = _completed_slots(user, tree)
    pending_rows = ArenaSubmission.query.filter_by(
        user_id=user.id, tree=tree, month=month, status="pending"
    ).all()
    pending_slots = {r.slot for r in pending_rows if r.slot in VALID_SLOTS}
    claimable_rows = ArenaSubmission.query.filter_by(
        user_id=user.id, tree=tree, month=month, status="accepted"
    ).all()
    claimable_slots = {r.slot for r in claimable_rows if r.slot in VALID_SLOTS}

    nodes = []
    for item in monthly_assignment(tree, month):
        slot = item["slot"]
        unlocked = bool(user.is_admin) or is_unlocked(slot, completed)
        done = slot in completed
        if done:
            state = "completed"
        elif slot in claimable_slots:
            state = "claimable"
        elif slot in pending_slots:
            state = "pending"
        elif unlocked:
            state = "unlocked"
        else:
            state = "locked"
        reveal = unlocked or done or slot in claimable_slots
        nodes.append({
            "slot": slot,
            "rank": item["rank"],
            "tier": item["tier"],
            "col": item["col"],
            "cols": item["cols"],
            "parents": parents_of(slot),
            "state": state,
            "xp": item["mission"]["xp"],
            "mission": _public_mission(item["mission"], reveal),
        })

    if changed:
        db.session.commit()
    return jsonify({
        "tree": tree,
        "treeLabel": TREE_LABELS[tree],
        "icon": "/DribbleArena.png" if tree == "dribble" else "/AerialArena.png",
        "month": month,
        "resetsAt": month_end_iso(month),
        "nodes": nodes,
        "completed": list(completed),
        "pending": list(pending_slots),
        "claimable": list(claimable_slots),
    })


@bp.post("/submit")
@login_required
@limiter.limit("8 per minute")
@limiter.limit("40 per hour")
def submit():
    user = current_user()
    data = {}
    if request.content_type and "application/json" in request.content_type:
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict):
            data = {}
    tree = (request.form.get("tree") or data.get("tree") or "").strip().lower()
    slot = (request.form.get("slot") or data.get("slot") or "").strip()
    note = sanitize_user_text(request.form.get("note") or data.get("note") or "", 2000)

    if tree not in ARENA_TREES or slot not in VALID_SLOTS:
        return jsonify({"error": "Érvénytelen kérés."}), 400

    month, _season_changed = ensure_arena_season(user)
    item = slot_by_id(tree, slot, month)
    if item is None:
        return jsonify({"error": "Nincs ilyen küldetés ebben a hónapban."}), 404

    completed = _completed_slots(user, tree)
    if slot in completed:
        return jsonify({"error": "Ezt a küldetést már teljesítetted."}), 409
    if not user.is_admin and not is_unlocked(slot, completed):
        return jsonify({"error": "Ez a küldetés még zárva van."}), 403

    filename = None
    video = request.files.get("video") if request.files else None
    if video and video.filename:
        if not allowed_video(video.filename):
            return jsonify({"error": "Nem támogatott videóformátum."}), 400
        try:
            filename = save_video(video)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    if not filename and len(note) < 8:
        return jsonify({"error": "Írj legalább egy rövid megjegyzést, vagy csatolj videót."}), 400

    existing = ArenaSubmission.query.filter(
        ArenaSubmission.user_id == user.id,
        ArenaSubmission.tree == tree,
        ArenaSubmission.slot == slot,
        ArenaSubmission.month == month,
        ArenaSubmission.status.in_(("pending", "accepted")),
    ).first()
    if existing:
        if existing.status == "accepted":
            return jsonify({"error": "Ez a küldetés elfogadva — vedd át a jutalmat."}), 409
        return jsonify({"error": "Már van függő beküldésed erre a küldetésre."}), 409

    db.session.add(ArenaSubmission(
        user_id=user.id,
        tree=tree,
        slot=slot,
        mission_id=item["mission"]["id"],
        month=month,
        note=note,
        video_filename=filename,
        status="pending",
    ))
    notify_user(
        user,
        "Aréna küldetés beküldve. Zoli hamarosan ellenőrzi.",
        "info",
        email_subject="RLM — aréna beküldés",
    )
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Már van függő beküldésed erre a küldetésre."}), 409
    return jsonify({"ok": True, "user": user.to_profile()})


def _apply_claim(user, sub: ArenaSubmission) -> dict:
    from ..arena_data import catalog

    month, _ = ensure_arena_season(user)
    if sub.month != month:
        raise ValueError("Ez a jutalom előző hónapból van.")
    progress = dict(user.arena_progress or {"dribble": [], "aerial": []})
    done = [s for s in (progress.get(sub.tree) or []) if isinstance(s, str) and s in VALID_SLOTS]
    xp = 0
    title = None
    if sub.slot not in done:
        if not user.is_admin and not is_unlocked(sub.slot, set(done)):
            raise ValueError("Az előfeltételek még nincsenek meg.")
        done.append(sub.slot)
        progress[sub.tree] = done
        user.arena_progress = progress
        flag_modified(user, "arena_progress")
        xp = arena_xp(sub.mission_id)
        grant_xp(user, xp)
        if user.arena_first_at is None:
            user.arena_first_at = datetime.utcnow()
        if sub.slot == "m0":
            title = MASTER_TITLES.get(sub.tree)
            if title:
                unlock_title(user, title)
    mission = catalog().get(sub.mission_id) or {}
    rank = mission.get("rank") or "silver"
    badge = award_arena_badge(user, sub.tree, rank, month)
    sub.status = "claimed"
    sub.reviewed_at = sub.reviewed_at or datetime.utcnow()
    return {
        "xp": xp,
        "slot": sub.slot,
        "tree": sub.tree,
        "rank": rank,
        "badge": badge,
        "title": title,
        "missionId": sub.mission_id,
    }


@bp.post("/claim")
@login_required
@limiter.limit("20 per minute")
def claim():
    user = current_user()
    data = request.get_json(silent=True) or {}
    sub_id = data.get("submissionId")
    tree = (data.get("tree") or "").strip().lower()
    slot = (data.get("slot") or "").strip()
    month, changed = ensure_arena_season(user)
    if changed:
        db.session.commit()

    sub = None
    if sub_id:
        try:
            sub = ArenaSubmission.query.filter_by(id=int(sub_id), user_id=user.id, status="accepted").first()
        except (TypeError, ValueError):
            sub = None
    elif tree in ARENA_TREES and slot in VALID_SLOTS:
        sub = ArenaSubmission.query.filter_by(
            user_id=user.id, tree=tree, slot=slot, month=month, status="accepted"
        ).first()
    if sub is None:
        return jsonify({"error": "Nincs átvehető jutalom ennél a küldetésnél."}), 404
    try:
        reward = _apply_claim(user, sub)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409
    db.session.commit()
    return jsonify({"ok": True, "reward": reward, "user": user.to_profile()})
