from datetime import datetime
from typing import Any, Dict, Optional
from werkzeug.security import check_password_hash, generate_password_hash
from app.core.database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'admin', 'staff'
    registration_number = db.Column(db.String(50), unique=True, index=True, nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    google_sub = db.Column(db.String(255), unique=True, index=True, nullable=True)
    auth_provider_last = db.Column(db.String(20), default="password", nullable=True)
    profile_photo_url = db.Column(db.String(500), nullable=True)
    profile_photo_public_id = db.Column(db.String(255), nullable=True)
    profile_photo_bytes = db.Column(db.Integer, default=0, nullable=True)
    profile_photo_updated_at = db.Column(db.DateTime, nullable=True)
    profile_photo_source = db.Column(db.String(30), nullable=True)
    photo_import_declined = db.Column(db.Boolean, default=False, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    department_ref = db.relationship("Department", foreign_keys=[department_id])
    complaints = db.relationship("Complaint", back_populates="student", foreign_keys="Complaint.student_id")
    staff_profile = db.relationship("Staff", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        """Hash and persist user password."""
        self.password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify candidate password against hash."""
        return check_password_hash(self.password, password)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize user model to response dictionary."""
        dept_name: Optional[str] = None
        if self.department_ref:
            dept_name = self.department_ref.department_name
        elif self.department:
            dept_name = self.department

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "registration_number": self.registration_number,
            "department_id": self.department_id,
            "department": dept_name,
            "department_name": dept_name,
            "google_sub": self.google_sub,
            "auth_provider_last": self.auth_provider_last or "password",
            "profile_photo_url": self.profile_photo_url,
            "profile_photo_public_id": self.profile_photo_public_id,
            "profile_photo_bytes": self.profile_photo_bytes or 0,
            "profile_photo_updated_at": (
                self.profile_photo_updated_at.isoformat()
                if self.profile_photo_updated_at
                else None
            ),
            "profile_photo_source": self.profile_photo_source,
            "photo_import_declined": bool(self.photo_import_declined),
            "profile_incomplete": bool(self.role == "student" and not self.registration_number),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
