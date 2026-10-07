from functools import wraps
from typing import Any, Callable, List, Optional

import jwt
from flask import current_app, g, jsonify, request

from app.models.user import User


def token_required(allowed_roles: Optional[List[str]] = None) -> Callable[..., Any]:
    """Protect endpoint with HS256 JWT and verify role permissions."""
    allowed = allowed_roles or []

    def decorator(fn: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(fn)
        def decorated(*args: Any, **kwargs: Any) -> Any:
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"message": "Access token is missing!"}), 401

            token = auth_header.split(" ")[1]

            try:
                data = jwt.decode(
                    token,
                    current_app.config["SECRET_KEY"],
                    algorithms=["HS256"],
                )
                user = User.query.filter_by(id=data.get("user_id")).first()
                if not user:
                    return jsonify({"message": "User not found!"}), 401

                if allowed and user.role not in allowed:
                    return jsonify({"message": "Unauthorized role access!"}), 403

                g.current_user = user
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token has expired! Please log in again."}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token! Please log in again."}), 401

            return fn(*args, **kwargs)

        return decorated

    return decorator
