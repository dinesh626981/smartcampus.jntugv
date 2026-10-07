import logging
from typing import Any, Dict, List, Tuple

from app.core.database import db
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.staff import Staff
from app.models.user import User
from app.utils.helpers import is_valid_email

logger = logging.getLogger(__name__)


def list_departments() -> List[Dict[str, Any]]:
    """Return all departments ordered by ID."""
    departments = Department.query.order_by(Department.id.asc()).all()
    return [dept.to_dict() for dept in departments]


def create_department(data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Register a new institutional department."""
    name = (data.get("department_name") or "").strip()
    code = (data.get("department_code") or "").strip().upper()
    description = (data.get("description") or "").strip()

    if not name or not code:
        return {"message": "Department name and code are required!"}, 400

    if Department.query.filter_by(department_name=name).first():
        return {"message": "Department with this name already exists!"}, 409

    if Department.query.filter_by(department_code=code).first():
        return {"message": "Department with this code already exists!"}, 409

    dept = Department(
        department_name=name,
        department_code=code,
        description=description or None,
    )
    try:
        db.session.add(dept)
        db.session.commit()
        return {
            "message": "Department created successfully!",
            "department": dept.to_dict(),
        }, 201
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to create department: %s", e)
        return {"message": f"Failed to create department: {str(e)}"}, 500


def delete_department(dept_id: int) -> Tuple[Dict[str, Any], int]:
    """Delete department if no active staff or complaints are linked."""
    dept = Department.query.get(dept_id)
    if not dept:
        return {"message": "Department not found!"}, 404

    active_complaints = Complaint.query.filter_by(department_id=dept_id).count()
    if active_complaints > 0:
        return {
            "message": f"Cannot delete department. {active_complaints} complaint(s) are associated with it."
        }, 409

    active_staff = Staff.query.filter_by(department_id=dept_id).count()
    if active_staff > 0:
        return {
            "message": f"Cannot delete department. {active_staff} staff member(s) are associated with it."
        }, 409

    try:
        db.session.delete(dept)
        db.session.commit()
        return {"message": "Department deleted successfully!"}, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to delete department: {str(e)}"}, 500


def list_students(search_query: str = "") -> List[Dict[str, Any]]:
    """List registered students with optional search filter."""
    query = User.query.filter_by(role="student")
    if search_query:
        term = f"%{search_query.strip()}%"
        query = query.filter(
            (User.name.ilike(term))
            | (User.email.ilike(term))
            | (User.registration_number.ilike(term))
        )
    students = query.order_by(User.created_at.desc()).all()
    return [s.to_dict() for s in students]


def list_admins() -> List[Dict[str, Any]]:
    """List system administrators."""
    admins = User.query.filter_by(role="admin").order_by(User.id.asc()).all()
    return [a.to_dict() for a in admins]


def list_staff() -> List[Dict[str, Any]]:
    """List staff profiles with department relations."""
    staff_members = Staff.query.all()
    return [s.to_dict() for s in staff_members]


def create_staff_member(data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Provision a new staff account and link the staff profile."""
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    department_id = data.get("department_id")
    designation = (data.get("designation") or "Technician").strip()

    if not name or not email or not password or not department_id:
        return {"message": "Name, email, password, and department are required!"}, 400

    if not is_valid_email(email):
        return {"message": "Invalid email address format!"}, 400

    if User.query.filter_by(email=email).first():
        return {"message": "User with this email already exists!"}, 409

    if phone and User.query.filter_by(phone=phone).first():
        return {"message": "User with this phone number already exists!"}, 409

    dept = Department.query.get(department_id)
    if not dept:
        return {"message": "Invalid department selected!"}, 404

    user = User(
        name=name,
        email=email,
        phone=phone or None,
        role="staff",
        department_id=dept.id,
        department=dept.department_name,
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.flush()

        staff_record = Staff(
            user_id=user.id,
            department_id=dept.id,
            designation=designation,
        )
        db.session.add(staff_record)
        db.session.commit()

        return {
            "message": "Staff member created successfully!",
            "staff": staff_record.to_dict(),
        }, 201
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to create staff member: %s", e)
        return {"message": f"Failed to create staff member: {str(e)}"}, 500
