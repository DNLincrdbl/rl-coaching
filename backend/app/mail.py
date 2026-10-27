"""Outbound email via SMTP. Without MAIL_HOST, development letters go to mail_outbox."""
from __future__ import annotations

import os
import smtplib
from datetime import datetime
from email.message import EmailMessage

from flask import current_app

from .email_templates import render_letter


def mail_configured() -> bool:
    cfg = current_app.config
    return bool(cfg.get("MAIL_HOST") and cfg.get("MAIL_FROM"))


def _allow_outbox() -> bool:
    if current_app.config.get("TESTING"):
        return True
    env = str(current_app.config.get("FLASK_ENV") or "development").lower()
    return env != "production"


def _write_outbox(to: str, subject: str, body: str, html: str) -> str | None:
    if not _allow_outbox():
        current_app.logger.error("Email to %s not sent: SMTP is not configured", to)
        return None
    folder = current_app.config.get("MAIL_OUTBOX") or ""
    if not folder:
        return None
    os.makedirs(folder, exist_ok=True)
    stamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    safe_to = "".join(ch if ch.isalnum() else "_" for ch in to)[:40]
    path = os.path.join(folder, f"{stamp}-{safe_to}.html")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(html)
        handle.write("\n<!-- text\n")
        handle.write(body)
        handle.write("\n-->\n")
    current_app.logger.info("Email saved for %s: %s", to, path)
    print(f"[EMAIL saved] {to} — {subject} — {path}")
    return path


def send_email(to: str, subject: str, body: str, html: str | None = None) -> bool:
    """Send a letter. Returns True if SMTP accepted it or a dev outbox file was written."""
    if not to:
        return False
    if html is None:
        _, html = render_letter(
            eyebrow="Rocket League Mesterfokon",
            headline=subject.replace("RLM — ", "").strip() or "Értesítés.",
            paragraphs=[line for line in body.split("\n") if line.strip()] or [body],
        )

    current_app.logger.info("[EMAIL → %s] %s", to, subject)

    if not mail_configured():
        return _write_outbox(to, subject, body, html) is not None

    cfg = current_app.config
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = cfg["MAIL_FROM"]
    msg["To"] = to
    msg.set_content(body)
    msg.add_alternative(html, subtype="html")

    host = cfg["MAIL_HOST"]
    port = int(cfg.get("MAIL_PORT") or 587)
    user = cfg.get("MAIL_USERNAME") or ""
    password = cfg.get("MAIL_PASSWORD") or ""
    use_tls = bool(cfg.get("MAIL_USE_TLS", True))
    use_ssl = bool(cfg.get("MAIL_USE_SSL", False))

    try:
        if use_ssl:
            smtp: smtplib.SMTP = smtplib.SMTP_SSL(host, port, timeout=20)
        else:
            smtp = smtplib.SMTP(host, port, timeout=20)
        with smtp:
            smtp.ehlo()
            if use_tls and not use_ssl:
                smtp.starttls()
                smtp.ehlo()
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
        current_app.logger.info("Email sent to %s", to)
        return True
    except Exception as exc:
        current_app.logger.exception("Email send failed to %s: %s", to, exc)
        print(f"[EMAIL FAILED → {to}] {exc}")
        return False
