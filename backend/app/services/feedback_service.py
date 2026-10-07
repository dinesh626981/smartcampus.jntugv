import logging
from typing import Any, Dict, Tuple

from app.core.database import db
from app.models.complaint import Complaint
from app.models.feedback import Feedback
from app.models.user import User

logger = logging.getLogger(__name__)


def submit_feedback(user: User, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Submit student rating and review for a resolved grievance."""
    complaint_id = data.get("complaint_id")
    rating_raw = data.get("rating")
    comment = data.get("comment")

    if not complaint_id or rating_raw is None:
        return {"message": "Missing complaint_id or rating!"}, 400

    try:
        rating = int(rating_raw)
        if rating < 1 or rating > 5:
            return {"message": "Rating must be between 1 and 5 stars!"}, 400
    except (ValueError, TypeError):
        return {"message": "Rating must be a valid integer!"}, 400

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return {"message": "Complaint not found!"}, 404

    if complaint.student_id != user.id:
        return {"message": "You can only give feedback for your own complaints!"}, 403

    if complaint.status not in ["Resolved", "Closed"]:
        return {
            "message": "Feedback can only be submitted for resolved or closed complaints!"
        }, 400

    existing_feedback = Feedback.query.filter_by(complaint_id=complaint_id).first()
    if existing_feedback:
        return {"message": "Feedback already submitted for this complaint!"}, 409

    feedback = Feedback(
        complaint_id=complaint_id,
        rating=rating,
        comment=comment,
    )

    try:
        db.session.add(feedback)
        db.session.commit()
        return {
            "message": "Feedback submitted successfully! Thank you.",
            "feedback": feedback.to_dict(),
        }, 201
    except Exception as e:
        db.session.rollback()
        logger.exception("Failed to submit feedback: %s", e)
        return {"message": f"Failed to submit feedback: {str(e)}"}, 500


def get_all_feedback() -> Tuple[Dict[str, Any], int]:
    """Retrieve all student feedback reviews and calculate average ratings."""
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    total_ratings = len(feedbacks)
    avg_rating = (
        round(sum(f.rating for f in feedbacks) / total_ratings, 2)
        if total_ratings > 0
        else 0.0
    )

    return {
        "feedbacks": [f.to_dict() for f in feedbacks],
        "total_feedback_count": total_ratings,
        "average_rating": avg_rating,
    }, 200
