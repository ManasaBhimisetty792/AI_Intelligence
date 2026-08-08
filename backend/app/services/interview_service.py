import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Fallback in-memory storage if SQL database is running in lightweight/decoupled mode
_IN_MEMORY_INTERVIEW_REQUESTS: Dict[str, Dict[str, Any]] = {}

class InterviewService:
    @staticmethod
    def create_request(
        recruiter_id: str,
        recruiter_user_id: str,
        student_id: str,
        interview_type: str,
        preferred_datetime: str,
        message: Optional[str] = "",
        resume_match_score: Optional[int] = 85
    ) -> Dict[str, Any]:
        request_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        
        request_data = {
            "id": request_id,
            "recruiter_id": recruiter_id,
            "recruiter_user_id": recruiter_user_id,
            "student_id": student_id,
            "interview_type": interview_type,
            "preferred_datetime": preferred_datetime,
            "message": message,
            "status": "pending",
            "resume_match_score": resume_match_score,
            "created_at": created_at,
            "updated_at": created_at,
            "meeting_id": None,
            "meeting_link": None,
            "meeting_date": None,
            "meeting_time": None,
            "duration": "60 mins",
            "reject_reason": None,
            "reschedule_datetime": None,
            "reschedule_reason": None,
            "reschedule_status": None,
        }
        
        _IN_MEMORY_INTERVIEW_REQUESTS[request_id] = request_data
        logger.info(f"Created interview request {request_id} for student {student_id}")
        return request_data

    @staticmethod
    def get_by_id(request_id: str) -> Optional[Dict[str, Any]]:
        return _IN_MEMORY_INTERVIEW_REQUESTS.get(request_id)

    @staticmethod
    def accept_request(
        request_id: str,
        meeting_date: Optional[str] = None,
        meeting_time: Optional[str] = None
    ) -> Dict[str, Any]:
        req = _IN_MEMORY_INTERVIEW_REQUESTS.get(request_id)
        if not req:
            req = {
                "id": request_id,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            _IN_MEMORY_INTERVIEW_REQUESTS[request_id] = req

        room_name = f"room_{request_id[:8]}"
        meeting_id = f"mtg_{uuid.uuid4().hex[:10]}"
        meeting_link = f"/student/live-interview?room={room_name}&session={request_id}"
        
        req["status"] = "accepted"
        req["meeting_id"] = meeting_id
        req["meeting_link"] = meeting_link
        req["room_name"] = room_name
        req["meeting_date"] = meeting_date or req.get("preferred_datetime", "").split("T")[0]
        req["meeting_time"] = meeting_time or (req.get("preferred_datetime", "").split("T")[1][:5] if "T" in req.get("preferred_datetime", "") else "10:00 AM")
        req["updated_at"] = datetime.now(timezone.utc).isoformat()

        logger.info(f"Accepted interview request {request_id}. Meeting room: {room_name}")
        return req

    @staticmethod
    def reject_or_reschedule(
        request_id: str,
        action: str,
        reject_reason: Optional[str] = "",
        reschedule_datetime: Optional[str] = None,
        reschedule_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        req = _IN_MEMORY_INTERVIEW_REQUESTS.get(request_id)
        if not req:
            req = {"id": request_id, "created_at": datetime.now(timezone.utc).isoformat()}
            _IN_MEMORY_INTERVIEW_REQUESTS[request_id] = req

        req["updated_at"] = datetime.now(timezone.utc).isoformat()

        if action == "reschedule":
            req["status"] = "rescheduled"
            req["reschedule_datetime"] = reschedule_datetime
            req["reschedule_reason"] = reschedule_reason or reject_reason
            req["reschedule_status"] = "pending_student"
            req["reject_reason"] = reject_reason
        else:
            req["status"] = "rejected"
            req["reject_reason"] = reject_reason

        return req

    @staticmethod
    def respond_reschedule(
        request_id: str,
        accept: bool
    ) -> Dict[str, Any]:
        req = _IN_MEMORY_INTERVIEW_REQUESTS.get(request_id)
        if not req:
            req = {"id": request_id, "created_at": datetime.now(timezone.utc).isoformat()}
            _IN_MEMORY_INTERVIEW_REQUESTS[request_id] = req

        req["updated_at"] = datetime.now(timezone.utc).isoformat()

        if accept:
            req["status"] = "waiting_recruiter_confirmation"
            req["reschedule_status"] = "accepted_student"
            if req.get("reschedule_datetime"):
                req["preferred_datetime"] = req["reschedule_datetime"]
        else:
            req["status"] = "rejected"
            req["reschedule_status"] = "rejected_student"

        return req

    @staticmethod
    def complete_interview(request_id: str) -> Dict[str, Any]:
        req = _IN_MEMORY_INTERVIEW_REQUESTS.get(request_id)
        if not req:
            req = {"id": request_id, "created_at": datetime.now(timezone.utc).isoformat()}
            _IN_MEMORY_INTERVIEW_REQUESTS[request_id] = req

        req["status"] = "completed"
        req["updated_at"] = datetime.now(timezone.utc).isoformat()
        return req

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        return list(_IN_MEMORY_INTERVIEW_REQUESTS.values())


interview_service = InterviewService()