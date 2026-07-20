# Rocket League Mesterfokon

Monorepo:

- **`frontend/`** — Next.js 16 (React 19, Tailwind v4) app, single fixed dark theme.
- **`backend/`** — Flask (Python) API with SQLite, JWT auth in httpOnly cookies.

## Futtatás

### Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # majd írd át a titkokat
python seed.py                # adatbázis + lokális demo userek
python run.py                 # http://127.0.0.1:5001
```

A seedelt demo belépési adatok a `seed.py` futtatása után a terminálban jelennek meg
(és a `backend/.env` / `ADMIN_*` változókból jönnek). **Ne commitold** a jelszavakat dokumentációba.

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

A frontend a `NEXT_PUBLIC_API_URL` env változóból veszi a backend címét
(alapértelmezés: `http://localhost:5001`).

## Biztonság

- Jelszavak: PBKDF2-SHA256 (werkzeug), sózva.
- JWT access/refresh token **httpOnly** cookie-ban, **CSRF** védelemmel.
- CORS csak a frontend originre engedélyezve, credentials-szel.
- Rate limiting (login/register), biztonsági response header-ök.
- Titkok `.env`-ből (nincs verziókezelve); az admin jogosultság szerver oldalon
  ellenőrzött minden admin végponton.
