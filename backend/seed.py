"""Seed the database with an admin (Zoli) and realistic test users.

Run with:  python seed.py
This DROPS and recreates all tables (safe for development only).
"""
from datetime import datetime, timedelta

from app import create_app
from app.arena_data import LAYOUT, award_arena_badge, current_month, monthly_assignment
from app.config import Config
from app.cosmetics import color_for_level
from app.extensions import db
from app.models import ArenaSubmission, CoachingSheet, Notification, ReplaySubmission, User
from app.utils import grant_xp, level_from_xp

app = create_app()

SAMPLE_RATINGS = [
    {"topic": "decision_making", "color": "green"},
    {"topic": "positioning", "color": "yellow", "biggestMistake": "Túl gyakran mész be másodikként, üresen hagyva a hátsó teret."},
    {"topic": "mechanics", "color": "green"},
    {"topic": "speed_boost", "color": "yellow", "biggestMistake": "Landolás után nem fordulsz azonnal a labda felé, a boost útvonalak csúsznak."},
    {"topic": "awareness", "color": "red", "biggestMistake": "Nem nézed a boostkészletet és a párod pozícióját challenge előtt."},
]
SAMPLE_TIMESTAMPS = [
    {"id": "ts-1", "time": 12, "topic": "positioning", "note": "Itt beszorulsz a sarokba, pedig a párod már támad — maradj magasabban."},
    {"id": "ts-2", "time": 45, "topic": "positioning", "note": "Ebben a helyzetben másodikként mész be, így üresen marad a kapu előtti tér."},
    {"id": "ts-3", "time": 78, "topic": "awareness", "note": "Nem nézed, hogy az ellenfél a hátad mögött van boostért — nézd a mini-mapet."},
    {"id": "ts-4", "time": 120, "topic": "speed_boost", "note": "Landolás után lassan fordulsz vissza; half-flippel gyorsabb lennél."},
]
DEMO_VIDEO = "/sample-replay.mp4"
DEMO_PASSWORD = "Test1234!"

RANKS = [
    "Bronze III", "Silver II", "Gold I", "Gold III", "Platinum I", "Platinum III",
    "Diamond I", "Diamond II", "Diamond III", "Champion I", "Champion II",
    "Grand Champion I", "Grand Champion II", "Supersonic Legend",
]


def _slot_prefix(n: int) -> list:
    return [s["slot"] for s in LAYOUT[:n]]


def _xp_for(tree: str, slots: list, month: str) -> int:
    table = {it["slot"]: it["mission"]["xp"] for it in monthly_assignment(tree, month)}
    return sum(table.get(s, 0) for s in slots)


def make_user(
    email, name, password, rank, tier="rlm_plus", dribble=None, aerial=None,
    coaching_credits=None, extra_xp=0, titles=None, badge="rookie",
    created_at=None, arena_first_at=None, discord=None, month=None,
):
    plus = tier == "rlm_plus"
    season = month or current_month()
    dribble = list(dribble or [])
    aerial = list(aerial or [])
    u = User(
        email=email,
        display_name=name,
        role="user",
        rank=rank,
        subscription_tier=tier,
        coaching_credits=1 if coaching_credits is None and plus else (coaching_credits or 0),
        selected_badge=badge,
        unlocked_titles=titles or (["og"] if plus else []),
        selected_title="og" if plus else None,
        arena_progress={"dribble": dribble, "aerial": aerial},
        arena_season=season,
        discord_username=discord,
        auto_publish_sheets=plus,
        email_verified=True,
    )
    from app.identity import allocate_username
    u.username = allocate_username(name)
    u.set_password(password)
    xp = extra_xp + _xp_for("dribble", dribble, season) + _xp_for("aerial", aerial, season)
    u.xp = xp
    u.level = level_from_xp(xp)
    u.avatar_color = color_for_level(u.level)["id"]
    if created_at:
        u.created_at = created_at
    if arena_first_at:
        u.arena_first_at = arena_first_at
    elif dribble or aerial:
        u.arena_first_at = datetime.utcnow() - timedelta(days=20)
    db.session.add(u)
    return u


