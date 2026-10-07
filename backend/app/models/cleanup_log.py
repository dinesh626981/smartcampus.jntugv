from datetime import datetime
from app.core.database import db

class CleanupLog(db.Model):
    __tablename__ = 'cleanup_logs'

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    filter_days = db.Column(db.Integer, nullable=False)
    deleted_count = db.Column(db.Integer, nullable=False, default=0)
    reclaimed_bytes = db.Column(db.BigInteger, nullable=False, default=0)
    status = db.Column(db.String(20), default='completed')  # 'completed', 'failed', 'partial'
    details = db.Column(db.Text, nullable=True)

    # Relationships
    admin = db.relationship('User', foreign_keys=[admin_id])

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'admin_name': self.admin.name if self.admin else 'System',
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'filter_days': self.filter_days,
            'deleted_count': self.deleted_count,
            'reclaimed_bytes': self.reclaimed_bytes,
            'reclaimed_mb': round(self.reclaimed_bytes / (1024 * 1024), 2) if self.reclaimed_bytes else 0.0,
            'status': self.status,
            'details': self.details
        }
