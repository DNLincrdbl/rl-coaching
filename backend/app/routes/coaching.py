"""Replay/coaching submissions from users and extra-replay purchase."""
import os

from flask import Blueprint, abort, current_app, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from ..extensions import db, limiter
from ..utils import (
    EXTRA_REPLAY_PRICE_HUF,
    VIDEO_NAME_RE,
    allowed_video,
    current_user,
    login_required,
    notify_user,
    sanitize_user_text,
    save_video,
    verify_video_signature,
)

bp = Blueprint("coaching", __name__, url_prefix="/api/coaching")


@bp.post("/submit-replay")
@login_required
@limiter.limit("8 per minute")
@limiter.limit("20 per hour")
def submit_replay():
    """User uploads a replay video for the coach (admin) to analyse.

    Accepts a multipart form with a ``video`` file. Consumes an extra-replay
    credit first, otherwise a monthly coaching credit.
    """
    user = current_user()
    if not user.is_rlm_plus:
        return jsonify({"error": "A replay elemzés az RLM+ csomag része."}), 403
    if user.coaching_credits <= 0 and user.extra_replay_credits <= 0:
        return jsonify({"error": "Nincs elérhető kredited. Vegyél extra replay elemzést."}), 402

    note = sanitize_user_text(request.form.get("note"), 2000)
    use_discord = str(request.form.get("useDiscord", "true")).lower() in {"1", "true", "yes", "on"}

    video = request.files.get("video")
    if video is None or not video.filename:
        return jsonify({"error": "Tölts fel egy replay videót (mp4, webm, mov)."}), 400
    if not allowed_video(video.filename):
        return jsonify({"error": "Nem támogatott videóformátum. Használj mp4, webm vagy mov fájlt."}), 400

    try:
        filename = save_video(video)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    if user.extra_replay_credits > 0:
        user.extra_replay_credits -= 1
    else:
        user.coaching_credits -= 1
    user.discord_coaching = use_discord

    from ..models import ReplaySubmission

    db.session.add(ReplaySubmission(
        user_id=user.id,
        video_filename=filename,
        note=note,
    ))
    notify_user(
        user,
        "Replay beküldve! Az elemzés 72 órán belül elkészül.",
        "success",
        email_subject="RLM — replay beérkezett",
    )
    db.session.commit()
    return jsonify({"user": user.to_profile(), "etaHours": 72})


@bp.get("/videos/<path:filename>")
@limiter.limit("120 per minute")
def serve_video(filename: str):
    safe = secure_filename(filename)
    if not VIDEO_NAME_RE.match(safe):
        abort(404)
    if not verify_video_signature(safe, request.args.get("e") or "", request.args.get("s") or ""):
        abort(403)
    directory = current_app.config["UPLOAD_FOLDER"]
    if not os.path.isfile(os.path.join(directory, safe)):
        abort(404)
    return send_from_directory(directory, safe, conditional=True)


@bp.post("/purchase-replay")
@login_required
def purchase_replay():
    user = current_user()
    if not user.is_rlm_plus:
        return jsonify({"error": "Csak RLM+ tagok vásárolhatnak extra replay elemzést."}), 403
    user.extra_replay_credits += 1
    notify_user(
        user,
        f"Extra replay elemzés hozzáadva a fiókodhoz ({EXTRA_REPLAY_PRICE_HUF:,} Ft).".replace(",", "."),
        "success",
        email_subject="RLM — extra replay kredit",
    )
    db.session.commit()
    return jsonify({"user": user.to_profile()})
