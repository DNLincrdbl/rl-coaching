"""SQLAlchemy models for the RLM platform."""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .cosmetics import color_for_level, next_color_for_level, unlocked_color_ids
from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(24), unique=True, nullable=True, index=True)
    role = db.Column(db.String(20), nullable=False, default="user")  # 'user' | 'admin'

    rank = db.Column(db.String(60), nullable=True)
    # 'rlm' | 'rlm_plus'  (legacy 'basic'/'pro' are normalized on read)
    subscription_tier = db.Column(db.String(20), nullable=False, default="rlm")
    level = db.Column(db.Integer, nullable=False, default=1)
    xp = db.Column(db.Integer, nullable=False, default=0)
    coaching_credits = db.Column(db.Integer, nullable=False, default=0)
    extra_replay_credits = db.Column(db.Integer, nullable=False, default=0)
    selected_badge = db.Column(db.String(40), nullable=True, default="rookie")
    selected_title = db.Column(db.String(40), nullable=True)
    avatar_color = db.Column(db.String(40), nullable=False, default="black")
    unlocked_titles = db.Column(db.JSON, nullable=False, default=list)
    discord_username = db.Column(db.String(80), nullable=True)
    discord_id = db.Column(db.String(40), nullable=True, index=True)
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    email_confirm_hash = db.Column(db.String(64), nullable=True, index=True)
    email_confirm_expires = db.Column(db.DateTime, nullable=True)
    password_reset_hash = db.Column(db.String(64), nullable=True, index=True)
    password_reset_expires = db.Column(db.DateTime, nullable=True)
    pending_email = db.Column(db.String(255), nullable=True)
    pending_email_hash = db.Column(db.String(64), nullable=True, index=True)
    pending_email_expires = db.Column(db.DateTime, nullable=True)
    session_version = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    auto_publish_sheets = db.Column(db.Boolean, nullable=False, default=True)
    hide_auto_share_prompt = db.Column(db.Boolean, nullable=False, default=False)
    pending_share_sheet_id = db.Column(db.Integer, nullable=True)
    arena_first_at = db.Column(db.DateTime, nullable=True)
    arena_season = db.Column(db.String(7), nullable=True)
    arena_progress = db.Column(db.JSON, nullable=False, default=lambda: {"dribble": [], "aerial": []})
    arena_badges = db.Column(db.JSON, nullable=False, default=list)
    weekly_week = db.Column(db.String(16), nullable=True)
    weekly_ids = db.Column(db.JSON, nullable=False, default=list)
    weekly_done = db.Column(db.JSON, nullable=False, default=list)
    weekly_reroll_used = db.Column(db.Boolean, nullable=False, default=False)
    # Course progress as {courseId: percentComplete}.
    course_progress = db.Column(db.JSON, nullable=False, default=dict)
    discord_coaching = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    sheets = db.relationship("CoachingSheet", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    submissions = db.relationship("ReplaySubmission", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    notifications = db.relationship("Notification", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, raw: str) -> None:
        self.password_hash = generate_password_hash(raw, method="pbkdf2:sha256:600000")

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @property
    def tier(self) -> str:
        t = (self.subscription_tier or "rlm").lower()
        if t in {"pro", "rlm_plus", "rlm+"}:
            return "rlm_plus"
        return "rlm"

    @property
    def is_rlm_plus(self) -> bool:
        return self.tier == "rlm_plus" or self.is_admin

    def to_public(self) -> dict:
        """Minimal public info (for leaderboard / community author)."""
        from .arena_data import current_arena_badge

        return {
            "id": self.id,
            "displayName": self.display_name,
            "rank": self.rank,
            "level": self.level,
            "xp": self.xp,
            "selectedBadge": self.selected_badge,
            "selectedTitle": self.selected_title,
            "avatarColor": self.avatar_color or "black",
            "arenaBadge": current_arena_badge(self),
            "arenaBadges": list(self.arena_badges or []),
        }

    def to_profile(self) -> dict:
        from .utils import platform_unlocks
        from .arena_data import current_arena_badge

        pending_share = None
        if self.pending_share_sheet_id and not self.hide_auto_share_prompt:
            sheet = CoachingSheet.query.get(self.pending_share_sheet_id)
            if sheet is not None:
                pending_share = {"id": str(sheet.id), "title": sheet.title, "published": sheet.published}

        current_color = color_for_level(self.level)
        nxt = next_color_for_level(self.level)

        return {
            "id": self.id,
            "email": self.email,
            "displayName": self.display_name,
            "username": self.username or "",
            "pendingEmail": self.pending_email,
            "role": self.role,
            "rank": self.rank,
            "subscriptionTier": self.tier,
            "level": self.level,
            "xp": self.xp,
            "coachingCredits": self.coaching_credits,
            "extraReplayCredits": self.extra_replay_credits,
            "selectedBadge": self.selected_badge,
            "selectedTitle": self.selected_title,
            "avatarColor": self.avatar_color or "black",
            "unlockedTitles": self.unlocked_titles or [],
            "unlockedColors": unlocked_color_ids(self.level),
            "currentLevelColor": current_color,
            "nextLevelColor": nxt,
            "discordUsername": self.discord_username,
            "discordId": self.discord_id,
            "discordLinked": bool(self.discord_id),
            "emailVerified": bool(self.email_verified),
            "autoPublishSheets": bool(self.auto_publish_sheets),
            "hideAutoSharePrompt": bool(self.hide_auto_share_prompt),
            "pendingShareSheet": pending_share,
            "arenaProgress": self.arena_progress or {"dribble": [], "aerial": []},
            "arenaSeason": self.arena_season,
            "arenaBadges": list(self.arena_badges or []),
            "arenaBadge": current_arena_badge(self),
            "courseProgress": [
                {"courseId": cid, "progress": prog}
                for cid, prog in (self.course_progress or {}).items()
            ],
            "discordCoaching": self.discord_coaching,
            "createdAt": self.created_at.isoformat(),
            "coachingSheets": [s.to_dict() for s in self.sheets.order_by(CoachingSheet.created_at.desc())],
            "notifications": [n.to_dict() for n in self.notifications.order_by(Notification.created_at.desc())],
            "submissions": [s.to_dict() for s in self.submissions.order_by(ReplaySubmission.created_at.desc())],
            "features": platform_unlocks(self),
        }


class CoachingSheet(db.Model):
    __tablename__ = "coaching_sheets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    video_url = db.Column(db.String(500), nullable=False, default="")
    video_filename = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=False, default="")
    ratings = db.Column(db.JSON, nullable=False, default=list)
    timestamps = db.Column(db.JSON, nullable=False, default=list)
    published = db.Column(db.Boolean, nullable=False, default=False)
    player_rank = db.Column(db.String(60), nullable=True)
    feedback_stars = db.Column(db.Integer, nullable=True)
    feedback_message = db.Column(db.Text, nullable=True)
    feedback_tip = db.Column(db.Integer, nullable=False, default=0)
    feedback_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @property
    def playable_url(self) -> str:
        from .utils import signed_video_path

        if self.video_filename:
            return signed_video_path(self.video_filename) or ""
        return self.video_url

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "userId": self.user_id,
            "title": self.title,
            "createdAt": self.created_at.isoformat(),
            "videoUrl": self.playable_url,
            "summary": self.summary,
            "ratings": self.ratings or [],
            "timestamps": self.timestamps or [],
            "published": self.published,
            "playerRank": self.player_rank or (self.user.rank if self.user else ""),
            "authorName": self.user.display_name if self.user else "",
            "authorRank": self.user.rank if self.user else "",
            "feedbackStars": self.feedback_stars,
            "feedbackMessage": self.feedback_message,
            "feedbackTip": self.feedback_tip or 0,
            "hasFeedback": self.feedback_stars is not None,
        }


