import datetime
import logging
import os
import re
import time
from collections import defaultdict
from typing import Any, Dict, Optional, Tuple

import jwt
from flask import current_app
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.database import db
from app.models.department import Department
from app.models.staff import Staff
from app.models.user import User
from app.infrastructure.email_service import send_password_reset_email
from app.utils.helpers import generate_random_password, is_valid_email
from app.services.image_service import delete_profile_photo, import_google_photo, upload_profile_photo

logger = logging.getLogger(__name__)

REGISTRATION_NUMBER_REGEX = re.compile(r"^[A-Za-z0-9\-\/]{5,20}$")

_google_rate_limits: Dict[str, list] = defaultdict(list)
_photo_rate_limits: Dict[int, list] = defaultdict(list)


def is_rate_limited(ip_address: str, limit: int = 10, window: float = 60.0) -> bool:
    """In-memory rate limiter per IP address."""
    now = time.time()
    valid = [t for t in _google_rate_limits[ip_address] if now - t < window]
    if len(valid) >= limit:
        return True
    valid.append(now)
    _google_rate_limits[ip_address] = valid
    return False


def is_photo_rate_limited(user_id: int, limit: int = 5, window: float = 60.0) -> bool:
    """In-memory rate limiter for user profile photo updates."""
    now = time.time()
    valid = [t for t in _photo_rate_limits[user_id] if now - t < window]
    if len(valid) >= limit:
        return True
    valid.append(now)
    _photo_rate_limits[user_id] = valid
    return False


def issue_jwt_token(user: User) -> str:
    """Generate signed HS256 JWT access token."""
    expires_at = datetime.datetime.utcnow() + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": expires_at,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def build_auth_payload(user: User, token: str, message: str = "Login successful!") -> Dict[str, Any]:
    """Serialize authenticated user data with role-specific profile fields."""
    user_data = user.to_dict()
    if user.role == "staff" and user.staff_profile:
        user_data["staff_id"] = user.staff_profile.id
        user_data["department_id"] = user.staff_profile.department_id
        user_data["department_name"] = (
            user.staff_profile.department.department_name
            if user.staff_profile.department
            else None
        )

    return {
        "message": message,
        "token": token,
        "user": user_data,
    }


def register_user(data: Dict[str, Any], forced_role: Optional[str] = None) -> Tuple[Dict[str, Any], int]:
    """Handle student, staff, or admin registration with duplicate validation."""
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    role = (forced_role or data.get("role") or "student").strip().lower()

    if not name or not email or not password:
        return {"message": "Name, email, and password are required!"}, 400

    if not is_valid_email(email):
        return {"message": "Invalid email address format!"}, 400

    if len(password) < 6:
        return {"message": "Password must be at least 6 characters long!"}, 400

    if role == "admin":
        admin_key = (data.get("admin_key") or "").strip()
        expected_key = current_app.config.get("ADMIN_REGISTRATION_KEY", "admin123")
        if admin_key != expected_key:
            return {"message": "Invalid Administrator registration key!"}, 403

    if User.query.filter_by(email=email).first():
        return {"message": "User with this email already exists!"}, 409

    if phone and User.query.filter_by(phone=phone).first():
        return {"message": "User with this mobile number already exists!"}, 409

    department_id = data.get("department_id")
    department_name = (data.get("department") or "").strip()
    registration_number = (data.get("registration_number") or "").strip().upper()

    if role == "student":
        if not registration_number:
            return {"message": "Registration number is required for students!"}, 400
        if not REGISTRATION_NUMBER_REGEX.match(registration_number):
            return {"message": "Invalid registration number format (5-20 alphanumeric characters)!"}, 400
        if User.query.filter_by(registration_number=registration_number).first():
            return {"message": "A student with this registration number is already registered!"}, 409

    resolved_dept_name = None
    if department_id:
        dept = Department.query.get(department_id)
        if dept:
            resolved_dept_name = dept.department_name
    elif department_name:
        resolved_dept_name = department_name

    new_user = User(
        name=name,
        email=email,
        phone=phone or None,
        role=role,
        registration_number=registration_number or None,
        department_id=department_id if department_id else None,
        department=resolved_dept_name,
    )
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to register user: %s", e)
        return {"message": f"Failed to register user: {str(e)}"}, 500

    token = issue_jwt_token(new_user)
    return build_auth_payload(new_user, token, message="User registered successfully!"), 201


