"""SQLAlchemy models for the RLM platform."""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")  # 'user' | 'admin'

    rank = db.Column(db.String(60), nullable=True)
    subscription_tier = db.Column(db.String(20), nullable=False, default="pro")  # 'pro' | 'basic'
    level = db.Column(db.Integer, nullable=False, default=1)
    xp = db.Column(db.Integer, nullable=False, default=0)
    coaching_credits = db.Column(db.Integer, nullable=False, default=1)
    extra_replay_credits = db.Column(db.Integer, nullable=False, default=0)
    selected_badge = db.Column(db.String(40), nullable=True, default="rookie")
    arena_progress = db.Column(db.JSON, nullable=False, default=lambda: {"dribble": [], "aerial": []})
    # Course progress as {courseId: percentComplete}.
    course_progress = db.Column(db.JSON, nullable=False, default=dict)
    discord_coaching = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    sheets = db.relationship("CoachingSheet", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    submissions = db.relationship("ReplaySubmission", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    notifications = db.relationship("Notification", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    # --- password helpers ---
    def set_password(self, raw: str) -> None:
        self.password_hash = generate_password_hash(raw, method="pbkdf2:sha256:600000")

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    def to_public(self) -> dict:
        """Minimal public info (for leaderboard / community author)."""
        return {
            "id": self.id,
            "displayName": self.display_name,
            "rank": self.rank,
            "level": self.level,
            "selectedBadge": self.selected_badge,
        }

    def to_profile(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "displayName": self.display_name,
            "role": self.role,
            "rank": self.rank,
            "subscriptionTier": self.subscription_tier,
            "level": self.level,
            "xp": self.xp,
            "coachingCredits": self.coaching_credits,
            "extraReplayCredits": self.extra_replay_credits,
            "selectedBadge": self.selected_badge,
            "arenaProgress": self.arena_progress or {"dribble": [], "aerial": []},
            "courseProgress": [
                {"courseId": cid, "progress": prog}
                for cid, prog in (self.course_progress or {}).items()
            ],
            "discordCoaching": self.discord_coaching,
            "createdAt": self.created_at.isoformat(),
            "coachingSheets": [s.to_dict() for s in self.sheets.order_by(CoachingSheet.created_at.desc())],
            "notifications": [n.to_dict() for n in self.notifications.order_by(Notification.created_at.desc())],
            "submissions": [s.to_dict() for s in self.submissions.order_by(ReplaySubmission.created_at.desc())],
        }


class CoachingSheet(db.Model):
    __tablename__ = "coaching_sheets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    video_url = db.Column(db.String(500), nullable=False, default="")
    # Filename of an uploaded replay video (served via /api/coaching/videos/<name>).
    # When set it takes precedence over video_url for the playable source.
    video_filename = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=False, default="")
    ratings = db.Column(db.JSON, nullable=False, default=list)      # [{topic,color,biggestMistake}]
    timestamps = db.Column(db.JSON, nullable=False, default=list)   # [{id,time,topic,note}]
    published = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @property
    def playable_url(self) -> str:
        """Relative URL of the video: uploaded file if present, else the external url."""
        if self.video_filename:
            return f"/api/coaching/videos/{self.video_filename}"
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
            "authorName": self.user.display_name if self.user else "",
            "authorRank": self.user.rank if self.user else "",
        }


class ReplaySubmission(db.Model):
    __tablename__ = "replay_submissions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    replay_url = db.Column(db.String(500), nullable=False, default="")
    # Filename of the uploaded replay video (served via /api/coaching/videos/<name>).
    video_filename = db.Column(db.String(255), nullable=True)
    note = db.Column(db.Text, nullable=False, default="")
    status = db.Column(db.String(20), nullable=False, default="pending")  # 'pending' | 'reviewed'
    sheet_id = db.Column(db.Integer, db.ForeignKey("coaching_sheets.id"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "replayUrl": self.replay_url,
            "videoUrl": f"/api/coaching/videos/{self.video_filename}" if self.video_filename else None,
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
