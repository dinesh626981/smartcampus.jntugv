from flask import Blueprint, g, jsonify, request

from app.middleware.auth_middleware import token_required
from app.services import auth_service
from app.api.dependencies import student_required

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET"])
@token_required()
def get_profile():
    """Return current authenticated user profile."""
    return jsonify({"user": g.current_user.to_dict()}), 200


@profile_bp.route("/profile", methods=["PUT"])
@token_required()
def update_profile():
    """Update profile attributes."""
    data = request.get_json() or {}
    result, status_code = auth_service.update_profile(g.current_user, data)
    return jsonify(result), status_code


@profile_bp.route("/profile/academic", methods=["PUT"])
@student_required
def update_academic():
    """Update student academic credentials."""
    data = request.get_json() or {}
    result, status_code = auth_service.update_academic_profile(g.current_user, data)
    return jsonify(result), status_code


@profile_bp.route("/profile/link-google", methods=["POST"])
@token_required()
def link_google():
    """Link Google Identity account."""
    data = request.get_json() or {}
    credential = data.get("credential")
    result, status_code = auth_service.link_google_account(g.current_user, credential)
    return jsonify(result), status_code


@profile_bp.route("/profile/unlink-google", methods=["POST"])
@token_required()
def unlink_google():
    """Unlink Google Identity account."""
    result, status_code = auth_service.unlink_google_account(g.current_user)
    return jsonify(result), status_code


@profile_bp.route("/profile/photo", methods=["POST"])
@token_required()
def upload_photo():
    """Upload user profile photo."""
    file = request.files.get("photo")
    result, status_code = auth_service.save_user_profile_photo(g.current_user, file)
    return jsonify(result), status_code


@profile_bp.route("/profile/photo", methods=["DELETE"])
@token_required()
def delete_photo():
    """Delete user profile photo."""
    result, status_code = auth_service.remove_user_profile_photo(g.current_user)
    return jsonify(result), status_code
