"""Local/demo billing — applies cart items to the account without Stripe."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..utils import EXTRA_REPLAY_PRICE_HUF, activate_tier, current_user, login_required, notify_user

bp = Blueprint("billing", __name__, url_prefix="/api/billing")

PLUS_IDS = {"sub-rlm_plus", "sub-pro", "rlm_plus"}
CORE_IDS = {"sub-rlm", "sub-basic", "rlm"}
EXTRA_IDS = {"extra-replay", "replay-extra"}


@bp.post("/demo-complete")
@login_required
def demo_complete():
    """Activate purchased items locally so the Mac test stack is end-to-end."""
    user = current_user()
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    if not isinstance(items, list) or not items:
        return jsonify({"error": "Üres kosár."}), 400

    applied = []
    for item in items:
        if not isinstance(item, dict):
            continue
        pid = str(item.get("id") or "")
        try:
            qty = max(1, int(item.get("qty") or 1))
        except (TypeError, ValueError):
            qty = 1

        if pid in PLUS_IDS:
            activate_tier(user, "rlm_plus")
            applied.append("rlm_plus")
        elif pid in CORE_IDS:
            if user.tier != "rlm_plus":
                activate_tier(user, "rlm")
            applied.append("rlm")
        elif pid in EXTRA_IDS:
            if not user.is_rlm_plus:
                return jsonify({"error": "Extra replay csak RLM+ tagoknak."}), 403
            user.extra_replay_credits += qty
            applied.append(f"extra_replay_x{qty}")

    if not applied:
        return jsonify({"error": "Ismeretlen tétel a kosárban."}), 400

    notify_user(
        user,
        "A vásárlásod jóváírva a fiókodon (helyi teszt mód, Stripe nélkül).",
        "success",
        email_subject="RLM — rendelés visszaigazolás",
    )
    db.session.commit()
    return jsonify({
        "user": user.to_profile(),
        "applied": applied,
        "extraReplayPrice": EXTRA_REPLAY_PRICE_HUF,
    })
