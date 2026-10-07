# pyrefly: ignore [missing-import]
from flask import Blueprint, jsonify, request

from backend.services import report_service
from backend.utils.decorators import admin_required

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports", methods=["GET"])
@admin_required
def get_reports():
    """Retrieve statistical aggregations or download CSV export."""
    if request.args.get("format") == "csv":
        return report_service.generate_csv_report()

    data = report_service.get_reports_data()
    return jsonify(data), 200