def authenticate_user(identifier: str, password: str) -> Tuple[Dict[str, Any], int]:
    """Authenticate with either email address or phone number."""
    if not identifier or not password:
        return {"message": "Missing email/phone or password!"}, 400

    identifier = identifier.strip()
    user = User.query.filter(
        (User.email == identifier.lower()) | (User.phone == identifier)
    ).first()

    if not user or not user.check_password(password):
        return {"message": "Invalid email/phone or password!"}, 401

    token = issue_jwt_token(user)
    return build_auth_payload(user, token, message="Login successful!"), 200


def authenticate_google_token(credential: str, ip_address: str) -> Tuple[Dict[str, Any], int]:
    """Verify Google OAuth2 ID Token and authenticate the registered account."""
    if is_rate_limited(ip_address):
        return {"message": "Too many requests. Please wait a minute before trying again."}, 429

    if not credential:
        return {"message": "Google credential token is missing!"}, 400

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not client_id:
        return {"message": "Google Sign-In is not configured on this server."}, 503

    try:
        token_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError as e:
        logger.warning("Google ID token verification failed: %s", e)
        return {"message": "Invalid Google credential token."}, 401

    if not token_info.get("email_verified"):
        return {"message": "Google email is not verified."}, 400

    google_email = token_info.get("email", "").lower()
    google_sub = token_info.get("sub")
    google_picture = token_info.get("picture")

    allowed_domains_cfg = current_app.config.get("ALLOWED_EMAIL_DOMAINS", "")
    if allowed_domains_cfg:
        allowed_domains = [d.strip().lower() for d in allowed_domains_cfg.split(",") if d.strip()]
        email_domain = google_email.split("@")[-1] if "@" in google_email else ""
        if email_domain not in allowed_domains:
            return {"message": f"Logins are restricted to: {', '.join(allowed_domains)}"}, 403

    user = User.query.filter_by(google_sub=google_sub).first()
    if not user:
        user = User.query.filter_by(email=google_email).first()

    if not user:
        return {
            "message": "No account found for this Google email. Please register as a student first.",
            "error_code": "ACCOUNT_NOT_REGISTERED",
            "email": google_email,
        }, 404

    allow_admin_login = current_app.config.get("ALLOWED_GOOGLE_ADMIN_LOGIN", False)
    if user.role == "admin" and not allow_admin_login:
        return {"message": "Administrator accounts cannot authenticate via Google Sign-In."}, 403

    should_commit = False
    if not user.google_sub:
        user.google_sub = google_sub
        should_commit = True

    # Import picture on initial login only if user does not already have an avatar
    if (
        google_picture
        and not user.profile_photo_public_id
        and not user.profile_photo_source
        and not getattr(user, "photo_import_declined", False)
    ):
        try:
            import_result = import_google_photo(google_picture, user.id)
            if import_result:
                user.profile_photo_url = import_result["secure_url"]
                user.profile_photo_public_id = import_result["public_id"]
                user.profile_photo_source = "google_imported"
                should_commit = True
        except Exception as e:
            logger.warning("Could not auto-import Google avatar for user %s: %s", user.id, e)

    if should_commit:
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error("Failed to update user Google credentials: %s", e)

    token = issue_jwt_token(user)
    return build_auth_payload(user, token, message="Google authentication successful!"), 200


def initiate_password_reset(email: str) -> Tuple[Dict[str, Any], int]:
    """Generate temporary password and dispatch reset email."""
    if not email:
        return {"message": "Email is required!"}, 400

    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"message": "User with this email not found!"}, 404

    temp_password = generate_random_password(length=10)
    user.set_password(temp_password)

    try:
        db.session.commit()
        send_password_reset_email(user.email, temp_password)
        return {"message": "Password reset instructions sent to your email."}, 200
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to reset password: %s", e)
        return {"message": f"Failed to reset password: {str(e)}"}, 500


