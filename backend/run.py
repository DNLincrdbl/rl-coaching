"""Development entrypoint for the RLM Flask backend."""
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    # Port 5001 (5000 is often used by macOS AirPlay Receiver).
    app.run(host="127.0.0.1", port=5001, debug=True)
