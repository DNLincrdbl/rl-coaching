#!/usr/bin/env bash
# Local test stack: Flask API on :5001 + Next.js on :3000
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SEED=0
if [[ "${1:-}" == "--seed" ]]; then
  SEED=1
fi

cleanup() {
  if [[ -n "${BACK_PID:-}" ]] && kill -0 "$BACK_PID" 2>/dev/null; then
    kill "$BACK_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONT_PID:-}" ]] && kill -0 "$FRONT_PID" 2>/dev/null; then
    kill "$FRONT_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

cd "$ROOT/backend"
if [[ ! -d venv ]]; then
  python3 -m venv venv
fi
# shellcheck disable=SC1091
source venv/bin/activate
pip install -q -r requirements.txt
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Létrehoztam a backend/.env fájlt az example alapján."
fi

DB_FILE="$ROOT/backend/rlm.db"
if [[ "$SEED" -eq 1 || ! -f "$DB_FILE" ]]; then
  echo "Adatbázis seed..."
  python seed.py
fi

python run.py &
BACK_PID=$!

cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  npm install
fi
npm run dev &
FRONT_PID=$!

echo ""
echo "=============================================="
echo "  RLM helyi teszt szerver"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://127.0.0.1:5001"
echo "  Seed újra: ./dev.sh --seed"
echo "=============================================="
echo ""

wait
