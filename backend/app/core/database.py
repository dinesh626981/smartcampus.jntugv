"""Database initialization, migration helpers, and seed data."""
import logging
import sys
import time

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

db = SQLAlchemy()

logger = logging.getLogger(__name__)

ACADEMIC_DEPARTMENTS = [
    "Civil Engineering",
    "Computer Science & Engineering (CSE)",
    "Electrical & Electronics Engineering (EEE)",
    "Electronics & Communication Engineering (ECE)",
    "Information Technology (IT)",
    "Mechanical Engineering",
    "Metallurgical Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English / Basic Sciences & Humanities",
    "Master of Computer Applications (MCA)",
    "Management / Business Administration (MBA)",
    "Pharmacy / Pharmaceutical Sciences",
    "Other",
]


def run_safe_migrations() -> None:
    """Execute non-destructive column additions for development upgrades."""
    migration_statements = [
        "ALTER TABLE ai_analysis ADD COLUMN report_quality_status VARCHAR(50);",
        "ALTER TABLE ai_analysis ADD COLUMN report_quality_reason TEXT;",
        "ALTER TABLE users ADD COLUMN phone VARCHAR(15);",
        "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student';",
        "ALTER TABLE users ADD COLUMN created_at DATETIME;",
        "ALTER TABLE users ADD COLUMN registration_number VARCHAR(50);",
        "ALTER TABLE users ADD COLUMN department VARCHAR(100);",
        "ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id);",
        "ALTER TABLE users ADD COLUMN google_sub VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN auth_provider_last VARCHAR(20) DEFAULT 'password';",
        "ALTER TABLE complaints ADD COLUMN image_url VARCHAR(500);",
        "ALTER TABLE complaints ADD COLUMN image_public_id VARCHAR(255);",
        "ALTER TABLE complaints ADD COLUMN image_bytes INTEGER DEFAULT 0;",
        "ALTER TABLE complaints ADD COLUMN image_deleted_at DATETIME;",
        "ALTER TABLE complaints ADD COLUMN completion_image_url VARCHAR(500);",
        "ALTER TABLE complaints ADD COLUMN completion_image_public_id VARCHAR(255);",
        "ALTER TABLE complaints ADD COLUMN completion_image_bytes INTEGER DEFAULT 0;",
        "ALTER TABLE complaints ADD COLUMN completion_image_deleted_at DATETIME;",
        "ALTER TABLE users ADD COLUMN profile_photo_url VARCHAR(500);",
        "ALTER TABLE users ADD COLUMN profile_photo_public_id VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN profile_photo_bytes INTEGER DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN profile_photo_updated_at DATETIME;",
        "ALTER TABLE users ADD COLUMN profile_photo_source VARCHAR(30);",
        "ALTER TABLE users ADD COLUMN photo_import_declined BOOLEAN DEFAULT 0;",
    ]

    for stmt in migration_statements:
        try:
            db.session.execute(text(stmt))
            db.session.commit()
        except Exception:
            db.session.rollback()


def seed_default_data() -> None:
    """Provision baseline academic departments and demo role credentials."""
    # Import models here to avoid circular imports at module load time
    # pyrefly: ignore [missing-import]
    from app.models.department import Department
    # pyrefly: ignore [missing-import]
    from app.models.staff import Staff
    # pyrefly: ignore [missing-import]
    from app.models.user import User

    # 1. Academic Departments
    for dept_name in ACADEMIC_DEPARTMENTS:
        if not Department.query.filter_by(department_name=dept_name).first():
            # pyrefly: ignore [unexpected-keyword]
            db.session.add(Department(department_name=dept_name))
    db.session.commit()

    # 2. Administrator Account
    admin_email = "admin@college.com"
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(
            name="System Administrator",
            email=admin_email,
            phone="9876543210",
            role="admin",
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
    else:
        admin.role = "admin"
        admin.set_password("admin123")
        if not admin.phone:
            admin.phone = "9876543210"
        db.session.commit()

    # 3. Student Account
    cse_dept = Department.query.filter(
        Department.department_name.ilike("%Computer Science%")
    ).first()
    cse_dept_id = cse_dept.id if cse_dept else None

    student_email = "student@college.com"
    student = User.query.filter_by(email=student_email).first()
    if not student:
        student = User(
            name="Demo Student",
            email=student_email,
            # pyrefly: ignore [unexpected-keyword]
            phone="9876543211",
            role="student",
            registration_number="21B91A0501",
            department_id=cse_dept_id,
            department="Computer Science & Engineering (CSE)",
        )
        student.set_password("student123")
        db.session.add(student)
        db.session.commit()
    else:
        student.role = "student"
        student.set_password("student123")
        if not student.phone:
            student.phone = "9876543211"
        if not student.registration_number:
            student.registration_number = "21B91A0501"
        if not student.department_id and cse_dept_id:
            student.department_id = cse_dept_id
        if not student.department:
            student.department = "Computer Science & Engineering (CSE)"
        db.session.commit()

    # 4. Staff Account
    staff_email = "staff@college.com"
    staff = User.query.filter_by(email=staff_email).first()
    it_dept = Department.query.filter(Department.department_name.ilike("%IT%")).first()
    it_dept_id = it_dept.id if it_dept else 1

    if not staff:
        staff = User(
            name="IT Support Officer",
            email=staff_email,
            phone="9876543212",
            role="staff",
        )
        staff.set_password("staff123")
        db.session.add(staff)
        db.session.flush()

        staff_profile = Staff(user_id=staff.id, department_id=it_dept_id)
        db.session.add(staff_profile)
        db.session.commit()
    else:
        staff.role = "staff"
        staff.set_password("staff123")
        if not staff.phone:
            staff.phone = "9876543212"
        if not staff.staff_profile:
            staff_profile = Staff(user_id=staff.id, department_id=it_dept_id)
            db.session.add(staff_profile)
        db.session.commit()


def verify_database_connection(
    app: Flask,
    max_retries: int = 5,
    delay_seconds: int = 2,
) -> bool:
    """Ensure database connectivity before allowing the backend to accept traffic.

    Retries up to max_retries if database is temporarily starting up or connecting.
    Raises RuntimeError if connection cannot be established so backend fails fast.
    """
    with app.app_context():
        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "Checking database connectivity (attempt %d/%d)...",
                    attempt,
                    max_retries,
                )
                db.session.execute(text("SELECT 1"))
                logger.info("[OK] Database connection verified successfully!")
                return True
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Database connection attempt %d/%d failed: %s",
                    attempt,
                    max_retries,
                    exc,
                )
                if attempt < max_retries:
                    time.sleep(delay_seconds)

        fatal_msg = (
            f"[FATAL] Backend startup halted: Unable to connect to the database after "
            f"{max_retries} attempts.\n"
            f"Underlying error: {last_error}\n"
            f"Please verify DATABASE_URL and network / SSL parameters in .env."
        )
        logger.critical(fatal_msg)
        print(f"\n{fatal_msg}\n", file=sys.stderr)
        raise RuntimeError(fatal_msg)


def init_database(app: Flask) -> None:
    """Verify database readiness, initialize tables, apply migrations, and seed default records."""
    # 1. Gate execution: Database MUST connect successfully first
    verify_database_connection(app)

    # 2. Schema provisioning and data seeding
    with app.app_context():
        db.create_all()
        run_safe_migrations()
        seed_default_data()
        logger.info("[OK] Database schema, migrations, and seeds completed successfully.")
