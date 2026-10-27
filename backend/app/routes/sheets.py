"""Coaching sheet access, admin editing, publishing, and player feedback."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import CoachingSheet
from ..utils import FEEDBACK_XP, current_user, grant_xp, login_required, notify_user, sanitize_ratings, sanitize_timestamps

bp = Blueprint("sheets", __name__, url_prefix="/api/sheets")


@bp.get("/<int:sheet_id>")
@login_required
def get_sheet(sheet_id: int):
    user = current_user()
    sheet = CoachingSheet.query.get(sheet_id)
    if sheet is None:
        return jsonify({"error": "A sheet nem található."}), 404
    if sheet.user_id != user.id and not user.is_admin and not sheet.published:
        return jsonify({"error": "Nincs jogosultságod ehhez a sheethez."}), 403
    if sheet.published and not user.is_rlm_plus and sheet.user_id != user.id:
        return jsonify({"error": "A publikus elemzések az RLM+ csomag része."}), 403
    return jsonify({"sheet": sheet.to_dict(), "canEdit": user.is_admin, "isOwner": sheet.user_id == user.id})


@bp.patch("/<int:sheet_id>")
@login_required
def edit_sheet(sheet_id: int):
    user = current_user()
    if not user.is_admin:
        return jsonify({"error": "Csak admin szerkeszthet sheetet."}), 403
    sheet = CoachingSheet.query.get(sheet_id)
    if sheet is None:
        return jsonify({"error": "A sheet nem található."}), 404

    data = request.get_json(silent=True) or {}
    if "title" in data:
        sheet.title = str(data["title"])[:200]
    if "videoUrl" in data:
        sheet.video_url = str(data["videoUrl"])[:500]
    if "summary" in data:
        sheet.summary = str(data["summary"])[:4000]
    if "ratings" in data:
        sheet.ratings = sanitize_ratings(data["ratings"])
    if "timestamps" in data:
        sheet.timestamps = sanitize_timestamps(data["timestamps"])
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict()})


@bp.post("/<int:sheet_id>/publish")
@login_required
def publish_sheet(sheet_id: int):
    user = current_user()
    sheet = CoachingSheet.query.get(sheet_id)
    if sheet is None:
        return jsonify({"error": "A sheet nem található."}), 404
    if sheet.user_id != user.id and not user.is_admin:
        return jsonify({"error": "Nincs jogosultságod ehhez a sheethez."}), 403
    data = request.get_json(silent=True) or {}
    sheet.published = bool(data.get("published", True))
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict()})


@bp.post("/<int:sheet_id>/feedback")
@login_required
def sheet_feedback(sheet_id: int):
    user = current_user()
    sheet = CoachingSheet.query.get(sheet_id)
    if sheet is None:
        return jsonify({"error": "A sheet nem található."}), 404
    if sheet.user_id != user.id:
        return jsonify({"error": "Csak a saját elemzésedet értékelheted."}), 403
    if sheet.feedback_stars is not None:
        return jsonify({"error": "Erre az elemzésre már adtál visszajelzést."}), 409

    data = request.get_json(silent=True) or {}
    try:
        stars = int(data.get("stars", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Érvénytelen csillag."}), 400
    if stars < 1 or stars > 5:
        return jsonify({"error": "1 és 5 közötti csillagot adj."}), 400

    try:
        tip = int(data.get("tip", 0) or 0)
    except (TypeError, ValueError):
        return jsonify({"error": "Érvénytelen tip összeg."}), 400
    tip = max(0, min(tip, 100_000))

    sheet.feedback_stars = stars
    sheet.feedback_message = str(data.get("message") or "")[:2000]
    sheet.feedback_tip = tip
    sheet.feedback_at = datetime.utcnow()
    grant_xp(user, FEEDBACK_XP)
    notify_user(
        user,
        f"Köszönjük a visszajelzést! +{FEEDBACK_XP} XP jóváírva.",
        "success",
        email_subject="RLM — köszönjük az értékelést",
    )
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict(), "user": user.to_profile()})
