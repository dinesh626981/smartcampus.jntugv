from typing import Any, Dict, Optional, Tuple
from flask import Response, jsonify


def success_response(
    data: Optional[Dict[str, Any]] = None,
    message: Optional[str] = None,
    status_code: int = 200,
    **kwargs: Any
) -> Tuple[Response, int]:
    """Return a consistent JSON success response preserving existing contract keys."""
    payload: Dict[str, Any] = {}
    if message is not None:
        payload["message"] = message
    if data:
        payload.update(data)
    if kwargs:
        payload.update(kwargs)
    return jsonify(payload), status_code


def error_response(
    message: str,
    status_code: int = 400,
    error: Optional[str] = None,
    **kwargs: Any
) -> Tuple[Response, int]:
    """Return a consistent JSON error response preserving existing contract keys."""
    payload: Dict[str, Any] = {"message": message}
    if error is not None:
        payload["error"] = error
    if kwargs:
        payload.update(kwargs)
    return jsonify(payload), status_code
