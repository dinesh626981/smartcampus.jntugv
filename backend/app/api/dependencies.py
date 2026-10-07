"""Route-level permission dependencies."""
# pyrefly: ignore [missing-import]
from app.middleware.auth_middleware import token_required


def student_required(fn):
    """Enforce student role."""
    return token_required(allowed_roles=["student"])(fn)


def admin_required(fn):
    """Enforce admin role."""
    return token_required(allowed_roles=["admin"])(fn)


def staff_required(fn):
    """Enforce staff or admin role."""
    return token_required(allowed_roles=["staff", "admin"])(fn)


def authenticated(fn=None):
    """Require any authenticated user. Works as @authenticated or @authenticated()."""
    decorator = token_required()
    if fn is not None:
        return decorator(fn)
    return decorator
