"""JWT and password security primitives."""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from flask import current_app
from werkzeug.security import check_password_hash, generate_password_hash


def hash_password(password: str) -> str:
    """Hash a plain-text password."""
    return generate_password_hash(password)


def verify_password(hashed: str, candidate: str) -> bool:
    """Verify candidate password against hash."""
    return check_password_hash(hashed, candidate)


def create_access_token(payload: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed HS256 JWT access token."""
    to_encode = payload.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, current_app.config["SECRET_KEY"], algorithm="HS256")