def run():
    with app.app_context():
        db.drop_all()
        db.create_all()
        from app.catalog import seed_defaults
        seed_defaults()

        month = current_month()

        admin = User(
            email=Config.ADMIN_EMAIL,
            display_name=Config.ADMIN_NAME,
            role="admin",
            rank="Supersonic Legend",
            subscription_tier="rlm_plus",
            selected_badge="legend",
            selected_title="og",
            unlocked_titles=["og", "dribble_master", "aerial_master"],
            avatar_color="gold",
            arena_progress={"dribble": [], "aerial": []},
            arena_season=month,
            discord_username="justzoly",
            coaching_credits=9,
        )
        admin.set_password(Config.ADMIN_PASSWORD)
        admin.email_verified = True
        from app.identity import allocate_username
        admin.username = allocate_username(Config.ADMIN_NAME)
        grant_xp(admin, 4500)
        admin.avatar_color = color_for_level(admin.level)["id"]
        db.session.add(admin)

        now = datetime.utcnow()
        alex = make_user(
            "alex@test.hu", "AlexRL", DEMO_PASSWORD, "Diamond II",
            dribble=_slot_prefix(5),
            aerial=_slot_prefix(2),
            extra_xp=400, badge="grinder", discord="alexrl",
            arena_first_at=now - timedelta(days=18), month=month,
        )
        brigi = make_user(
            "brigi@test.hu", "BrigiGG", DEMO_PASSWORD, "Champion I",
            dribble=_slot_prefix(7),
            aerial=_slot_prefix(4),
            extra_xp=800, badge="dribbler", discord="brigigg",
            titles=["og", "dribble_master"],
            arena_first_at=now - timedelta(days=12), month=month,
        )
        dani = make_user(
            "dani@test.hu", "DaniPlays", DEMO_PASSWORD, "Platinum III",
            tier="rlm",
            dribble=_slot_prefix(2),
            coaching_credits=0, extra_xp=50, discord=None,
            arena_first_at=now - timedelta(days=9), month=month,
        )
        eszter = make_user(
            "eszter@test.hu", "EszterAce", DEMO_PASSWORD, "Gold III",
            dribble=_slot_prefix(1), extra_xp=0, discord="eszterace",
            arena_first_at=now - timedelta(days=7), month=month,
        )
        mark = make_user(
            "mark@test.hu", "MarkSSL", DEMO_PASSWORD, "Grand Champion II",
            dribble=_slot_prefix(8),
            aerial=_slot_prefix(6),
            extra_xp=1200, badge="legend", discord="markssl",
            titles=["og", "aerial_master"],
            arena_first_at=now - timedelta(days=4), month=month,
        )
        db.session.flush()

        # Enough members so community (15) and leaderboard (20) unlock locally.
        fillers = []
        for i in range(1, 18):
            rank = RANKS[i % len(RANKS)]
            plus = i <= 14
            u = make_user(
                f"player{i}@test.hu", f"Player{i}", DEMO_PASSWORD, rank,
                tier="rlm_plus" if plus else "rlm",
                dribble=_slot_prefix(1) if i % 2 else _slot_prefix(2),
                extra_xp=i * 40,
                created_at=now - timedelta(days=30 - i),
                arena_first_at=now - timedelta(days=25 - i),
                month=month,
            )
            fillers.append(u)
        db.session.flush()

        sheet = CoachingSheet(
            user_id=alex.id,
            title="Replay Elemzés — 2v2 ranked",
            video_url=DEMO_VIDEO,
            summary="Erős mechanikai alapok, de a pozícionálás és a térérzék javításával sokat lépnél.",
            ratings=SAMPLE_RATINGS,
            timestamps=SAMPLE_TIMESTAMPS,
            published=True,
            player_rank=alex.rank,
            feedback_stars=5,
        )
        db.session.add(sheet)

        brigi_sheet = CoachingSheet(
            user_id=brigi.id,
            title="Champ 1 → Champ 2 fejlődés",
            video_url=DEMO_VIDEO,
            summary="Jó agresszió, de a boost menedzsment és az 50/50-ek időzítése javítható.",
            ratings=[
                {"topic": "decision_making", "color": "yellow", "biggestMistake": "Túl korán challenge-elsz."},
                {"topic": "positioning", "color": "green"},
                {"topic": "mechanics", "color": "green"},
                {"topic": "speed_boost", "color": "green"},
                {"topic": "awareness", "color": "yellow", "biggestMistake": "Nem követed a párod rotációját."},
            ],
            timestamps=SAMPLE_TIMESTAMPS[:2],
            published=True,
            player_rank=brigi.rank,
            feedback_stars=4,
        )
        db.session.add(brigi_sheet)

        private_sheet = CoachingSheet(
            user_id=alex.id,
            title="Privát — kickoff javítás",
            video_url=DEMO_VIDEO,
            summary="Ezt még nem osztottad meg. A kickoff timing és a boost pickup a fókusz.",
            ratings=SAMPLE_RATINGS,
            timestamps=SAMPLE_TIMESTAMPS[:3],
            published=False,
            player_rank=alex.rank,
        )
        db.session.add(private_sheet)

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

        dribble_ids = {it["slot"]: it["mission"]["id"] for it in monthly_assignment("dribble", month)}
        db.session.add(ArenaSubmission(
            user_id=dani.id,
            tree="dribble",
            slot="s2",
            mission_id=dribble_ids["s2"],
            month=month,
            note="Musty flick, a klipet Discordon is elküldtem.",
            status="pending",
        ))
        db.session.add(ArenaSubmission(
            user_id=eszter.id,
            tree="dribble",
            slot="s1",
            mission_id=dribble_ids["s1"],
            month=month,
            note="Silver küldetés, várom az átvételt.",
            status="accepted",
        ))

        award_arena_badge(alex, "dribble", "silver", month)
        award_arena_badge(brigi, "dribble", "gold", month)
        award_arena_badge(brigi, "dribble", "silver", month)
        award_arena_badge(mark, "aerial", "gold", month)
        award_arena_badge(mark, "dribble", "plat", month)

        db.session.add(Notification(user_id=alex.id, message="Elkészült a replay elemzésed!", type="success"))
        db.session.add(Notification(user_id=eszter.id, message="Aréna küldetés elfogadva. Vedd át a jutalmat az Arénában.", type="success"))
        db.session.add(Notification(user_id=eszter.id, message="Replay beküldve, hamarosan értékeljük.", type="info"))

        db.session.commit()

        print("Seed complete.")
        print(f"  Admin: {Config.ADMIN_EMAIL} (jelszó: ADMIN_PASSWORD a .env-ből)")
        print(f"  Demo userek jelszava: {DEMO_PASSWORD}")
        print("  RLM+ (minden funkció): alex@test.hu, brigi@test.hu, eszter@test.hu, mark@test.hu")
        print("  RLM only (gating teszt): dani@test.hu")
        print("  (A demo jelszavakat ne tedd README-be / ne pushold publikus doksiba.)")


if __name__ == "__main__":
    run()
