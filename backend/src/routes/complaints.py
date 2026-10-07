# pyrefly: ignore [missing-import]
from flask import Blueprint, g, jsonify, request

from backend.middleware.auth_middleware import token_required
from backend.services import complaint_service
from backend.utils.decorators import student_required

complaints_bp = Blueprint("complaints", __name__)


@complaints_bp.route("/complaints", methods=["POST"])
@student_required
def create_complaint():
    """Lodge a new complaint with optional image attachment."""
    file = request.files.get("image")
    result, status_code = complaint_service.create_complaint(
        user=g.current_user,
        form_data=request.form,
        file=file,
    )
    return jsonify(result), status_code


@complaints_bp.route("/complaints", methods=["GET"])
@token_required()
def get_complaints():
    """List complaints matching role and optional search filters."""
    filters = {
        "status": request.args.get("status"),
        "category": request.args.get("category"),
        "priority": request.args.get("priority"),
    }
    result, status_code = complaint_service.get_complaints(g.current_user, filters)
    return jsonify(result), status_code


@complaints_bp.route("/complaints/<int:complaint_id>", methods=["GET"])
@token_required()
def get_complaint_details(complaint_id: int):
    """Fetch complaint timeline and resolution details."""
    result, status_code = complaint_service.get_complaint_details(complaint_id, g.current_user)
    return jsonify(result), status_code


@complaints_bp.route("/complaints/<int:complaint_id>", methods=["PUT"])
@token_required(allowed_roles=["staff", "admin"])
def update_complaint(complaint_id: int):
    """Update complaint status, technician assignments, or proof of work."""
    data = request.form.to_dict() if request.form else (request.get_json() or {})
    file = request.files.get("completion_image")
    result, status_code = complaint_service.update_complaint(
        complaint_id=complaint_id,
        user=g.current_user,
        data=data,
        file=file,
    )
    return jsonify(result), status_code


@complaints_bp.route("/complaints/<int:complaint_id>", methods=["DELETE"])
@token_required()
def delete_complaint(complaint_id: int):
    """Delete complaint and purge its associated media assets."""
    result, status_code = complaint_service.delete_complaint(complaint_id, g.current_user)
    return jsonify(result), status_code
