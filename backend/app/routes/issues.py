"""Report Issue — available to RLM and RLM+ members."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import IssueReport
from ..utils import admin_required, current_user, login_required, notify_user

bp = Blueprint("issues", __name__, url_prefix="/api/issues")


@bp.post("")
@login_required
def create_issue():
    user = current_user()
    data = request.get_json(silent=True) or {}
    message = str(data.get("message") or "").strip()
    if len(message) < 8:
        return jsonify({"error": "Írj legalább egy rövid leírást a hibáról."}), 400
    report = IssueReport(
        user_id=user.id,
        message=message[:4000],
        page=str(data.get("page") or "")[:200] or None,
    )
    db.session.add(report)
    notify_user(user, "Köszönjük, megkaptuk a hibajelentésed.", "info", email_subject="RLM — hibajelentés")
    db.session.commit()
    return jsonify({"ok": True, "id": report.id})


@bp.get("")
@admin_required
def list_issues():
    rows = IssueReport.query.order_by(IssueReport.created_at.desc()).limit(100).all()
    return jsonify({"issues": [r.to_dict() for r in rows]})
