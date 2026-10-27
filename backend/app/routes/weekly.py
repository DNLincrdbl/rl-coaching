"""Weekly challenges: 5 missions, one reroll, XP / credit rewards."""
from __future__ import annotations

from flask import Blueprint, jsonify, request
from sqlalchemy.orm.attributes import flag_modified

from ..extensions import db, limiter
from ..utils import current_user, ensure_weekly_week, grant_xp, login_required, notify_user
from ..weekly_data import BONUS_ALL_XP, challenge_by_id, get_challenges, pick_week, public_challenge, week_end_iso

bp = Blueprint("weekly", __name__, url_prefix="/api/weekly")


def _payload(user) -> dict:
    week, changed = ensure_weekly_week(user)
    if changed:
        db.session.commit()
    ids = list(user.weekly_ids or [])
    done = set(user.weekly_done or [])
    challenges = [public_challenge(cid, cid in done) for cid in ids]
    return {
        "week": week,
        "resetsAt": week_end_iso(week),
        "rerollUsed": bool(user.weekly_reroll_used),
        "completed": len(done),
        "total": 5,
        "allBonusXp": BONUS_ALL_XP,
        "challenges": challenges,
    }


@bp.get("")
@login_required
@limiter.limit("60 per minute")
def get_weekly():
    user = current_user()
    return jsonify(_payload(user))


@bp.post("/complete")
@login_required
@limiter.limit("20 per minute")
def complete():
    user = current_user()
    data = request.get_json(silent=True) or {}
    cid = str(data.get("id") or "").strip()
    week, changed = ensure_weekly_week(user)
    if changed:
        db.session.commit()
    ids = list(user.weekly_ids or [])
    if cid not in ids:
        return jsonify({"error": "Ez a küldetés nem a heti packed."}), 400
    done = list(user.weekly_done or [])
    if cid in done:
        return jsonify({"error": "Ezt már teljesítetted."}), 409
    challenge = challenge_by_id().get(cid)
    if challenge is None:
        return jsonify({"error": "Ismeretlen küldetés."}), 404
    done.append(cid)
    user.weekly_done = done
    flag_modified(user, "weekly_done")
    grant_xp(user, int(challenge["xp"]))
    credit = int(challenge.get("credit") or 0)
    if credit and user.is_rlm_plus:
        user.extra_replay_credits = (user.extra_replay_credits or 0) + credit
    bonus = 0
    if len(done) >= 5:
        bonus = BONUS_ALL_XP
        grant_xp(user, bonus)
        notify_user(user, f"Heti küldetések kész! +{bonus} XP bónusz.", "success")
    db.session.commit()
    return jsonify({
        **_payload(user),
        "reward": {"xp": challenge["xp"], "credit": credit if user.is_rlm_plus else 0, "bonusXp": bonus},
        "user": user.to_profile(),
    })


@bp.post("/reroll")
@login_required
@limiter.limit("10 per minute")
def reroll():
    user = current_user()
    data = request.get_json(silent=True) or {}
    week, changed = ensure_weekly_week(user)
    if changed:
        db.session.commit()
    if user.weekly_reroll_used:
        return jsonify({"error": "A heti rerollt már felhasználtad."}), 409
    ids = list(user.weekly_ids or [])
    done = set(user.weekly_done or [])
    target = str(data.get("id") or "").strip()
    incomplete = [i for i in ids if i not in done]
    if not incomplete:
        return jsonify({"error": "Nincs mit újragenerálni — minden kész."}), 409
    if target and target in incomplete:
        swap = target
    else:
        swap = incomplete[0]
    used = set(ids)
    replacement = None
    for cid in pick_week(week + "|reroll", used, n=len(get_challenges())):
        if cid not in used:
            replacement = cid
            break
    if replacement is None:
        return jsonify({"error": "Nincs másik küldetés a poolban."}), 409
    ids = [replacement if i == swap else i for i in ids]
    user.weekly_ids = ids
    user.weekly_reroll_used = True
    flag_modified(user, "weekly_ids")
    db.session.commit()
    return jsonify(_payload(user))
