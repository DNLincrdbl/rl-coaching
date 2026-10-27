"""Development entrypoint for the RLM Flask backend."""
from app import create_app, _ensure_schema

app = create_app()

with app.app_context():
    _ensure_schema()

if __name__ == "__main__":
    # Port 5001 (5000 is often used by macOS AirPlay Receiver).
    print("  Backend: http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=True)
