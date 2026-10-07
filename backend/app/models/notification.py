from datetime import datetime
from app.core.database import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True) # None = role-based broadcast
    target_role = db.Column(db.String(20), nullable=True) # 'admin', 'staff', 'student'
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='SET NULL'), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaint = db.relationship('Complaint', foreign_keys=[complaint_id], backref=db.backref('notifications', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'target_role': self.target_role,
            'title': self.title,
            'message': self.message,
            'complaint_id': self.complaint_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'timestamp': self.created_at.isoformat() if self.created_at else None
        }
