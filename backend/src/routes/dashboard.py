# pyrefly: ignore [missing-import]
from flask import Blueprint, g, jsonify

from backend.middleware.auth_middleware import token_required
from backend.services import dashboard_service

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard", methods=["GET"])
@token_required()
def get_dashboard_data():
    """Retrieve role-specific dashboard metrics and feeds."""
    user = g.current_user
    if user.role == "student":
        data = dashboard_service.get_student_dashboard_data(user)
    elif user.role == "staff":
        data = dashboard_service.get_staff_dashboard_data(user)
    else:
        data = dashboard_service.get_admin_dashboard_data()

    return jsonify(data), 200