class ReplaySubmission(db.Model):
    __tablename__ = "replay_submissions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    replay_url = db.Column(db.String(500), nullable=False, default="")
    video_filename = db.Column(db.String(255), nullable=True)
    note = db.Column(db.Text, nullable=False, default="")
    status = db.Column(db.String(20), nullable=False, default="pending")
    sheet_id = db.Column(db.Integer, db.ForeignKey("coaching_sheets.id"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self) -> dict:
        from .utils import signed_video_path

        return {
            "id": self.id,
            "userId": self.user_id,
            "replayUrl": self.replay_url,
            "videoUrl": signed_video_path(self.video_filename),
            "hasVideo": bool(self.video_filename),
            "note": self.note,
            "status": self.status,
            "sheetId": str(self.sheet_id) if self.sheet_id else None,
            "createdAt": self.created_at.isoformat(),
            "reviewedAt": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(20), nullable=False, default="info")
    read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "message": self.message,
            "type": self.type,
            "read": self.read,
            "createdAt": self.created_at.isoformat(),
        }


class ArenaSubmission(db.Model):
    __tablename__ = "arena_submissions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    tree = db.Column(db.String(20), nullable=False)
    slot = db.Column(db.String(20), nullable=False)
    mission_id = db.Column(db.String(60), nullable=False)
    month = db.Column(db.String(7), nullable=False)
    note = db.Column(db.Text, nullable=False, default="")
    video_filename = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User")

    def to_dict(self) -> dict:
        from .arena_data import RANK_LABELS, TYPE_LABELS, catalog
        from .utils import signed_video_path

        mission = catalog().get(self.mission_id) or {}
        return {
            "id": self.id,
            "userId": self.user_id,
            "tree": self.tree,
            "slot": self.slot,
            "missionId": self.mission_id,
            "month": self.month,
            "note": self.note,
            "hasVideo": bool(self.video_filename),
            "videoUrl": signed_video_path(self.video_filename),
            "status": self.status,
            "createdAt": self.created_at.isoformat(),
            "reviewedAt": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "rankLabel": RANK_LABELS.get(mission.get("rank", ""), ""),
            "typeLabel": TYPE_LABELS.get(mission.get("type", ""), ""),
            "text": mission.get("text", ""),
            "xp": mission.get("xp", 0),
            "treeLabel": "Dribble" if self.tree == "dribble" else "Aerial",
            "user": self.user.to_public() if self.user else None,
        }


class IssueReport(db.Model):
    __tablename__ = "issue_reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    page = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "userName": self.user.display_name if self.user else "",
            "userEmail": self.user.email if self.user else "",
            "message": self.message,
            "page": self.page,
            "createdAt": self.created_at.isoformat(),
        }


class SiteCatalog(db.Model):
    """JSON blobs for learn / weekly / arena content, edited from the admin CMS."""
    __tablename__ = "site_catalog"

    key = db.Column(db.String(40), primary_key=True)
    payload = db.Column(db.JSON, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
