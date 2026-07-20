"""Coaching sheet access, admin editing, and publishing."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import CoachingSheet
from ..utils import current_user, login_required, sanitize_ratings, sanitize_timestamps

bp = Blueprint("sheets", __name__, url_prefix="/api/sheets")


@bp.get("/<int:sheet_id>")
@login_required
def get_sheet(sheet_id: int):
    user = current_user()
    sheet = CoachingSheet.query.get(sheet_id)
    if sheet is None:
        return jsonify({"error": "A sheet nem található."}), 404
    # Visible to the owner, to admins, or if published.
    if sheet.user_id != user.id and not user.is_admin and not sheet.published:
        return jsonify({"error": "Forbidden"}), 403
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
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json(silent=True) or {}
    sheet.published = bool(data.get("published", True))
    db.session.commit()
    return jsonify({"sheet": sheet.to_dict()})
