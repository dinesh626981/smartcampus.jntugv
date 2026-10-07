from app.core.database import db

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    department_name = db.Column(db.String(100), unique=True, nullable=False)

    # Relationships
    staff_members = db.relationship('Staff', back_populates='department', cascade="all, delete-orphan")
    complaints = db.relationship('Complaint', back_populates='department')

    def to_dict(self):
        return {
            'id': self.id,
            'department_name': self.department_name
        }
