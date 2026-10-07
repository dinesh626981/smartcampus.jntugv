import datetime
import io
import json
import logging
import zipfile
from typing import Any, Dict, List, Optional, Tuple

import requests
from flask import Response, current_app

from app.core.database import db
from app.models.cleanup_log import CleanupLog
from app.models.complaint import Complaint
from app.models.user import User
from app.services.image_service import delete_images_batch

logger = logging.getLogger(__name__)


def get_storage_usage() -> Tuple[Dict[str, Any], int]:
    """Retrieve Cloudinary usage statistics and calculate quota consumption."""
    cloud_name = current_app.config.get("CLOUDINARY_CLOUD_NAME")
    api_key = current_app.config.get("CLOUDINARY_API_KEY")
    api_secret = current_app.config.get("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        return {
            "configured": False,
            "message": "Cloudinary credentials not configured.",
        }, 200

    try:
        import cloudinary.api
        usage = cloudinary.api.usage()
        credits_info = usage.get("credits", {})
        used_credits = credits_info.get("usage", 0.0)
        limit_credits = credits_info.get("limit", 25.0)
        used_pct = round((used_credits / limit_credits * 100), 2) if limit_credits else 0.0

        storage_bytes = usage.get("storage", {}).get("usage", 0)
        storage_mb = round(storage_bytes / (1024 * 1024), 2)
        bandwidth_bytes = usage.get("bandwidth", {}).get("usage", 0)
        bandwidth_mb = round(bandwidth_bytes / (1024 * 1024), 2)
        transformations = usage.get("transformations", {}).get("usage", 0)
        resources_count = usage.get("resources", 0)

        # Count total complaint records with active images in database
        complaints_with_images = Complaint.query.filter(
            (Complaint.image_public_id.isnot(None))
            | (Complaint.completion_image_public_id.isnot(None))
        ).all()
        images_in_db = len(complaints_with_images)

        complaint_images_bytes = sum(
            (c.image_bytes or 0) + (c.completion_image_bytes or 0)
            for c in complaints_with_images
        )
        complaint_images_count = sum(
            (1 if c.image_public_id else 0) + (1 if c.completion_image_public_id else 0)
            for c in complaints_with_images
        )
        complaint_images_mb = round(complaint_images_bytes / (1024 * 1024), 2)

        # Profile photos
        users_with_photos = User.query.filter(User.profile_photo_public_id.isnot(None)).all()
        profile_photos_bytes = sum(u.profile_photo_bytes or 0 for u in users_with_photos)
        profile_photos_count = len(users_with_photos)
        profile_photos_mb = round(profile_photos_bytes / (1024 * 1024), 2)

        # Reclaimable (complaints resolved/closed > 30 days)
        cutoff_30 = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        reclaimable_complaints = [
            c for c in complaints_with_images
            if c.status in ["Resolved", "Closed"] and c.created_at and c.created_at <= cutoff_30
        ]
        reclaimable_bytes = sum(
            (c.image_bytes or 0) + (c.completion_image_bytes or 0)
            for c in reclaimable_complaints
        )
        reclaimable_mb = round(reclaimable_bytes / (1024 * 1024), 2)

        return {
            "configured": True,
            "plan": usage.get("plan", "Free"),
            "credits": {
                "used": used_credits,
                "limit": limit_credits,
                "used_percent": used_pct,
            },
            "storage_mb": storage_mb,
            "bandwidth_mb": bandwidth_mb,
            "transformations": transformations,
            "resources": resources_count,
            "images_in_db": images_in_db,
            "complaint_images_mb": complaint_images_mb,
            "complaint_images_bytes": complaint_images_bytes,
            "complaint_images_count": complaint_images_count,
            "profile_photos_mb": profile_photos_mb,
            "profile_photos_bytes": profile_photos_bytes,
            "profile_photos_count": profile_photos_count,
            "reclaimable_mb": reclaimable_mb,
            "reclaimable_bytes": reclaimable_bytes,
            "last_updated": datetime.datetime.utcnow().isoformat(),
        }, 200
    except Exception as e:
        logger.exception("Failed to query Cloudinary usage: %s", e)
        return {
            "configured": True,
            "error": str(e),
            "message": "Failed to fetch storage usage from Cloudinary API.",
        }, 500


