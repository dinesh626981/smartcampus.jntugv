import logging
import os
from typing import Any, Dict, Optional, Tuple

from flask import current_app

from app.core.database import db
from app.models.ai_analysis import AIAnalysis
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.notification import Notification
from app.models.staff import Staff
from app.models.user import User
from app.infrastructure.email_service import send_admin_work_completed_email, send_complaint_status_email
from app.infrastructure.llm_service import LLMService
from app.utils.helpers import is_allowed_file
from app.services.image_service import delete_image, upload_image

logger = logging.getLogger(__name__)


def create_complaint(
    user: User,
    form_data: Dict[str, Any],
    file: Optional[Any] = None,
) -> Tuple[Dict[str, Any], int]:
    """Create a new student complaint with optional image upload and AI categorization."""
    title = (form_data.get("title") or "").strip()
    description = (form_data.get("description") or "").strip()
    category = (form_data.get("category") or "").strip()
    location = (form_data.get("location") or "").strip()
    priority = (form_data.get("priority") or "Medium").strip()

    if not title or not description or not category or not location:
        return {"message": "Missing title, description, category, or location!"}, 400

    image_info = None
    if file and file.filename != "":
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        max_size = current_app.config.get("MAX_CONTENT_LENGTH", 15 * 1024 * 1024)
        if file_size > max_size:
            return {"message": f"Image file is too large! Maximum limit is {max_size // (1024 * 1024)}MB."}, 400

        if not is_allowed_file(file.filename):
            return {"message": "Invalid image extension! Allowed: png, jpg, jpeg, webp."}, 400

        try:
            image_info = upload_image(file, folder="complaints/before")
            if not image_info:
                return {"message": "Image upload failed. Please try again."}, 500
        except Exception as img_err:
            logger.exception("Image upload error: %s", img_err)
            return {"message": f"Image upload failed: {str(img_err)}"}, 400

    # Auto-resolve department from category
    dept = Department.query.filter(Department.department_name.ilike(f"%{category}%")).first()
    department_id = dept.id if dept else None

    image_url = None
    image_public_id = None
    if image_info:
        image_url = image_info.get("secure_url") or image_info.get("url")
        image_public_id = image_info.get("public_id")

    new_complaint = Complaint(
        title=title,
        description=description,
        category=category,
        location=location,
        priority=priority,
        student_id=user.id,
        department_id=department_id,
        image_url=image_url,
        image_public_id=image_public_id,
    )

    try:
        db.session.add(new_complaint)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to save complaint: %s", e)
        return {"message": f"Failed to submit complaint: {str(e)}"}, 500

    # Trigger asynchronous or best-effort AI categorization
    try:
        analysis = LLMService.analyze_issue(description)
        if analysis and isinstance(analysis, dict):
            ai_record = AIAnalysis(
                complaint_id=new_complaint.id,
                category_predicted=analysis.get("category"),
                priority_recommended=analysis.get("priority"),
                urgency_score=analysis.get("urgency_score", 5),
                summary=analysis.get("summary"),
                suggested_solution=analysis.get("suggested_solution"),
            )
            db.session.add(ai_record)
            db.session.commit()
    except Exception as e:
        logger.warning("AI analysis failed for complaint %s: %s", new_complaint.id, e)

    # Dispatch confirmation email
    try:
        send_complaint_status_email(
            recipient_email=user.email,
            recipient_name=user.name,
            complaint_id=new_complaint.id,
            complaint_title=new_complaint.title,
            new_status=new_complaint.status,
        )
    except Exception as e:
        logger.warning("Confirmation email failed for complaint %s: %s", new_complaint.id, e)

    return {
        "message": "Complaint submitted successfully!",
        "complaint": new_complaint.to_dict(),
    }, 201


