"""SmartCampus REST API - Application factory and WSGI entry point."""
import os
import sys

# Ensure backend dir and project root are on sys.path
_APP_DIR = os.path.abspath(os.path.dirname(__file__))
_BACKEND_DIR = os.path.abspath(os.path.join(_APP_DIR, ".."))
_PROJECT_ROOT = os.path.abspath(os.path.join(_BACKEND_DIR, ".."))
for _p in (_BACKEND_DIR, _PROJECT_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from dotenv import load_dotenv

load_dotenv(os.path.join(_BACKEND_DIR, ".env"))
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from app.core.config import Config
from app.core.database import db, init_database
from app.infrastructure.email_service import init_mail

from app.api.routes.admin import admin_bp
from app.api.routes.ai import ai_bp
from app.api.routes.auth import auth_bp
from app.api.routes.complaints import complaints_bp
from app.api.routes.dashboard import dashboard_bp
from app.api.routes.feedback import feedback_bp
from app.api.routes.profile import profile_bp
from app.api.routes.reports import reports_bp
from app.api.routes.storage import storage_bp


def create_app(config_overrides: dict = None) -> Flask:
    """Application factory for the SmartCampus REST API microservice."""
    app = Flask(__name__)
    app.config.from_object(Config)

    if config_overrides:
        app.config.update(config_overrides)

    origins = app.config.get("CORS_ORIGINS", ["*"])
    CORS(app, origins=origins, supports_credentials=True)

    db.init_app(app)
    init_mail(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(profile_bp, url_prefix="/api")
    app.register_blueprint(complaints_bp, url_prefix="/api")
    app.register_blueprint(feedback_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(storage_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")

    @app.route("/health", methods=["GET"])
    def health():
        try:
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            db_status = "connected"
            status_code = 200
        except Exception as exc:
            db_status = f"disconnected: {str(exc)}"
            status_code = 503

        return jsonify({
            "status": "healthy" if status_code == 200 else "unhealthy",
            "database": db_status,
            "message": "JNTU-GV SmartCampus System Backend is running!",
        }), status_code

    init_database(app)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
