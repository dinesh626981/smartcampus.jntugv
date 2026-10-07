# pyrefly: ignore [missing-import]
from flask import Blueprint, g, jsonify, request

from backend.services import feedback_service
from backend.utils.decorators import admin_required, student_required

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("/feedback", methods=["POST"])
@student_required
def submit_feedback():
    """Submit student rating and comment for a resolved complaint."""
    data = request.get_json() or {}
    result, status_code = feedback_service.submit_feedback(g.current_user, data)
    return jsonify(result), status_code


@feedback_bp.route("/feedback", methods=["GET"])
@admin_required
def get_all_feedback():
    """Admin review of all student feedback."""
    result, status_code = feedback_service.get_all_feedback()
    return jsonify(result), status_code