def get_complaints(user: User, filters: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Retrieve filtered complaints based on requesting user role."""
    query = Complaint.query

    if user.role == "student":
        query = query.filter_by(student_id=user.id)
    elif user.role == "staff":
        staff_profile = Staff.query.filter_by(user_id=user.id).first()
        if staff_profile:
            query = query.filter(
                (Complaint.assigned_staff == staff_profile.id)
                | (Complaint.department_id == staff_profile.department_id)
            )
        else:
            return {"complaints": []}, 200

    status = filters.get("status")
    category = filters.get("category")
    priority = filters.get("priority")

    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    if priority:
        query = query.filter_by(priority=priority)

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return {"complaints": [c.to_dict() for c in complaints]}, 200


def get_complaint_details(complaint_id: int, user: User) -> Tuple[Dict[str, Any], int]:
    """Fetch complaint details ensuring role-based access authorization."""
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return {"message": "Complaint not found!"}, 404

    if user.role == "student" and complaint.student_id != user.id:
        return {"message": "Unauthorized access to this complaint!"}, 403

    if user.role == "staff":
        staff_profile = Staff.query.filter_by(user_id=user.id).first()
        if not staff_profile or (
            complaint.assigned_staff != staff_profile.id
            and complaint.department_id != staff_profile.department_id
        ):
            return {"message": "Unauthorized access to this complaint!"}, 403

    return {"complaint": complaint.to_dict()}, 200


def update_complaint(
    complaint_id: int,
    user: User,
    data: Dict[str, Any],
    file: Optional[Any] = None,
) -> Tuple[Dict[str, Any], int]:
    """Update complaint status, staff assignment, resolution remarks, or proof image."""
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return {"message": "Complaint not found!"}, 404

    if user.role == "student":
        return {"message": "Students cannot update complaint status!"}, 403

    previous_status = complaint.status
    new_status = data.get("status")
    assigned_staff_id = data.get("assigned_staff")
    remarks = data.get("resolution_remarks") or data.get("admin_remarks")
    department_id = data.get("department_id")
    priority = data.get("priority")

    # Staff can only update their assigned tickets or departmental tickets
    if user.role == "staff":
        staff_profile = Staff.query.filter_by(user_id=user.id).first()
        if not staff_profile or (
            complaint.assigned_staff != staff_profile.id
            and complaint.department_id != staff_profile.department_id
        ):
            return {"message": "You are not authorized to update this complaint!"}, 403

    # Handle completion proof image upload
    if file and file.filename != "":
        if not is_allowed_file(file.filename):
            return {"message": "Invalid image extension! Allowed: png, jpg, jpeg."}, 400

        proof_info = upload_image(file, folder="complaints/proof")
        if proof_info:
            complaint.completion_image_url = proof_info["secure_url"]
            complaint.completion_image_public_id = proof_info["public_id"]

    if new_status:
        complaint.status = new_status
    if remarks is not None:
        complaint.resolution_remarks = remarks
    if priority and user.role == "admin":
        complaint.priority = priority
    if department_id and user.role == "admin":
        complaint.department_id = department_id

    if assigned_staff_id is not None and user.role == "admin":
        complaint.assigned_staff = assigned_staff_id if assigned_staff_id != "" else None
        if complaint.assigned_staff and complaint.status == "Pending":
            complaint.status = "Assigned"

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to update complaint %s: %s", complaint_id, e)
        return {"message": f"Failed to update complaint: {str(e)}"}, 500

    # Notifications & status emails
    if new_status and new_status != previous_status:
        try:
            student = User.query.get(complaint.student_id)
            if student:
                notif = Notification(
                    user_id=student.id,
                    target_role="student",
                    title="Complaint Status Updated",
                    message=f"Your complaint '{complaint.title}' has been updated to {complaint.status}.",
                    complaint_id=complaint.id,
                )
                db.session.add(notif)
                db.session.commit()
                send_complaint_status_email(
                    recipient_email=student.email,
                    recipient_name=student.name,
                    complaint_id=complaint.id,
                    complaint_title=complaint.title,
                    new_status=complaint.status,
                )
        except Exception as e:
            logger.warning("Failed sending student update notice: %s", e)

        # Notify admins when staff marks work resolved
        if user.role == "staff" and new_status in ["Resolved", "Closed"]:
            try:
                admins = User.query.filter_by(role="admin").all()
                for adm in admins:
                    notif = Notification(
                        user_id=adm.id,
                        target_role="admin",
                        title="Work Completed by Staff",
                        message=f"Staff member {user.name} resolved complaint #{complaint.id} ('{complaint.title}').",
                        complaint_id=complaint.id,
                    )
                    db.session.add(notif)
                    send_admin_work_completed_email(
                        admin_email=adm.email,
                        admin_name=adm.name,
                        complaint_id=complaint.id,
                        complaint_title=complaint.title,
                        staff_name=user.name,
                    )
                db.session.commit()
            except Exception as e:
                logger.warning("Failed notifying admins of completion: %s", e)

    return {
        "message": "Complaint updated successfully!",
        "complaint": complaint.to_dict(),
    }, 200


def delete_complaint(complaint_id: int, user: User) -> Tuple[Dict[str, Any], int]:
    """Delete a complaint and purge related complaint images from Cloudinary."""
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return {"message": "Complaint not found!"}, 404

    if user.role != "admin" and complaint.student_id != user.id:
        return {"message": "You are not authorized to delete this complaint!"}, 403

    # Delete images safely (allow-list guards enforce complaints/* prefix only)
    if complaint.image_public_id:
        try:
            delete_image(complaint.image_public_id)
        except Exception as e:
            logger.warning("Failed deleting complaint image %s: %s", complaint.image_public_id, e)

    if complaint.completion_image_public_id:
        try:
            delete_image(complaint.completion_image_public_id)
        except Exception as e:
            logger.warning("Failed deleting completion proof %s: %s", complaint.completion_image_public_id, e)

    try:
        db.session.delete(complaint)
        db.session.commit()
        return {"message": "Complaint deleted successfully!"}, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to delete complaint: {str(e)}"}, 500
