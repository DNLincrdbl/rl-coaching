"""Editable site content (learn / weekly / arena) stored in the database."""
from __future__ import annotations

from datetime import datetime

CATALOG_KEYS = ("learn", "weekly", "arena")


def default_payload(key: str):
    if key == "learn":
        from .learn_data import default_learn
        return default_learn()
    if key == "weekly":
        from .weekly_data import DEFAULT_CHALLENGES
        return list(DEFAULT_CHALLENGES)
    if key == "arena":
        from .arena_data import DEFAULT_MISSIONS
        return list(DEFAULT_MISSIONS)
    raise KeyError(key)


def load(key: str):
    from .models import SiteCatalog

    row = SiteCatalog.query.get(key)
    if row is not None and row.payload:
        return row.payload
    return None


def load_or_default(key: str):
    data = load(key)
    if data:
        return data
    return default_payload(key)


def save(key: str, payload) -> None:
    from .extensions import db
    from .models import SiteCatalog

    if key not in CATALOG_KEYS:
        raise ValueError("Ismeretlen katalógus.")
    row = SiteCatalog.query.get(key)
    if row is None:
        row = SiteCatalog(key=key, payload=payload)
        db.session.add(row)
    else:
        row.payload = payload
        row.updated_at = datetime.utcnow()
    db.session.commit()


def seed_defaults() -> None:
    from .extensions import db
    from .models import SiteCatalog

    for key in CATALOG_KEYS:
        if SiteCatalog.query.get(key) is None:
            db.session.add(SiteCatalog(key=key, payload=default_payload(key)))
    db.session.commit()
