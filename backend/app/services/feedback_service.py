import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

_IN_MEMORY_FEEDBACK_STORE: Dict[str, Dict[str, Any]] = {}

class FeedbackService:
    @staticmethod
    def submit_feedback(
        interview_request_id: str,
        student_id: str,
        recruiter_user_id: str,
        overall_rating: float = 5.0,
        technical_rating: float = 5.0,
        communication_rating: float = 5.0,
        behaviour_rating: float = 5.0,
        comments: Optional[str] = "",
        recommendation: Optional[str] = "Recommended",
        is_anonymous: bool = False,
        submitted_by_role: str = "student"
    ) -> Dict[str, Any]:
        feedback_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        data = {
            "id": feedback_id,
            "interview_request_id": interview_request_id,
            "student_id": student_id,
            "recruiter_user_id": recruiter_user_id,
            "overall_rating": overall_rating,
            "technical_rating": technical_rating,
            "communication_rating": communication_rating,
            "behaviour_rating": behaviour_rating,
            "comments": comments,
            "recommendation": recommendation,
            "is_anonymous": is_anonymous,
            "submitted_by_role": submitted_by_role,
            "created_at": created_at,
            "updated_at": created_at,
        }

        _IN_MEMORY_FEEDBACK_STORE[feedback_id] = data
        logger.info(f"Feedback submitted for request {interview_request_id} by {submitted_by_role}")
        return data

    @staticmethod
    def get_by_recruiter(recruiter_user_id: str) -> List[Dict[str, Any]]:
        return [
            f for f in _IN_MEMORY_FEEDBACK_STORE.values()
            if f.get("recruiter_user_id") == recruiter_user_id
        ]

    @staticmethod
    def get_by_student(student_id: str) -> List[Dict[str, Any]]:
        return [
            f for f in _IN_MEMORY_FEEDBACK_STORE.values()
            if f.get("student_id") == student_id
        ]

    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        return list(_IN_MEMORY_FEEDBACK_STORE.values())


feedback_service = FeedbackService()
