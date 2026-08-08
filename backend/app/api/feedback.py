import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.feedback_service import feedback_service
from app.services.notification_service import dispatch_notification_event

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)

class SubmitFeedbackSchema(BaseModel):
    interview_request_id: str
    student_id: str
    recruiter_user_id: str
    overall_rating: float = 5.0
    technical_rating: float = 5.0
    communication_rating: float = 5.0
    behaviour_rating: float = 5.0
    comments: Optional[str] = ""
    recommendation: Optional[str] = "Highly Recommended"
    is_anonymous: bool = False
    submitted_by_role: str = "student"
    student_name: Optional[str] = "Student Candidate"

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: SubmitFeedbackSchema):
    try:
        fb = feedback_service.submit_feedback(
            interview_request_id=payload.interview_request_id,
            student_id=payload.student_id,
            recruiter_user_id=payload.recruiter_user_id,
            overall_rating=payload.overall_rating,
            technical_rating=payload.technical_rating,
            communication_rating=payload.communication_rating,
            behaviour_rating=payload.behaviour_rating,
            comments=payload.comments,
            recommendation=payload.recommendation,
            is_anonymous=payload.is_anonymous,
            submitted_by_role=payload.submitted_by_role
        )

        # Notify Recruiter about feedback received
        if payload.recruiter_user_id:
            displayName = "Anonymous Student" if payload.is_anonymous else payload.student_name
            dispatch_notification_event(
                event_type="feedback_received",
                recipient_id=payload.recruiter_user_id,
                recipient_email="",
                recipient_name="Recruiter",
                title="Student Feedback Received",
                message=f"{displayName} left a {payload.overall_rating}⭐ rating: '{payload.comments[:50]}...'",
                sender_id=payload.student_id,
                sender_role="student",
                receiver_role="recruiter",
                action_url="/recruiter/notifications",
                action_text="View Feedback",
                metadata={
                    "overall_rating": payload.overall_rating,
                    "technical_rating": payload.technical_rating,
                    "communication_rating": payload.communication_rating,
                    "comments": payload.comments,
                    "student_name": displayName,
                    "interview_request_id": payload.interview_request_id
                }
            )

        return {"status": "success", "data": fb}
    except Exception as exc:
        logger.exception("Failed to submit feedback")
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/recruiter/{recruiter_user_id}")
def get_recruiter_feedback(recruiter_user_id: str):
    return {"status": "success", "data": feedback_service.get_by_recruiter(recruiter_user_id)}

@router.get("/student/{student_id}")
def get_student_feedback(student_id: str):
    return {"status": "success", "data": feedback_service.get_by_student(student_id)}

@router.get("/")
def get_all_feedback():
    return {"status": "success", "data": feedback_service.get_all()}
