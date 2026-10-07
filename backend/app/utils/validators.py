import re
from typing import Any, Dict, List, Optional, Set

ALLOWED_IMAGE_EXTENSIONS: Set[str] = {"png", "jpg", "jpeg", "webp"}
EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")
PHONE_REGEX = re.compile(r"^\+?[0-9]{10,15}$")


def validate_required_fields(data: Optional[Dict[str, Any]], required_fields: List[str]) -> List[str]:
    """Return a list of missing or empty required field names."""
    if not data:
        return list(required_fields)
    missing: List[str] = []
    for field in required_fields:
        val = data.get(field)
        if val is None or (isinstance(val, str) and not val.strip()):
            missing.append(field)
    return missing


def is_valid_email(email: Optional[str]) -> bool:
    """Validate email address format."""
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def is_valid_phone(phone: Optional[str]) -> bool:
    """Validate 10-15 digit telephone numbers."""
    if not phone:
        return False
    clean = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(PHONE_REGEX.match(clean))


def is_allowed_image_filename(filename: Optional[str]) -> bool:
    """Validate image extension against supported safe formats."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_IMAGE_EXTENSIONS