def update_profile(user: User, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Update general profile fields: name, phone, or password."""
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if name:
        user.name = name

    if phone:
        existing = User.query.filter(User.phone == phone, User.id != user.id).first()
        if existing:
            return {"message": "Phone number is already in use by another user!"}, 409
        user.phone = phone

    if password:
        if len(password) < 6:
            return {"message": "Password must be at least 6 characters!"}, 400
        user.set_password(password)

    try:
        db.session.commit()
        return {
            "message": "Profile updated successfully!",
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to update profile: {str(e)}"}, 500


def update_academic_profile(user: User, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Update student-specific academic information."""
    if user.role != "student":
        return {"message": "Academic details can only be updated for students!"}, 403

    reg_num = (data.get("registration_number") or "").strip().upper()
    dept_id = data.get("department_id")

    if reg_num:
        if not REGISTRATION_NUMBER_REGEX.match(reg_num):
            return {"message": "Invalid registration number format (5-20 alphanumeric characters)!"}, 400
        existing = User.query.filter(User.registration_number == reg_num, User.id != user.id).first()
        if existing:
            return {"message": "Registration number already registered to another user!"}, 409
        user.registration_number = reg_num

    if dept_id:
        dept = Department.query.get(dept_id)
        if not dept:
            return {"message": "Department not found!"}, 404
        user.department_id = dept.id
        user.department = dept.department_name

    try:
        db.session.commit()
        return {
            "message": "Academic details updated successfully!",
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to update academic details: {str(e)}"}, 500


def link_google_account(user: User, credential: str) -> Tuple[Dict[str, Any], int]:
    """Link Google Identity to an existing student/staff account."""
    if not credential:
        return {"message": "Missing Google credential token!"}, 400

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    try:
        token_info = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
    except ValueError:
        return {"message": "Invalid Google credential token."}, 401

    google_email = token_info.get("email", "").lower()
    google_sub = token_info.get("sub")

    if google_email != user.email.lower():
        return {"message": "Google account email does not match your registered email!"}, 400

    existing_link = User.query.filter(User.google_sub == google_sub, User.id != user.id).first()
    if existing_link:
        return {"message": "This Google account is already linked to another user."}, 409

    user.google_sub = google_sub
    try:
        db.session.commit()
        return {
            "message": "Google account linked successfully!",
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to link Google account: {str(e)}"}, 500


def unlink_google_account(user: User) -> Tuple[Dict[str, Any], int]:
    """Unlink Google Identity from an account."""
    if not user.google_sub:
        return {"message": "No Google account is linked."}, 400

    user.google_sub = None
    try:
        db.session.commit()
        return {
            "message": "Google account unlinked successfully.",
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Failed to unlink Google account: {str(e)}"}, 500


def save_user_profile_photo(user: User, file: Any) -> Tuple[Dict[str, Any], int]:
    """Upload and normalize profile picture under protected profiles/ storage."""
    if is_photo_rate_limited(user.id):
        return {"message": "Too many photo upload attempts. Please wait a minute."}, 429

    if not file or not file.filename:
        return {"message": "No image file provided."}, 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > 15 * 1024 * 1024:
        return {"message": "File exceeds maximum size of 15MB."}, 400

    result = upload_profile_photo(file, user_id=user.id)
    if not result:
        return {"message": "Failed to upload profile photo."}, 500

    user.profile_photo_url = result["secure_url"]
    user.profile_photo_public_id = result["public_id"]
    user.profile_photo_source = "uploaded"

    try:
        db.session.commit()
        return {
            "message": "Profile photo updated successfully.",
            "profile_photo_url": user.profile_photo_url,
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Database update failed: {str(e)}"}, 500


def remove_user_profile_photo(user: User) -> Tuple[Dict[str, Any], int]:
    """Remove user avatar and mark photo_import_declined."""
    if not user.profile_photo_public_id and not user.profile_photo_url:
        return {"message": "No profile photo to delete."}, 400

    if user.profile_photo_public_id:
        try:
            delete_profile_photo(user.profile_photo_public_id)
        except Exception as e:
            logger.warning("Failed to delete Cloudinary photo %s: %s", user.profile_photo_public_id, e)

    user.profile_photo_url = None
    user.profile_photo_public_id = None
    user.profile_photo_source = None
    user.photo_import_declined = True

    try:
        db.session.commit()
        return {
            "message": "Profile photo removed.",
            "user": user.to_dict(),
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Database update failed: {str(e)}"}, 500
