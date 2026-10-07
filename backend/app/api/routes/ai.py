from flask import Blueprint, g, jsonify, request

from app.models.complaint import Complaint
from app.infrastructure.llm_service import LLMService
from app.api.dependencies import authenticated

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/chat", methods=["POST"])
@authenticated()
def chat():
    """Context-aware AI chatbot assistant for grievance guidance."""
    data = request.get_json() or {}
    messages = data.get("messages", [])
    context = data.get("context", None)

    if not messages:
        return jsonify({"message": "Messages array is required!"}), 400

    # Inject recent complaints if the current user is a student
    user = getattr(g, "current_user", None)
    if user and user.role == "student":
        recent_complaints = (
            Complaint.query.filter_by(student_id=user.id)
            .order_by(Complaint.created_at.desc())
            .limit(5)
            .all()
        )
        if recent_complaints:
            items = []
            for c in recent_complaints:
                assigned = f"Assigned to Staff ID: {c.assigned_staff}" if c.assigned_staff else "Not assigned yet"
                items.append(f"- ID: {c.id}, Title: '{c.title}', Category: {c.category}, Status: {c.status}, Assigned: {assigned}")
            student_context = "Student's Recent Complaints:\n" + "\n".join(items)
            context = f"{context}\n\n{student_context}" if context else student_context

    result = LLMService.chat(messages, context)

    if isinstance(result, dict):
        if not result.get("success"):
            return jsonify({"message": result.get("error", "AI service error")}), 500
        return jsonify({"response": result.get("response")}), 200

    if isinstance(result, str):
        if "Missing API Key" in result:
            return jsonify({"message": "AI assistant is not configured."}), 503
        return jsonify({"response": result}), 200

    return jsonify({"message": "Unknown AI error."}), 500


@ai_bp.route("/analyze-issue", methods=["POST"])
@authenticated()
def analyze_issue():
    """Predict category, urgency, and suggested solution for an issue description."""
    data = request.get_json() or {}
    description = (data.get("description") or "").strip()

    if not description:
        return jsonify({"message": "Description is required!"}), 400

    analysis = LLMService.analyze_issue(description)
    if analysis:
        return jsonify(analysis), 200

    return jsonify({"message": "Failed to analyze issue. AI unavailable."}), 503
