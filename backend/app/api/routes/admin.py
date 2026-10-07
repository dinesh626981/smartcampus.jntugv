from flask import Blueprint, jsonify, request

from app.services import admin_service
from app.api.dependencies import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/departments", methods=["GET"])
@admin_required
def get_departments():
    """List all departments."""
    departments = admin_service.list_departments()
    return jsonify(departments), 200


@admin_bp.route("/admin/departments", methods=["POST"])
@admin_required
def create_department():
    """Create a new department."""
    data = request.get_json() or {}
    result, status_code = admin_service.create_department(data)
    return jsonify(result), status_code


@admin_bp.route("/admin/departments/<int:dept_id>", methods=["DELETE"])
@admin_required
def delete_department(dept_id: int):
    """Delete department if not linked to active complaints or staff."""
    result, status_code = admin_service.delete_department(dept_id)
    return jsonify(result), status_code


@admin_bp.route("/admin/students", methods=["GET"])
@admin_required
def get_students():
    """List registered students with optional search filter."""
    search = request.args.get("search", "")
    students = admin_service.list_students(search)
    return jsonify({"students": students}), 200


@admin_bp.route("/admin/admins", methods=["GET"])
@admin_required
def get_admins():
    """List system administrators."""
    admins = admin_service.list_admins()
    return jsonify({"admins": admins}), 200


@admin_bp.route("/admin/staff", methods=["GET"])
@admin_required
def get_staff():
    """List all staff technicians and designations."""
    staff = admin_service.list_staff()
    return jsonify({"staff": staff}), 200


@admin_bp.route("/admin/staff/create", methods=["POST"])
@admin_required
def create_staff():
    """Provision a new department staff account."""
    data = request.get_json() or {}
    result, status_code = admin_service.create_staff_member(data)
    return jsonify(result), status_code