def preview_cleanup(retention_days: int = 30) -> Tuple[Dict[str, Any], int]:
    """Calculate candidates and estimated bytes reclaimed for resolved/closed complaints."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=retention_days)

    candidates = Complaint.query.filter(
        Complaint.status.in_(["Resolved", "Closed"]),
        Complaint.created_at <= cutoff,
        (Complaint.image_public_id.isnot(None))
        | (Complaint.completion_image_public_id.isnot(None)),
    ).all()

    total_images = 0
    candidate_list: List[Dict[str, Any]] = []

    for c in candidates:
        img_count = 0
        if c.image_public_id:
            img_count += 1
        if c.completion_image_public_id:
            img_count += 1
        total_images += img_count

        candidate_list.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "has_before_image": bool(c.image_public_id),
            "has_proof_image": bool(c.completion_image_public_id),
            "image_count": img_count,
        })

    # Estimate average 300KB per image
    estimated_mb = round((total_images * 300) / 1024, 2)

    return {
        "retention_days": retention_days,
        "cutoff_date": cutoff.isoformat(),
        "candidate_count": len(candidates),
        "candidate_complaints_count": len(candidates),
        "total_images_count": total_images,
        "candidate_images_count": total_images,
        "estimated_reclaimed_mb": estimated_mb,
        "candidates": candidate_list[:100],
        "complaints": candidate_list[:100],
    }, 200


def execute_cleanup(
    retention_days: int = 30,
    confirmation: str = "",
    admin_id: Optional[int] = None,
) -> Tuple[Dict[str, Any], int]:
    """Safely purge images of resolved complaints; profile photos are strictly protected."""
    if confirmation != "DELETE":
        return {
            "message": "Confirmation keyword 'DELETE' is required to execute purge."
        }, 400

    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=retention_days)

    candidates = Complaint.query.filter(
        Complaint.status.in_(["Resolved", "Closed"]),
        Complaint.created_at <= cutoff,
        (Complaint.image_public_id.isnot(None))
        | (Complaint.completion_image_public_id.isnot(None)),
    ).all()

    if not candidates:
        return {
            "message": "No eligible resolved complaints found matching criteria.",
            "deleted_count": 0,
            "affected_complaints": 0,
        }, 200

    public_ids_to_delete: List[str] = []
    complaint_updates = []

    for c in candidates:
        before_id = c.image_public_id
        proof_id = c.completion_image_public_id
        if before_id:
            public_ids_to_delete.append(before_id)
        if proof_id:
            public_ids_to_delete.append(proof_id)
        complaint_updates.append((c, before_id, proof_id))

    # Batch delete using allow-list guard (rejects any profiles/* IDs)
    delete_result = delete_images_batch(public_ids_to_delete)
    if isinstance(delete_result, dict):
        deleted_ids = set(delete_result.get("deleted", []))
    elif isinstance(delete_result, (list, set, tuple)):
        deleted_ids = set(delete_result)
    else:
        deleted_ids = set()
    now = datetime.datetime.utcnow()

    reclaimed_bytes = 0
    affected_count = 0
    for complaint, before_id, proof_id in complaint_updates:
        modified = False
        if before_id and before_id in deleted_ids:
            complaint.image_public_id = None
            complaint.image_url = None
            complaint.image_deleted_at = now
            reclaimed_bytes += (complaint.image_bytes or 0)
            modified = True
        if proof_id and proof_id in deleted_ids:
            complaint.completion_image_public_id = None
            complaint.completion_image_url = None
            complaint.completion_image_deleted_at = now
            reclaimed_bytes += (complaint.completion_image_bytes or 0)
            modified = True
        if modified:
            affected_count += 1

    reclaimed_mb = round(reclaimed_bytes / (1024 * 1024), 2)

    log_entry = CleanupLog(
        admin_id=admin_id,
        filter_days=retention_days,
        deleted_count=len(deleted_ids),
        reclaimed_bytes=reclaimed_bytes,
        status="completed",
        details=json.dumps({"affected_complaints": affected_count, "reclaimed_mb": reclaimed_mb}),
    )
    db.session.add(log_entry)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed recording cleanup log: %s", e)
        return {"message": f"Database update failed after deletion: {str(e)}"}, 500

    return {
        "message": f"Cleanup complete. Deleted {len(deleted_ids)} image(s) across {affected_count} complaint(s).",
        "deleted_count": len(deleted_ids),
        "deleted_images_count": len(deleted_ids),
        "reclaimed_bytes": reclaimed_bytes,
        "reclaimed_mb": reclaimed_mb,
        "affected_complaints": affected_count,
        "affected_complaints_count": affected_count,
        "estimated_reclaimed_mb": reclaimed_mb,
        "blocked_protected": delete_result.get("blocked_protected", 0) if isinstance(delete_result, dict) else 0,
    }, 200


def get_cleanup_logs() -> List[Dict[str, Any]]:
    """Return historical audit records of previous cleanup operations."""
    logs = CleanupLog.query.order_by(CleanupLog.timestamp.desc()).limit(50).all()
    return [log.to_dict() for log in logs]


def generate_backup_zip(retention_days: int = 30) -> Response:
    """Generate in-memory ZIP containing candidates and audit manifest."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=retention_days)
    candidates = Complaint.query.filter(
        Complaint.status.in_(["Resolved", "Closed"]),
        Complaint.created_at <= cutoff,
        (Complaint.image_public_id.isnot(None))
        | (Complaint.completion_image_public_id.isnot(None)),
    ).all()

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        manifest = {
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "retention_days": retention_days,
            "total_candidates": len(candidates),
            "complaints": [],
        }

        def download_and_zip(url: Optional[str], arcname: str) -> None:
            if not url or url.startswith("["):
                return
            try:
                resp = requests.get(url, timeout=10)
                if resp.status_code == 200:
                    zip_file.writestr(arcname, resp.content)
            except Exception as ex:
                logger.warning("Failed downloading image %s for backup: %s", url, ex)

        for c in candidates:
            manifest["complaints"].append({
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })
            if c.image_url:
                download_and_zip(c.image_url, f"complaint_{c.id}_before.jpg")
            if c.completion_image_url:
                download_and_zip(c.completion_image_url, f"complaint_{c.id}_proof.jpg")

        zip_file.writestr("manifest.json", json.dumps(manifest, indent=2))

    zip_buffer.seek(0)
    filename = f"complaints_backup_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"
    return Response(
        zip_buffer.getvalue(),
        mimetype="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
