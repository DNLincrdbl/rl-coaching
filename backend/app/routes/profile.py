"""Current user's profile updates (rank, cosmetics, Discord, settings)."""
from flask import Blueprint, jsonify, request

from ..catalog import load_or_default
from ..cosmetics import PROFILE_COLOR_IDS, PROFILE_TITLE_IDS, is_owned_badge, unlocked_color_ids
from ..extensions import db
from ..identity import parse_fields
from ..models import Notification
from ..utils import current_user, login_required

bp = Blueprint("profile", __name__, url_prefix="/api/profile")

RL_RANKS = {
    "Bronze I", "Bronze II", "Bronze III", "Silver I", "Silver II", "Silver III",
    "Gold I", "Gold II", "Gold III", "Platinum I", "Platinum II", "Platinum III",
    "Diamond I", "Diamond II", "Diamond III", "Champion I", "Champion II", "Champion III",
    "Grand Champion I", "Grand Champion II", "Grand Champion III", "Supersonic Legend",
}

_PROFILE_FIELDS = {
    "rank",
    "discordUsername",
    "selectedBadge",
    "selectedTitle",
    "avatarColor",
    "autoPublishSheets",
    "hideAutoSharePrompt",
}


def _known_course_ids() -> set[str]:
    payload = load_or_default("learn")
    courses = payload.get("courses") if isinstance(payload, dict) else []
    ids: set[str] = set()
    for course in courses or []:
        if not isinstance(course, dict):
            continue
        cid = course.get("id")
        if isinstance(cid, str) and 1 <= len(cid) <= 40:
            ids.add(cid)
    return ids


@bp.patch("")
@login_required
def update_profile():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), _PROFILE_FIELDS)
    if err:
        return jsonify({"error": err}), 400
    if not data:
        return jsonify({"error": "Nincs módosítható mező."}), 400

    if "rank" in data:
        rank = data["rank"]
        if rank is not None and rank not in RL_RANKS:
            return jsonify({"error": "Érvénytelen rang."}), 400
        user.rank = rank

    if "discordUsername" in data:
        raw = data["discordUsername"]
        if raw is None or raw == "":
            user.discord_username = None
        else:
            name = str(raw).strip().lstrip("@")[:80]
            user.discord_username = name or None

    if "selectedBadge" in data:
        badge = data["selectedBadge"]
        if badge is None:
            user.selected_badge = None
        elif not is_owned_badge(user, badge):
            return jsonify({"error": "Érvénytelen vagy még fel nem oldott badge."}), 400
        else:
            user.selected_badge = badge

    if "selectedTitle" in data:
        title = data["selectedTitle"]
        unlocked = set(user.unlocked_titles or [])
        if title in (None, "", "none"):
            user.selected_title = None
        elif title not in PROFILE_TITLE_IDS:
            return jsonify({"error": "Érvénytelen title."}), 400
        elif title not in unlocked and not user.is_admin:
            return jsonify({"error": "Ez a title még nincs feloldva."}), 403
        else:
            user.selected_title = title

    if "avatarColor" in data:
        color = data["avatarColor"]
        if color not in PROFILE_COLOR_IDS:
            return jsonify({"error": "Érvénytelen szín."}), 400
        if color not in unlocked_color_ids(user.level) and not user.is_admin:
            return jsonify({"error": "Ez a szín a következő szinteken nyílik."}), 403
        user.avatar_color = color

    if "autoPublishSheets" in data:
        user.auto_publish_sheets = bool(data["autoPublishSheets"])

    if "hideAutoSharePrompt" in data:
        user.hide_auto_share_prompt = bool(data["hideAutoSharePrompt"])
        if user.hide_auto_share_prompt:
            user.pending_share_sheet_id = None

    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.post("/dismiss-share")
@login_required
def dismiss_share():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), {"dontShowAgain"})
    if err:
        return jsonify({"error": err}), 400
    user.pending_share_sheet_id = None
    if data.get("dontShowAgain"):
        user.hide_auto_share_prompt = True
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.patch("/course-progress")
@login_required
def update_course_progress():
    user = current_user()
    data, err = parse_fields(request.get_json(silent=True), {"courseId", "progress"})
    if err:
        return jsonify({"error": err}), 400
    course_id = data.get("courseId")
    if not isinstance(course_id, str) or course_id not in _known_course_ids():
        return jsonify({"error": "Ismeretlen kurzus."}), 400
    try:
        progress = int(data.get("progress", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Érvénytelen haladás érték."}), 400
    progress = max(0, min(100, progress))

    current = dict(user.course_progress or {})
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
        return jsonify({"error": "Az értesítés nem található."}), 404
    notif.read = True
    db.session.commit()
    return jsonify({"ok": True})
