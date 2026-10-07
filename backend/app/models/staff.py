from app.core.database import db

class Staff(db.Model):
    __tablename__ = 'staff'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='staff_profile')
    department = db.relationship('Department', back_populates='staff_members')
    assigned_complaints = db.relationship('Complaint', back_populates='assigned_staff_rel', foreign_keys='Complaint.assigned_staff')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'department_id': self.department_id,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'profile_photo_url': self.user.profile_photo_url if self.user else None,
            'department_name': self.department.department_name if self.department else None
        }
