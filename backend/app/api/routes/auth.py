from flask import Blueprint, g, jsonify, request

from app.middleware.auth_middleware import token_required
from app.models.department import Department
from app.services import auth_service
from app.api.dependencies import authenticated, student_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/departments", methods=["GET"])
def get_public_departments():
    """Return all active academic departments for registration forms."""
    departments = Department.query.order_by(Department.id.asc()).all()
    return jsonify([d.to_dict() for d in departments]), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register student or staff user."""
    data = request.get_json() or {}
    result, status_code = auth_service.register_user(data)
    return jsonify(result), status_code


@auth_bp.route("/register-admin", methods=["POST"])
def register_admin():
    """Register administrator using secret key."""
    data = request.get_json() or {}
    result, status_code = auth_service.register_user(data, forced_role="admin")
    return jsonify(result), status_code


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate via email or phone with password."""
    data = request.get_json() or {}
    identifier = data.get("identifier") or data.get("email") or data.get("phone")
    password = data.get("password")
    result, status_code = auth_service.authenticate_user(identifier, password)
    return jsonify(result), status_code


@auth_bp.route("/auth/google", methods=["POST"])
def google_auth():
    """Verify Google OAuth2 ID Token and log in registered user."""
    data = request.get_json() or {}
    credential = data.get("credential")
    ip_address = request.remote_addr or "127.0.0.1"
    result, status_code = auth_service.authenticate_google_token(credential, ip_address)
    return jsonify(result), status_code


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Trigger temporary password generation and email dispatch."""
    data = request.get_json() or {}
    email = data.get("email")
    result, status_code = auth_service.initiate_password_reset(email)
    return jsonify(result), status_code

