"""Seed the database with an admin (Zoli) and realistic test users.

Run with:  python seed.py
This DROPS and recreates all tables (safe for development only).
"""
from datetime import datetime, timedelta

from app import create_app
from app.config import Config
from app.extensions import db
from app.models import CoachingSheet, Notification, ReplaySubmission, User
from app.utils import arena_node_xp, level_from_xp

app = create_app()

SAMPLE_RATINGS = [
    {"topic": "decision_making", "color": "green"},
    {"topic": "positioning", "color": "orange", "biggestMistake": "Túl gyakran mész be másodikként, üresen hagyva a hátsó teret."},
    {"topic": "mechanics", "color": "green"},
    {"topic": "recovery_speed", "color": "orange", "biggestMistake": "Landolás után nem fordulsz azonnal a labda felé."},
    {"topic": "awareness", "color": "red", "biggestMistake": "Nem nézed a boostkészletet és a párod pozícióját challenge előtt."},
]
SAMPLE_TIMESTAMPS = [
    {"id": "ts-1", "time": 12, "topic": "positioning", "note": "Itt beszorulsz a sarokba, pedig a párod már támad — maradj magasabban."},
    {"id": "ts-2", "time": 45, "topic": "positioning", "note": "Ebben a helyzetben másodikként mész be, így üresen marad a kapu előtti tér."},
    {"id": "ts-3", "time": 78, "topic": "awareness", "note": "Nem látod, hogy az ellenfél a hátad mögött van boostért — nézd a mini-mapet."},
    {"id": "ts-4", "time": 120, "topic": "recovery_speed", "note": "Landolás után lassan fordulsz vissza; half-flippel gyorsabb lennél."},
]
# Same-origin sample served by the Next frontend from /public (works offline).
DEMO_VIDEO = "/sample-replay.mp4"


def make_user(email, name, password, rank, tier="pro", dribble=None, aerial=None, coaching_credits=1):
    u = User(
        email=email,
        display_name=name,
        role="user",
        rank=rank,
        subscription_tier=tier,
        coaching_credits=coaching_credits if tier == "pro" else 0,
        selected_badge="rookie",
        arena_progress={"dribble": dribble or [], "aerial": aerial or []},
    )
    u.set_password(password)
    xp = sum(arena_node_xp(n) for n in (dribble or []) + (aerial or []))
    u.xp = xp
    u.level = level_from_xp(xp)
    db.session.add(u)
    return u


def run():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # --- Admin (owner) ---
        admin = User(
            email=Config.ADMIN_EMAIL,
            display_name=Config.ADMIN_NAME,
            role="admin",
            rank="Supersonic Legend",
            subscription_tier="pro",
            selected_badge="legend",
            arena_progress={"dribble": [], "aerial": []},
        )
        admin.set_password(Config.ADMIN_PASSWORD)
        db.session.add(admin)

        # --- Test users ---
        alex = make_user(
            "alex@test.hu", "AlexRL", "Test1234!", "Diamond II",
            dribble=["d-t0-0", "d-t1-0", "d-t1-1", "d-t2-0", "d-t2-1"],
            aerial=["a-t0-0", "a-t1-0"],
        )
        brigi = make_user(
            "brigi@test.hu", "BrigiGG", "Test1234!", "Champion I",
            dribble=["d-t0-0", "d-t1-0", "d-t1-1", "d-t2-0", "d-t2-1", "d-t2-2", "d-t3-0"],
            aerial=["a-t0-0", "a-t1-0", "a-t1-1", "a-t2-0"],
        )
        dani = make_user(
            "dani@test.hu", "DaniPlays", "Test1234!", "Platinum III", tier="basic",
            dribble=["d-t0-0", "d-t1-0"],
        )
        eszter = make_user(
            "eszter@test.hu", "EszterAce", "Test1234!", "Gold III",
            dribble=["d-t0-0"],
        )
        mark = make_user(
            "mark@test.hu", "MarkSSL", "Test1234!", "Grand Champion II",
            dribble=["d-t0-0", "d-t1-0", "d-t1-1", "d-t2-0", "d-t2-1", "d-t2-2", "d-t3-0", "d-t3-1"],
            aerial=["a-t0-0", "a-t1-0", "a-t1-1", "a-t2-0", "a-t2-1", "a-t3-0"],
        )
        db.session.flush()

        # --- A completed, published sheet for Alex ---
        sheet = CoachingSheet(
            user_id=alex.id,
            title="Replay Elemzés — 2v2 ranked",
            video_url=DEMO_VIDEO,
            summary="Erős mechanikai alapok, de a pozícionálás és a térérzék javításával sokat lépnél.",
            ratings=SAMPLE_RATINGS,
            timestamps=SAMPLE_TIMESTAMPS,
            published=True,
        )
        db.session.add(sheet)

        brigi_sheet = CoachingSheet(
            user_id=brigi.id,
            title="Champ 1 → Champ 2 fejlődés",
            video_url=DEMO_VIDEO,
            summary="Jó agresszió, de a boost menedzsment és az 50/50-ek időzítése javítható.",
            ratings=[
                {"topic": "decision_making", "color": "orange", "biggestMistake": "Túl korán challenge-elsz."},
                {"topic": "positioning", "color": "green"},
                {"topic": "mechanics", "color": "green"},
                {"topic": "recovery_speed", "color": "green"},
                {"topic": "awareness", "color": "orange", "biggestMistake": "Nem követed a párod rotációját."},
            ],
            timestamps=SAMPLE_TIMESTAMPS[:2],
            published=True,
        )
        db.session.add(brigi_sheet)

        # --- Pending submissions waiting for Zoli to evaluate ---
        db.session.add(ReplaySubmission(
            user_id=eszter.id,
            replay_url="https://ballchasing.com/replay/example-eszter",
            note="A védekezésemet szeretném javítani, sokszor kimozdulok feleslegesen.",
            status="pending",
            created_at=datetime.utcnow() - timedelta(hours=5),
        ))
        db.session.add(ReplaySubmission(
            user_id=mark.id,
            replay_url="https://ballchasing.com/replay/example-mark",
            note="GC2-nél megakadtam, a kickoffokban érzem gyengének magam.",
            status="pending",
            created_at=datetime.utcnow() - timedelta(hours=2),
        ))
        db.session.add(ReplaySubmission(
            user_id=dani.id,
            replay_url="https://ballchasing.com/replay/example-dani",
            note="Plat-ból szeretnék diába jutni.",
            status="pending",
        ))

        # --- Notifications ---
        db.session.add(Notification(user_id=alex.id, message="Elkészült a replay elemzésed!", type="success"))
        db.session.add(Notification(user_id=eszter.id, message="Replay beküldve, hamarosan értékeljük.", type="info"))

        db.session.commit()

        print("Seed complete.")
        print(f"  Admin: {Config.ADMIN_EMAIL} (jelszó: ADMIN_PASSWORD a .env-ből)")
        print("  Demo userek (jelszó: a seed.py-ban beállított lokális demo jelszó):")
        for e in ["alex@test.hu", "brigi@test.hu", "dani@test.hu", "eszter@test.hu", "mark@test.hu"]:
            print(f"    - {e}")
        print("  (A demo jelszavakat ne tedd README-be / ne pushold publikus doksiba.)")


if __name__ == "__main__":
    run()
