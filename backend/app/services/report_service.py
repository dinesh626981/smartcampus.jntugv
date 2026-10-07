import csv
import io
from typing import Any, Dict

from flask import Response
from sqlalchemy import func

from app.core.database import db
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.feedback import Feedback
from app.models.staff import Staff
from app.models.user import User


def get_reports_data() -> Dict[str, Any]:
    """Compile aggregated metrics, department performance, and satisfaction rates."""
    status_counts = (
        db.session.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )
    status_dict = {
        "Pending": 0,
        "Assigned": 0,
        "In Progress": 0,
        "Resolved": 0,
        "Closed": 0,
    }
    for status, count in status_counts:
        if status:
            status_dict[status] = count

    category_counts = (
        db.session.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    category_dict = {cat or "Uncategorized": count for cat, count in category_counts if cat is not None}

    dept_counts = (
        db.session.query(Department.department_name, func.count(Complaint.id))
        .join(Complaint, Department.id == Complaint.department_id, isouter=True)
        .group_by(Department.department_name)
        .all()
    )
    dept_dict = {dept_name or "General": count for dept_name, count in dept_counts if dept_name}

    # Cross-database monthly trend aggregation (supports MySQL, SQLite, PostgreSQL)
    monthly_dict = {}
    try:
        dialect_name = db.engine.dialect.name
        if dialect_name == "sqlite":
            month_col = func.strftime("%Y-%m", Complaint.created_at).label("month")
        elif dialect_name == "postgresql":
            month_col = func.to_char(Complaint.created_at, "YYYY-MM").label("month")
        else:  # MySQL, MariaDB, etc.
            month_col = func.date_format(Complaint.created_at, "%Y-%m").label("month")

        monthly_counts = (
            db.session.query(month_col, func.count(Complaint.id))
            .filter(Complaint.created_at.isnot(None))
            .group_by("month")
            .order_by("month")
            .limit(12)
            .all()
        )
        monthly_dict = {str(month): count for month, count in monthly_counts if month}
    except Exception:
        # Fallback to python-level datetime aggregation
        try:
            complaint_dates = db.session.query(Complaint.created_at).filter(Complaint.created_at.isnot(None)).all()
            for (c_date,) in complaint_dates:
                if c_date:
                    m = c_date.strftime("%Y-%m")
                    monthly_dict[m] = monthly_dict.get(m, 0) + 1
        except Exception:
            monthly_dict = {}

    avg_rating_query = db.session.query(func.avg(Feedback.rating)).first()
    average_rating = (
        round(float(avg_rating_query[0]), 2)
        if avg_rating_query and avg_rating_query[0] is not None
        else 0.0
    )

    dept_ratings = (
        db.session.query(
            Department.department_name,
            func.avg(Feedback.rating).label("avg_rating"),
        )
        .join(Complaint, Department.id == Complaint.department_id)
        .join(Feedback, Complaint.id == Feedback.complaint_id)
        .group_by(Department.department_name)
        .all()
    )
    dept_ratings_dict = {
        name: round(float(avg), 2) for name, avg in dept_ratings if name and avg is not None
    }

    return {
        "status_distribution": status_dict,
        "status_summary": status_dict,
        "category_distribution": category_dict,
        "category_summary": category_dict,
        "department_distribution": dept_dict,
        "department_summary": dept_dict,
        "monthly_trend": monthly_dict,
        "average_feedback_rating": average_rating,
        "average_rating": average_rating,
        "department_ratings": dept_ratings_dict,
    }


def generate_csv_report() -> Response:
    """Generate CSV export of all complaints with full audit trail."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Complaint ID",
        "Title",
        "Category",
        "Location",
        "Priority",
        "Status",
        "Student Name",
        "Student Email",
        "Department",
        "Assigned Staff",
        "Created At",
        "Updated At",
        "Feedback Rating",
        "Feedback Comment",
    ])

    complaints = Complaint.query.order_by(Complaint.id.asc()).all()

    for c in complaints:
        student = User.query.get(c.student_id) if c.student_id else None
        student_name = student.name if student else "N/A"
        student_email = student.email if student else "N/A"

        dept = Department.query.get(c.department_id) if c.department_id else None
        dept_name = dept.department_name if dept else "N/A"

        staff_name = "Unassigned"
        if c.assigned_staff:
            staff_record = Staff.query.get(c.assigned_staff)
            if staff_record and staff_record.user:
                staff_name = staff_record.user.name

        feedback = Feedback.query.filter_by(complaint_id=c.id).first()
        feedback_rating = feedback.rating if feedback else "No feedback"
        feedback_comment = feedback.comment if feedback else ""

        writer.writerow([
            c.id,
            c.title,
            c.category,
            c.location,
            c.priority,
            c.status,
            student_name,
            student_email,
            dept_name,
            staff_name,
            c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "",
            c.updated_at.strftime("%Y-%m-%d %H:%M:%S") if c.updated_at else "",
            feedback_rating,
            feedback_comment,
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=complaints_report.csv"},
    )
