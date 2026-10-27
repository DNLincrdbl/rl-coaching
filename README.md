# Rocket League Mesterfokon

Monorepo:

- **`frontend/`** — Next.js 16 (React 19, Tailwind v4) app, single fixed dark theme.
- **`backend/`** — Flask (Python) API with SQLite, JWT auth in httpOnly cookies.

## Helyi teszt szerver (Mac)

Egy parancs indítja a backendet (`:5001`) és a frontendet (`:3000`). Stripe nincs bekötve: a checkout a fiókra írja a csomagot, hogy minden funkció élesben, helyben menjen.

```bash
chmod +x dev.sh
./dev.sh          # elindítja mindkét szervert (elsőre seedeli az adatbázist)
./dev.sh --seed   # drop + új demo adatok, majd start
```

Böngésző: [http://localhost:3000](http://localhost:3000)

A seedelt demo belépési adatok a `seed.py` futtatása után a terminálban jelennek meg
(és a `backend/.env` / `ADMIN_*` változókból jönnek). **Ne commitold** a jelszavakat dokumentációba.

Kézi indítás, ha külön terminált akarsz:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # majd írd át a titkokat
python seed.py
python run.py                 # http://127.0.0.1:5001
```

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
