from datetime import datetime
from app.core.database import db

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaint = db.relationship('Complaint', back_populates='feedbacks')

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'complaint_title': self.complaint.title if self.complaint else None,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
