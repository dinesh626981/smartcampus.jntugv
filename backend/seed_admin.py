"""Seed or update Administrator account in the SmartCampus database.

Usage:
    # Run with defaults (or values from .env):
    python seed_admin.py

    # Run with custom parameters:
    python seed_admin.py --email admin@college.com --password mySecurePassword123 --name "Tarun Bommali" --phone "+919581193026"

    # Reset / overwrite existing admin password:
    python seed_admin.py --email admin@college.com --password newPassword123 --reset

Environment variables supported:
    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE
"""
import argparse
import os
import sys

# Ensure backend directory is in python module search path
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv

# Load local .env
load_dotenv(os.path.join(BACKEND_DIR, ".env"))
load_dotenv()

from flask import Flask
from app.core.config import Config
from app.core.database import db
from app.models.user import User


def get_db_app() -> Flask:
    """Create a minimal Flask application context connected to the configured database."""
    app = Flask("smartcampus_admin_seeder")
    app.config.from_object(Config)
    db.init_app(app)
    return app


def seed_admin(
    email: str = None,
    password: str = None,
    name: str = None,
    phone: str = None,
    force_reset: bool = False,
) -> bool:
    """Create or update an administrator user record."""
    # Resolve parameters from arguments, environment variables, or defaults
    admin_email = (
        email
        or os.environ.get("ADMIN_EMAIL")
        or "admin@college.com"
    ).strip().lower()

    admin_password = (
        password
        or os.environ.get("ADMIN_PASSWORD")
        or "admin123"
    )

    admin_name = (
        name
        or os.environ.get("ADMIN_NAME")
        or "System Administrator"
    ).strip()

    admin_phone = (
        phone
        or os.environ.get("ADMIN_PHONE")
        or "+919581193026"
    ).strip()

    if len(admin_password) < 6:
        print(f"[ERROR] Password must contain at least 6 characters (received length {len(admin_password)}).")
        return False

    app = get_db_app()

    with app.app_context():
        # Ensure database tables exist
        db.create_all()

        existing_user = User.query.filter_by(email=admin_email).first()

        if existing_user:
            print(f"[INFO] User with email '{admin_email}' already exists (Current role: '{existing_user.role}').")

            # Update role to admin if not already
            existing_user.role = "admin"
            if admin_name:
                existing_user.name = admin_name
            if admin_phone:
                existing_user.phone = admin_phone

            if force_reset or password:
                existing_user.set_password(admin_password)
                print(f"[INFO] Password successfully updated/reset.")
            else:
                print(f"[INFO] Password unchanged. Use --reset or specify --password to update it.")

            db.session.commit()
            print("\n=======================================================")
            print("  ADMINISTRATOR ACCOUNT UPDATED SUCCESSFULLY")
            print("=======================================================")
            print(f"  ID:       {existing_user.id}")
            print(f"  Name:     {existing_user.name}")
            print(f"  Email:    {existing_user.email}")
            print(f"  Role:     {existing_user.role}")
            print(f"  Phone:    {existing_user.phone or 'Not set'}")
            print("=======================================================\n")
            return True

        # Check if phone number is already taken by a different user
        if admin_phone:
            phone_conflict = User.query.filter_by(phone=admin_phone).first()
            if phone_conflict:
                print(f"[WARN] Phone '{admin_phone}' is linked to another user ({phone_conflict.email}). Seeding without phone conflict.")
                admin_phone = None

        new_admin = User(
            name=admin_name,
            email=admin_email,
            phone=admin_phone,
            role="admin",
        )
        new_admin.set_password(admin_password)

        db.session.add(new_admin)
        db.session.commit()

        print("\n=======================================================")
        print("  NEW ADMINISTRATOR ACCOUNT CREATED SUCCESSFULLY")
        print("=======================================================")
        print(f"  ID:       {new_admin.id}")
        print(f"  Name:     {new_admin.name}")
        print(f"  Email:    {new_admin.email}")
        print(f"  Role:     {new_admin.role}")
        print(f"  Phone:    {new_admin.phone or 'Not set'}")
        print("=======================================================\n")
        return True


def main():
    parser = argparse.ArgumentParser(
        description="Seed or update the Administrator account in the SmartCampus database."
    )
    parser.add_argument(
        "--email",
        type=str,
        help="Administrator email address (default: admin@college.com or $ADMIN_EMAIL)",
    )
    parser.add_argument(
        "--password",
        type=str,
        help="Administrator password (default: admin123 or $ADMIN_PASSWORD)",
    )
    parser.add_argument(
        "--name",
        type=str,
        help="Administrator full name (default: System Administrator or $ADMIN_NAME)",
    )
    parser.add_argument(
        "--phone",
        type=str,
        help="Administrator phone number (default: +919581193026 or $ADMIN_PHONE)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Force overwrite existing password with the provided password",
    )

    args = parser.parse_args()

    success = seed_admin(
        email=args.email,
        password=args.password,
        name=args.name,
        phone=args.phone,
        force_reset=args.reset,
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
