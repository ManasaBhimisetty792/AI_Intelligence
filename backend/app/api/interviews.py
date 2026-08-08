import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.interview_service import interview_service
from app.services.notification_service import dispatch_notification_event

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)

class CreateInterviewRequestSchema(BaseModel):
    recruiter_id: str
    recruiter_user_id: str
    student_id: str
    interview_type: str = "Technical Deep Dive"
    preferred_datetime: str
    message: Optional[str] = ""
    student_name: Optional[str] = "Student Candidate"
    student_email: Optional[str] = ""
    resume_match_score: Optional[int] = 85

class AcceptInterviewRequestSchema(BaseModel):
    meeting_date: Optional[str] = None
    meeting_time: Optional[str] = None
    recruiter_name: Optional[str] = "Recruiter"

class RejectOrRescheduleSchema(BaseModel):
    action: str = "reject"  # "reject" or "reschedule"
    reject_reason: Optional[str] = ""
    reschedule_datetime: Optional[str] = None
    reschedule_reason: Optional[str] = None
    recruiter_name: Optional[str] = "Recruiter"

class RespondRescheduleSchema(BaseModel):
    accept: bool
    student_name: Optional[str] = "Student Candidate"

@router.post("/request", status_code=status.HTTP_201_CREATED)
def create_interview_request(payload: CreateInterviewRequestSchema):
    try:
        req = interview_service.create_request(
            recruiter_id=payload.recruiter_id,
            recruiter_user_id=payload.recruiter_user_id,
            student_id=payload.student_id,
            interview_type=payload.interview_type,
            preferred_datetime=payload.preferred_datetime,
            message=payload.message,
            resume_match_score=payload.resume_match_score
        )

        dispatch_notification_event(
            event_type="interview_request",
            recipient_id=payload.recruiter_user_id,
            recipient_email="",
            recipient_name="Recruiter",
            title="New Interview Request Received",
            message=f"{payload.student_name} requested a {payload.interview_type} session for {payload.preferred_datetime}.",
            sender_id=payload.student_id,
            sender_role="student",
            receiver_role="recruiter",
            action_url="/recruiter/notifications",
            action_text="View Request & Respond",
            metadata={
                "candidate_name": payload.student_name,
                "candidate_email": payload.student_email,
                "interview_type": payload.interview_type,
                "preferred_datetime": payload.preferred_datetime,
                "resume_match_score": payload.resume_match_score,
                "message": payload.message,
                "request_id": req["id"]
            }
        )
        return {"status": "success", "data": req}
    except Exception as exc:
        logger.exception("Failed to create interview request")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{request_id}/accept")
def accept_interview_request(request_id: str, payload: AcceptInterviewRequestSchema):
    try:
        req = interview_service.accept_request(
            request_id=request_id,
            meeting_date=payload.meeting_date,
            meeting_time=payload.meeting_time
        )

        if req.get("student_id"):
            dispatch_notification_event(
                event_type="interview_accepted",
                recipient_id=req["student_id"],
                recipient_email="",
                recipient_name="Student",
                title="Interview Scheduled!",
                message=f"Your interview with {payload.recruiter_name} has been confirmed for {req.get('meeting_date')} at {req.get('meeting_time')}.",
                sender_id=req.get("recruiter_user_id"),
                sender_role="recruiter",
                receiver_role="student",
                action_url=req.get("meeting_link"),
                action_text="Join Meeting",
                metadata={
                    "recruiter_name": payload.recruiter_name,
                    "meeting_link": req.get("meeting_link"),
                    "room_name": req.get("room_name"),
                    "meeting_date": req.get("meeting_date"),
                    "meeting_time": req.get("meeting_time"),
                    "request_id": request_id
                }
            )

        return {"status": "success", "data": req}
    except Exception as exc:
        logger.exception("Failed to accept interview request")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{request_id}/reject-or-reschedule")
def reject_or_reschedule_interview_request(request_id: str, payload: RejectOrRescheduleSchema):
    try:
        req = interview_service.reject_or_reschedule(
            request_id=request_id,
            action=payload.action,
            reject_reason=payload.reject_reason,
            reschedule_datetime=payload.reschedule_datetime,
            reschedule_reason=payload.reschedule_reason
        )

        if req.get("student_id"):
            title = "Interview Reschedule Proposed" if payload.action == "reschedule" else "Interview Request Declined"
            msg = f"{payload.recruiter_name} proposed a new slot: {payload.reschedule_datetime}." if payload.action == "reschedule" else f"Reason: {payload.reject_reason or 'No reason specified.'}"
            
            dispatch_notification_event(
                event_type="interview_rescheduled" if payload.action == "reschedule" else "interview_rejected",
                recipient_id=req["student_id"],
                recipient_email="",
                recipient_name="Student",
                title=title,
                message=msg,
                sender_id=req.get("recruiter_user_id"),
                sender_role="recruiter",
                receiver_role="student",
                action_url="/student/notifications",
                action_text="Review Reschedule" if payload.action == "reschedule" else "View Details",
                metadata={
                    "action": payload.action,
                    "reject_reason": payload.reject_reason,
                    "reschedule_datetime": payload.reschedule_datetime,
                    "request_id": request_id
                }
            )

        return {"status": "success", "data": req}
    except Exception as exc:
        logger.exception("Failed to reject or reschedule interview request")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{request_id}/respond-reschedule")
def respond_reschedule(request_id: str, payload: RespondRescheduleSchema):
    try:
        req = interview_service.respond_reschedule(request_id=request_id, accept=payload.accept)

        if req.get("recruiter_user_id"):
            dispatch_notification_event(
                event_type="reschedule_accepted" if payload.accept else "reschedule_declined",
                recipient_id=req["recruiter_user_id"],
                recipient_email="",
                recipient_name="Recruiter",
                title=f"Reschedule {'Accepted' if payload.accept else 'Declined'}",
                message=f"{payload.student_name} {'accepted' if payload.accept else 'declined'} your proposed time slot.",
                sender_id=req.get("student_id"),
                sender_role="student",
                receiver_role="recruiter",
                action_url="/recruiter/notifications",
                action_text="Confirm & Generate Link" if payload.accept else "View Notifications",
                metadata={
                    "accept": payload.accept,
                    "request_id": request_id
                }
            )

        return {"status": "success", "data": req}
    except Exception as exc:
        logger.exception("Failed to process reschedule response")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{request_id}/complete")
def complete_interview(request_id: str):
    try:
        req = interview_service.complete_interview(request_id=request_id)
        
        # Notify student to fill feedback form
        if req.get("student_id"):
            dispatch_notification_event(
                event_type="interview_completed",
                recipient_id=req["student_id"],
                recipient_email="",
                recipient_name="Student",
                title="Interview Completed!",
                message="Please leave your feedback and rating for this interview session.",
                sender_id=req.get("recruiter_user_id"),
                sender_role="system",
                receiver_role="student",
                action_url=f"/student/interview-history?feedback={request_id}",
                action_text="Leave Feedback",
                metadata={"request_id": request_id}
            )

        return {"status": "success", "data": req}
    except Exception as exc:
        logger.exception("Failed to mark interview as completed")
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/")
def list_interviews():
    return {"status": "success", "data": interview_service.list_all()}
