from datetime import datetime
from app.core.database import db

class AIAnalysis(db.Model):
    __tablename__ = 'ai_analysis'

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False)
    
    category = db.Column(db.String(100), nullable=True)
    subcategory = db.Column(db.String(100), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(50), nullable=True)
    urgency = db.Column(db.String(50), nullable=True)
    suggested_department = db.Column(db.String(100), nullable=True)
    keywords = db.Column(db.String(255), nullable=True)
    missing_information = db.Column(db.Text, nullable=True)
    recommended_action = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    is_duplicate = db.Column(db.Boolean, default=False)
    duplicate_of = db.Column(db.Integer, nullable=True)
    
    # New Quality Fields
    report_quality_status = db.Column(db.String(50), nullable=True)
    report_quality_reason = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaint = db.relationship('Complaint', back_populates='ai_analysis')

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'category': self.category,
            'subcategory': self.subcategory,
            'summary': self.summary,
            'severity': self.severity,
            'urgency': self.urgency,
            'suggested_department': self.suggested_department,
            'keywords': self.keywords,
            'missing_information': self.missing_information,
            'recommended_action': self.recommended_action,
            'confidence': self.confidence,
            'is_duplicate': self.is_duplicate,
            'duplicate_of': self.duplicate_of,
            'report_quality_status': self.report_quality_status,
            'report_quality_reason': self.report_quality_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
