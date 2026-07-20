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
python seed.py                # adatbázis + teszt adatok
python run.py                 # http://127.0.0.1:5001
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

A frontend a `NEXT_PUBLIC_API_URL` env változóból veszi a backend címét
(alapértelmezés: `http://localhost:5001`).

## Belépési adatok (seed után)

| Szerep | E-mail | Jelszó |
| --- | --- | --- |
| **Admin (Zoli)** | `zoli@rlm.hu` | `Admin1234!` |
| Teszt user | `alex@test.hu` | `Test1234!` |
| Teszt user | `brigi@test.hu` | `Test1234!` |
| Teszt user (alap csomag) | `dani@test.hu` | `Test1234!` |
| Teszt user | `eszter@test.hu` | `Test1234!` |
| Teszt user | `mark@test.hu` | `Test1234!` |

Az admin fiók a dashboardon külön **Admin** fülön látja az összes felhasználót,
a beküldött replayeket, és értékelheti őket (ekkor jön létre a felhasználó
"sheet"-je, amit a rendszer értesítéssel jelez neki).

## Biztonság

- Jelszavak: PBKDF2-SHA256 (werkzeug), sózva.
- JWT access/refresh token **httpOnly** cookie-ban, **CSRF** védelemmel.
- CORS csak a frontend originre engedélyezve, credentials-szel.
- Rate limiting (login/register), biztonsági response header-ök.
- Titkok `.env`-ből (nincs verziókezelve); az admin jogosultság szerver oldalon
  ellenőrzött minden admin végponton.
