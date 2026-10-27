"""End-to-end checks for auth, mail, and the main member API. Uses a throwaway database."""
from __future__ import annotations

import os
import re
import shutil
import tempfile
import unittest
from urllib.parse import parse_qs, urlparse

from app import _ensure_schema, create_app
from app.config import Config
from app.extensions import db
from app.models import User


EMAIL = "ujtag@example.com"
PASSWORD = "TesztJelszo1"
NAME = "Új Tag"


class TestConfig(Config):
    TESTING = True
    PROPAGATE_EXCEPTIONS = True
    RATELIMIT_ENABLED = False
    SECRET_KEY = "test-secret-key-not-for-prod"
    JWT_SECRET_KEY = "test-jwt-secret-not-for-prod"
    MAIL_HOST = ""
    MAIL_FROM = ""
    FLASK_ENV = "development"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    MAIL_OUTBOX = ""


def _csrf(client, refresh: bool = False) -> dict:
    name = "csrf_refresh_token" if refresh else "csrf_access_token"
    cookie = client.get_cookie(name)
    if cookie is None:
        return {}
    return {"X-CSRF-TOKEN": cookie.value}


def _link_token(html: str, key: str) -> str:
    match = re.search(rf'href="(https?://[^"]*\?{key}=[^"]+)"', html)
    if not match:
        raise AssertionError(f"no {key} link in letter")
    query = parse_qs(urlparse(match.group(1)).query)
    return query[key][0]


class ApiFlowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="rlm-test-")
        db_path = os.path.join(cls.tmp, "rlm.db")
        TestConfig.SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
        TestConfig.MAIL_OUTBOX = os.path.join(cls.tmp, "outbox")
        cls.app = create_app(TestConfig)
        cls.app.config["RATELIMIT_ENABLED"] = False
        with cls.app.app_context():
            _ensure_schema()
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.engine.dispose()
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def _letters(self) -> list[str]:
        folder = self.app.config["MAIL_OUTBOX"]
        if not os.path.isdir(folder):
            return []
        return sorted(
            os.path.join(folder, name)
            for name in os.listdir(folder)
            if name.endswith(".html")
        )

    def test_public_and_rejected_auth(self):
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.get_json()["status"], "ok")

        me = self.client.get("/api/auth/me")
        self.assertEqual(me.status_code, 401)

        admin = self.client.get("/api/admin/stats")
        self.assertEqual(admin.status_code, 401)

        discord = self.client.get("/api/auth/discord/status")
        self.assertEqual(discord.status_code, 200)
        self.assertIn("configured", discord.get_json())

        bad = self.client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "short",
            "name": "X",
            "role": "admin",
        })
        self.assertEqual(bad.status_code, 400)

        weak = self.client.post("/api/auth/register", json={
            "email": EMAIL,
            "password": "csakbetu",
            "name": NAME,
        })
        self.assertEqual(weak.status_code, 400)

    def test_register_confirm_reset_and_member_routes(self):
        created = self.client.post("/api/auth/register", json={
            "email": EMAIL,
            "password": PASSWORD,
            "name": NAME,
            "role": "admin",
        })
        self.assertEqual(created.status_code, 201, created.get_data(as_text=True))
        body = created.get_json()
        self.assertNotIn("confirmToken", body)
        self.assertNotIn("resetToken", body)
        self.assertFalse(body["user"]["emailVerified"])
        self.assertEqual(body["user"]["role"], "user")
        self.assertEqual(body["user"]["email"], EMAIL)
        self.assertTrue(body["emailSent"])

        with self.app.app_context():
            user = User.query.filter_by(email=EMAIL).one()
            self.assertNotEqual(user.password_hash, PASSWORD)
            self.assertNotIn(PASSWORD, user.password_hash)
            self.assertTrue(user.check_password(PASSWORD))
            self.assertEqual(user.role, "user")
            self.assertIsNotNone(user.email_confirm_hash)

        letters = self._letters()
        self.assertTrue(letters)
        html = open(letters[-1], encoding="utf-8").read()
        self.assertIn("Erősítsd meg a fiókod.", html)
        self.assertIn("#FF6A2B", html)
        self.assertIn("Megerősítem", html)
        token = _link_token(html, "confirm")

        duplicate = self.client.post("/api/auth/register", json={
            "email": EMAIL,
            "password": PASSWORD,
            "name": NAME,
        })
        self.assertEqual(duplicate.status_code, 409)

        confirmed = self.client.post("/api/auth/confirm-email", json={"token": token})
        self.assertEqual(confirmed.status_code, 200, confirmed.get_data(as_text=True))
        self.assertTrue(confirmed.get_json()["user"]["emailVerified"])

        again = self.client.post("/api/auth/confirm-email", json={"token": token})
        self.assertEqual(again.status_code, 400)

        wrong = self.client.post("/api/auth/login", json={"email": EMAIL, "password": "RosszJelszo1"})
        self.assertEqual(wrong.status_code, 401)
        self.assertNotIn("foglalt", wrong.get_json()["error"].lower())

        missing = self.client.post("/api/auth/forgot-password", json={"email": "nincs@example.com"})
        self.assertEqual(missing.status_code, 200)
        self.assertNotIn("resetToken", missing.get_json())
        before = len(self._letters())

        forgot = self.client.post("/api/auth/forgot-password", json={"email": EMAIL})
        self.assertEqual(forgot.status_code, 200)
        self.assertNotIn("resetToken", forgot.get_json())
        self.assertGreater(len(self._letters()), before)
        reset_html = open(self._letters()[-1], encoding="utf-8").read()
        self.assertIn("Új jelszó.", reset_html)
        self.assertIn("Új jelszó megadása", reset_html)
        reset_token = _link_token(reset_html, "reset")

        new_password = "MasikJelszo2"
        reset = self.client.post("/api/auth/reset-password", json={"token": reset_token, "password": new_password})
        self.assertEqual(reset.status_code, 200, reset.get_data(as_text=True))
        reused = self.client.post("/api/auth/reset-password", json={"token": reset_token, "password": "HarmadikJelszo3"})
        self.assertEqual(reused.status_code, 400)

        old_login = self.client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
        self.assertEqual(old_login.status_code, 401)
        logged = self.client.post("/api/auth/login", json={"email": EMAIL, "password": new_password})
        self.assertEqual(logged.status_code, 200)

        me = self.client.get("/api/auth/me")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.get_json()["user"]["displayName"], NAME)

        forbidden = self.client.get("/api/admin/stats", headers=_csrf(self.client))
        self.assertEqual(forbidden.status_code, 403)
        self.assertEqual(self.client.get("/api/admin/users", headers=_csrf(self.client)).status_code, 403)

        learn = self.client.get("/api/learn")
        self.assertEqual(learn.status_code, 200)
        self.assertIn("courses", learn.get_json())

        arena = self.client.get("/api/arena/tree?tree=dribble")
        self.assertEqual(arena.status_code, 200)
        self.assertTrue(arena.get_json().get("nodes"))
        bad_tree = self.client.get("/api/arena/tree?tree=nope")
        self.assertEqual(bad_tree.status_code, 400)

        weekly = self.client.get("/api/weekly")
        self.assertEqual(weekly.status_code, 200)
        challenges = weekly.get_json()["challenges"]
        self.assertEqual(len(challenges), 5)
        done = self.client.post(
            "/api/weekly/complete",
            json={"id": challenges[0]["id"]},
            headers=_csrf(self.client),
        )
        self.assertEqual(done.status_code, 200, done.get_data(as_text=True))
        twice = self.client.post(
            "/api/weekly/complete",
            json={"id": challenges[0]["id"]},
            headers=_csrf(self.client),
        )
        self.assertEqual(twice.status_code, 409)

        board = self.client.get("/api/leaderboard")
        self.assertEqual(board.status_code, 200)
        self.assertIn("unlocked", board.get_json())

        community = self.client.get("/api/community/sheets")
        self.assertEqual(community.status_code, 200)
        self.assertTrue(community.get_json()["plusRequired"])

        profile = self.client.patch(
            "/api/profile",
            json={"rank": "Diamond II"},
            headers=_csrf(self.client),
        )
        self.assertEqual(profile.status_code, 200, profile.get_data(as_text=True))
        self.assertEqual(profile.get_json()["user"]["rank"], "Diamond II")
        bad_rank = self.client.patch("/api/profile", json={"rank": "Hacker"}, headers=_csrf(self.client))
        self.assertEqual(bad_rank.status_code, 400)

        short_issue = self.client.post("/api/issues", json={"message": "rövid"}, headers=_csrf(self.client))
        self.assertEqual(short_issue.status_code, 400)
        issue = self.client.post(
            "/api/issues",
            json={"message": "A kurzus videó nem indul el a tanuló oldalon.", "page": "/dashboard/learn"},
            headers=_csrf(self.client),
        )
        self.assertEqual(issue.status_code, 200, issue.get_data(as_text=True))

        empty_cart = self.client.post("/api/billing/demo-complete", json={"items": []}, headers=_csrf(self.client))
        self.assertEqual(empty_cart.status_code, 400)
        paid = self.client.post(
            "/api/billing/demo-complete",
            json={"items": [{"id": "sub-rlm", "qty": 1}]},
            headers=_csrf(self.client),
        )
        self.assertEqual(paid.status_code, 200, paid.get_data(as_text=True))

        refreshed = self.client.post("/api/auth/refresh", headers=_csrf(self.client, refresh=True))
        self.assertEqual(refreshed.status_code, 200, refreshed.get_data(as_text=True))

        self.assertEqual(self.client.post("/api/auth/logout").status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

    def test_account_settings_are_server_authoritative(self):
        client = self.app.test_client()
        other = self.app.test_client()
        email = "settings@example.com"
        password = "SettingsJelszo1"
        created = client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "name": "Beállító Tag",
            "role": "admin",
            "xp": 99999,
        })
        self.assertEqual(created.status_code, 201, created.get_data(as_text=True))
        body = created.get_json()["user"]
        self.assertEqual(body["role"], "user")
        self.assertEqual(body["xp"], 0)
        self.assertRegex(body["username"], r"^[a-z0-9_]{3,24}$")
        self.assertNotIn("confirmToken", created.get_json())

        blocked = client.patch(
            "/api/profile",
            json={"rank": "Gold I", "role": "admin", "xp": 5000},
            headers=_csrf(client),
        )
        self.assertEqual(blocked.status_code, 400)

        renamed = client.patch(
            "/api/account/identity",
            json={"displayName": "Új Név", "username": "uj_nev", "role": "admin"},
            headers=_csrf(client),
        )
        self.assertEqual(renamed.status_code, 400)
        self.assertEqual(client.get("/api/auth/me").get_json()["user"]["role"], "user")

        renamed = client.patch(
            "/api/account/identity",
            json={"displayName": "Új Név", "username": "uj_nev"},
            headers=_csrf(client),
        )
        self.assertEqual(renamed.status_code, 200, renamed.get_data(as_text=True))
        self.assertEqual(renamed.get_json()["user"]["displayName"], "Új Név")
        self.assertEqual(renamed.get_json()["user"]["username"], "uj_nev")
        self.assertEqual(renamed.get_json()["user"]["role"], "user")

        bad_name = client.patch(
            "/api/account/identity",
            json={"username": "ab"},
            headers=_csrf(client),
        )
        self.assertEqual(bad_name.status_code, 400)

        second = other.post("/api/auth/register", json={
            "email": "masik@example.com",
            "password": password,
            "name": "Másik Tag",
        })
        self.assertEqual(second.status_code, 201, second.get_data(as_text=True))
        clash = other.patch(
            "/api/account/identity",
            json={"username": "uj_nev"},
            headers=_csrf(other),
        )
        self.assertEqual(clash.status_code, 409)

        wrong = client.post(
            "/api/account/email",
            json={"email": "uj@example.com", "currentPassword": "RosszJelszo1", "role": "admin"},
            headers=_csrf(client),
        )
        self.assertEqual(wrong.status_code, 400)
        self.assertEqual(client.get("/api/auth/me").get_json()["user"]["email"], email)

        missing_pw = client.post(
            "/api/account/email",
            json={"email": "uj@example.com", "currentPassword": "RosszJelszo1"},
            headers=_csrf(client),
        )
        self.assertEqual(missing_pw.status_code, 400)
        self.assertIsNone(client.get("/api/auth/me").get_json()["user"]["pendingEmail"])

        before = len(self._letters())
        changed = client.post(
            "/api/account/email",
            json={"email": "uj@example.com", "currentPassword": password},
            headers=_csrf(client),
        )
        self.assertEqual(changed.status_code, 200, changed.get_data(as_text=True))
        payload = changed.get_json()
        self.assertTrue(payload["emailSent"])
        self.assertEqual(payload["pendingEmail"], "uj@example.com")
        self.assertNotIn("token", payload)
        self.assertEqual(payload["user"]["email"], email)
        self.assertGreater(len(self._letters()), before)

        letter = ""
        token = ""
        for path in reversed(self._letters()):
            html = open(path, encoding="utf-8").read()
            if "emailChange=" in html and "uj@example.com" in html and "Megerősítem az új címet" in html:
                letter = html
                token = _link_token(html, "emailChange")
                break
        self.assertIn("Új e-mail cím.", letter)
        self.assertIn("#FF6A2B", letter)
        notice = open(self._letters()[-1], encoding="utf-8").read()
        self.assertNotIn("emailChange=", notice)
        self.assertNotIn(token, notice)

        stale = client.post("/api/account/email/confirm", json={"token": "nincs-ilyen-token"})
        self.assertEqual(stale.status_code, 400)

        confirmed = client.post("/api/account/email/confirm", json={"token": token}, headers=_csrf(client))
        self.assertEqual(confirmed.status_code, 200, confirmed.get_data(as_text=True))
        self.assertEqual(confirmed.get_json()["user"]["email"], "uj@example.com")
        self.assertIsNone(confirmed.get_json()["user"]["pendingEmail"])
        self.assertTrue(confirmed.get_json()["user"]["emailVerified"])
        again = client.post("/api/account/email/confirm", json={"token": token}, headers=_csrf(client))
        self.assertEqual(again.status_code, 400)

        old_login = client.post("/api/auth/login", json={"email": email, "password": password})
        self.assertEqual(old_login.status_code, 401)
        new_login = client.post("/api/auth/login", json={"email": "uj@example.com", "password": password})
        self.assertEqual(new_login.status_code, 200)

        other_session = self.app.test_client()
        kept = other_session.post("/api/auth/login", json={"email": "uj@example.com", "password": password})
        self.assertEqual(kept.status_code, 200)
        rotated = client.post(
            "/api/account/password",
            json={"currentPassword": password, "newPassword": "UjJelszo2", "role": "admin"},
            headers=_csrf(client),
        )
        self.assertEqual(rotated.status_code, 400)
        rotated = client.post(
            "/api/account/password",
            json={"currentPassword": "rossz", "newPassword": "UjJelszo2"},
            headers=_csrf(client),
        )
        self.assertEqual(rotated.status_code, 400)
        rotated = client.post(
            "/api/account/password",
            json={"currentPassword": password, "newPassword": "UjJelszo2"},
            headers=_csrf(client),
        )
        self.assertEqual(rotated.status_code, 200, rotated.get_data(as_text=True))
        self.assertEqual(client.get("/api/auth/me").status_code, 200)
        self.assertEqual(other_session.get("/api/auth/me").status_code, 401)
        self.assertEqual(
            other_session.post("/api/auth/refresh", headers=_csrf(other_session, refresh=True)).status_code,
            401,
        )
        self.assertEqual(
            client.post("/api/auth/login", json={"email": "uj@example.com", "password": password}).status_code,
            401,
        )
        self.assertEqual(
            client.post("/api/auth/login", json={"email": "uj@example.com", "password": "UjJelszo2"}).status_code,
            200,
        )


if __name__ == "__main__":
    unittest.main()
