from datetime import datetime
from typing import Any, Dict
from app.core.database import db


class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(20), nullable=False)  # 'Low', 'Medium', 'High'
    image = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    image_public_id = db.Column(db.String(255), nullable=True)
    image_bytes = db.Column(db.Integer, nullable=True, default=0)
    image_deleted_at = db.Column(db.DateTime, nullable=True)

    completion_image = db.Column(db.String(255), nullable=True)
    completion_image_url = db.Column(db.String(500), nullable=True)
    completion_image_public_id = db.Column(db.String(255), nullable=True)
    completion_image_bytes = db.Column(db.Integer, nullable=True, default=0)
    completion_image_deleted_at = db.Column(db.DateTime, nullable=True)

    status = db.Column(db.String(20), default="Pending")  # 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    assigned_staff = db.Column(db.Integer, db.ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    resolution_remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = db.relationship("User", back_populates="complaints", foreign_keys=[student_id])
    department = db.relationship("Department", back_populates="complaints")
    assigned_staff_rel = db.relationship("Staff", back_populates="assigned_complaints", foreign_keys=[assigned_staff])
    feedbacks = db.relationship("Feedback", back_populates="complaint", cascade="all, delete-orphan")
    ai_analysis = db.relationship("AIAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        """Serialize complaint model to response dictionary."""
        student_dept = None
        if self.student:
            student_dept = (
                self.student.department_ref.department_name
                if self.student.department_ref
                else self.student.department
            )

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "location": self.location,
            "priority": self.priority,
            "image": self.image,
            "image_url": self.image_url,
            "image_public_id": self.image_public_id,
            "image_bytes": self.image_bytes,
            "image_deleted_at": self.image_deleted_at.isoformat() if self.image_deleted_at else None,
            "completion_image": self.completion_image,
            "completion_image_url": self.completion_image_url,
            "completion_image_public_id": self.completion_image_public_id,
            "completion_image_bytes": self.completion_image_bytes,
            "completion_image_deleted_at": self.completion_image_deleted_at.isoformat() if self.completion_image_deleted_at else None,
            "status": self.status,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else None,
            "student_email": self.student.email if self.student else None,
            "student_phone": self.student.phone if self.student else None,
            "student_profile_photo_url": self.student.profile_photo_url if self.student else None,
            "student_registration_number": self.student.registration_number if self.student else None,
            "student_department": student_dept,
            "department_id": self.department_id,
            "department_name": self.department.department_name if self.department else None,
            "assigned_staff": self.assigned_staff,
            "assigned_staff_name": (
                self.assigned_staff_rel.user.name
                if (self.assigned_staff_rel and self.assigned_staff_rel.user)
                else None
            ),
            "assigned_staff_profile_photo_url": (
                self.assigned_staff_rel.user.profile_photo_url
                if (self.assigned_staff_rel and self.assigned_staff_rel.user)
                else None
            ),
            "resolution_remarks": self.resolution_remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "ai_analysis": self.ai_analysis.to_dict() if self.ai_analysis else None,
        }
