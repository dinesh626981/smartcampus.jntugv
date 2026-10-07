from typing import Any, Dict

from sqlalchemy import func

from app.core.database import db
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.notification import Notification
from app.models.staff import Staff
from app.models.user import User


def get_student_dashboard_data(user: User) -> Dict[str, Any]:
    """Compile student metric cards, recent submissions, and notifications."""
    total = Complaint.query.filter_by(student_id=user.id).count()
    pending = Complaint.query.filter_by(student_id=user.id).filter(
        Complaint.status.in_(["Pending", "Assigned", "In Progress"])
    ).count()
    resolved = Complaint.query.filter_by(student_id=user.id, status="Resolved").count()
    closed = Complaint.query.filter_by(student_id=user.id, status="Closed").count()

    recent_complaints = (
        Complaint.query.filter_by(student_id=user.id)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )

    db_notifs = (
        Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.target_role == "student")
        )
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )
    notifications = [n.to_dict() for n in db_notifs]

    if not notifications:
        updated_complaints = (
            Complaint.query.filter_by(student_id=user.id)
            .filter(Complaint.status != "Pending")
            .order_by(Complaint.updated_at.desc())
            .limit(5)
            .all()
        )
        for c in updated_complaints:
            notifications.append({
                "id": c.id,
                "title": "Complaint Updated",
                "message": f"Your complaint '{c.title}' is now '{c.status}'.",
                "timestamp": c.updated_at.isoformat() if c.updated_at else None,
            })

    if not notifications:
        notifications.append({
            "id": 0,
            "title": "Welcome to JNTU-GV SmartCampus System",
            "message": "You can raise college-related issues online and track their status in real-time.",
            "timestamp": user.created_at.isoformat() if user.created_at else None,
        })

    return {
        "stats": {
            "total_complaints": total,
            "pending_complaints": pending,
            "resolved_complaints": resolved,
            "closed_complaints": closed,
        },
        "recent_complaints": [c.to_dict() for c in recent_complaints],
        "notifications": notifications,
    }


def get_staff_dashboard_data(user: User) -> Dict[str, Any]:
    """Compile technician workload metrics, assigned task queues, and department logs."""
    staff_profile = Staff.query.filter_by(user_id=user.id).first()
    if not staff_profile:
        return {
            "stats": {"assigned_to_me": 0, "in_progress": 0, "resolved_by_me": 0, "department_total": 0},
            "assigned_complaints": [],
            "department_complaints": [],
            "notifications": [],
        }

    my_assigned = Complaint.query.filter_by(assigned_staff=staff_profile.id).count()
    my_in_progress = Complaint.query.filter_by(assigned_staff=staff_profile.id, status="In Progress").count()
    my_resolved = Complaint.query.filter_by(assigned_staff=staff_profile.id, status="Resolved").count()
    dept_total = Complaint.query.filter_by(department_id=staff_profile.department_id).count()

    assigned_complaints = (
        Complaint.query.filter_by(assigned_staff=staff_profile.id)
        .order_by(Complaint.created_at.desc())
        .limit(10)
        .all()
    )

    department_complaints = (
        Complaint.query.filter_by(department_id=staff_profile.department_id)
        .filter(Complaint.assigned_staff.is_(None))
        .order_by(Complaint.created_at.desc())
        .limit(10)
        .all()
    )

    db_notifs = (
        Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.target_role == "staff")
        )
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "stats": {
            "assigned_to_me": my_assigned,
            "in_progress": my_in_progress,
            "resolved_by_me": my_resolved,
            "department_total": dept_total,
        },
        "assigned_complaints": [c.to_dict() for c in assigned_complaints],
        "department_complaints": [c.to_dict() for c in department_complaints],
        "notifications": [n.to_dict() for n in db_notifs],
    }


def get_admin_dashboard_data() -> Dict[str, Any]:
    """Compile campus-wide metrics, department distribution, and recent queue entries."""
    total_complaints = Complaint.query.count()
    pending = Complaint.query.filter_by(status="Pending").count()
    in_progress = Complaint.query.filter(Complaint.status.in_(["Assigned", "In Progress"])).count()
    resolved = Complaint.query.filter_by(status="Resolved").count()
    closed = Complaint.query.filter_by(status="Closed").count()

    total_students = User.query.filter_by(role="student").count()
    total_staff = Staff.query.count()
    total_departments = Department.query.count()

    recent_complaints = Complaint.query.order_by(Complaint.created_at.desc()).limit(10).all()

    category_counts = (
        db.session.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    categories_distribution = {cat: count for cat, count in category_counts}

    dept_counts = (
        db.session.query(Department.department_name, func.count(Complaint.id))
        .join(Complaint, Department.id == Complaint.department_id, isouter=True)
        .group_by(Department.department_name)
        .all()
    )
    department_distribution = {dept: count for dept, count in dept_counts}

    db_notifs = (
        Notification.query.filter(
            (Notification.target_role == "admin") | (Notification.target_role.is_(None))
        )
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "stats": {
            "total_complaints": total_complaints,
            "pending_complaints": pending,
            "in_progress_complaints": in_progress,
            "resolved_complaints": resolved,
            "closed_complaints": closed,
            "total_students": total_students,
            "total_staff": total_staff,
            "total_departments": total_departments,
        },
        "recent_complaints": [c.to_dict() for c in recent_complaints],
        "categories_distribution": categories_distribution,
        "department_distribution": department_distribution,
        "notifications": [n.to_dict() for n in db_notifs],
    }
