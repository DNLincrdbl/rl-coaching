"""Replay/coaching submissions from users and extra-replay purchase."""
import os

from flask import Blueprint, abort, current_app, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models import Notification, ReplaySubmission
from ..utils import allowed_video, current_user, login_required, save_video

bp = Blueprint("coaching", __name__, url_prefix="/api/coaching")


@bp.post("/submit-replay")
@login_required
def submit_replay():
    """User uploads a replay video for the coach (admin) to analyse.

    Accepts a multipart form with a ``video`` file. Consumes an extra-replay
    credit first, otherwise a monthly coaching credit.
    """
    user = current_user()
    if user.subscription_tier == "basic":
        return jsonify({"error": "Az Alap tagság nem tartalmaz coachingot. Válts PRO-ra."}), 403
    if user.coaching_credits <= 0 and user.extra_replay_credits <= 0:
        return jsonify({"error": "Nincs elérhető kredited. Vegyél extra replay elemzést."}), 402

    note = (request.form.get("note") or "").strip()
    use_discord = str(request.form.get("useDiscord", "true")).lower() in {"1", "true", "yes", "on"}

    video = request.files.get("video")
    if video is None or not video.filename:
        return jsonify({"error": "Tölts fel egy replay videót (mp4, webm, mov)."}), 400
    if not allowed_video(video.filename):
        return jsonify({"error": "Nem támogatott videóformátum. Használj mp4, webm vagy mov fájlt."}), 400

    filename = save_video(video)

    # Consume a credit (extra first).
    if user.extra_replay_credits > 0:
        user.extra_replay_credits -= 1
    else:
        user.coaching_credits -= 1
    user.discord_coaching = use_discord

    submission = ReplaySubmission(
        user_id=user.id,
        video_filename=filename,
        note=note[:2000],
    )
    db.session.add(submission)
    db.session.add(Notification(
        user_id=user.id,
        message="Replay beküldve! Hamarosan megkapod a részletes elemzést.",
        type="success",
    ))
    db.session.commit()
    return jsonify({"user": user.to_profile()})


@bp.get("/videos/<path:filename>")
def serve_video(filename: str):
    """Serve an uploaded replay video (supports HTTP range requests for seeking).

    Filenames are unguessable UUIDs, so this is served without auth to keep the
    HTML5 <video> element (which cannot send auth headers) simple.
    """
    safe = secure_filename(filename)
    if not safe:
        abort(404)
    directory = current_app.config["UPLOAD_FOLDER"]
    if not os.path.isfile(os.path.join(directory, safe)):
        abort(404)
    return send_from_directory(directory, safe, conditional=True)


@bp.post("/purchase-replay")
@login_required
def purchase_replay():
    user = current_user()
    if user.subscription_tier != "pro":
        return jsonify({"error": "Csak PRO tagok vásárolhatnak extra replay elemzést."}), 403
    user.extra_replay_credits += 1
    db.session.add(Notification(
        user_id=user.id,
        message="Extra replay elemzés hozzáadva a fiókodhoz (4.990 Ft).",
        type="success",
    ))
    db.session.commit()
    return jsonify({"user": user.to_profile()})
