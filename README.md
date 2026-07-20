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
