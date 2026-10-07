from flask import Blueprint, g, jsonify, request

from app.infrastructure import storage_service
from app.api.dependencies import admin_required

storage_bp = Blueprint("storage", __name__)


@storage_bp.route("/admin/storage/usage", methods=["GET"])
@storage_bp.route("/storage-usage", methods=["GET"])
@admin_required
def get_storage_usage():
    """Retrieve Cloudinary quota metrics and usage percentage."""
    result, status_code = storage_service.get_storage_usage()
    return jsonify(result), status_code


@storage_bp.route("/admin/storage/preview", methods=["GET", "POST"])
@storage_bp.route("/cleanup/preview", methods=["GET", "POST"])
@admin_required
def preview_cleanup():
    """Compute candidates and reclaimable bytes for resolved complaints."""
    data = request.get_json(silent=True) or {}
    retention_days = int(request.args.get("retention_days") or data.get("days") or data.get("retention_days") or 30)
    result, status_code = storage_service.preview_cleanup(retention_days)
    return jsonify(result), status_code


@storage_bp.route("/admin/storage/cleanup", methods=["POST"])
@storage_bp.route("/cleanup/execute", methods=["POST"])
@admin_required
def execute_cleanup():
    """Batch delete images of resolved complaints older than retention period."""
    data = request.get_json() or {}
    retention_days = int(data.get("retention_days") or data.get("days") or 30)
    confirmation = data.get("confirmation") or data.get("confirm") or ""
    admin_id = getattr(g.current_user, "id", None)
    result, status_code = storage_service.execute_cleanup(
        retention_days=retention_days,
        confirmation=confirmation,
        admin_id=admin_id,
    )
    return jsonify(result), status_code


@storage_bp.route("/admin/storage/logs", methods=["GET"])
@storage_bp.route("/cleanup/logs", methods=["GET"])
@admin_required
def get_cleanup_logs():
    """Return historical audit log records of previous cleanups."""
    logs = storage_service.get_cleanup_logs()
    return jsonify({"logs": logs}), 200


@storage_bp.route("/admin/storage/backup", methods=["GET", "POST"])
@storage_bp.route("/cleanup/backup", methods=["GET", "POST"])
@admin_required
def backup_cleanup_images():
    """Stream downloadable ZIP archive of candidate images before purge."""
    data = request.get_json(silent=True) or {}
    retention_days = int(request.args.get("retention_days") or data.get("days") or data.get("retention_days") or 30)
    return storage_service.generate_backup_zip(retention_days)
