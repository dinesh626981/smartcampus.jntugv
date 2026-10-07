"""Backward-compatible entry point shim -> delegates to app.main."""
import os
import sys

BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# pyrefly: ignore [missing-import]
from app.main import app, create_app  # noqa: F401

if __name__ == "__main__":
    from app.core.database import verify_database_connection
    print("[*] Verifying database connectivity before running server...")
    verify_database_connection(app)
    print("[OK] Database is ready! Starting SmartCampus backend on http://0.0.0.0:5001...")
    app.run(host="0.0.0.0", port=5001, debug=True)
