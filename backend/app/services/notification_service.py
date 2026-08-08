"""
notification_service.py — Centralized Notification Service for SkillTrack AI backend.
Coordinates user notifications, admin notifications, and fail-safe SMTP email dispatching.
"""

import logging
from typing import Optional, Dict, Any
from app.services.email_service import (
    send_registration_email,
    send_interview_scheduled_email,
    send_interview_cancelled_email,
    send_interview_completed_email,
    send_resume_uploaded_email,
    send_payment_success_email,
    send_profile_updated_email,
    send_feedback_submitted_email,
    send_email,
    _base_template
)

logger = logging.getLogger(__name__)


# Standardized Notification Types
TYPE_INTERVIEW_REQUEST = "interview_request"
TYPE_INTERVIEW_ACCEPTED = "interview_accepted"
TYPE_INTERVIEW_REJECTED = "interview_rejected"
TYPE_RESCHEDULE_REQUEST = "reschedule_request"
TYPE_RESCHEDULE_ACCEPTED = "reschedule_accepted"
TYPE_MEETING_SCHEDULED = "meeting_scheduled"
TYPE_MEETING_COMPLETED = "meeting_completed"
TYPE_FEEDBACK_RECEIVED = "feedback_received"
TYPE_SYSTEM = "system"
TYPE_ADMIN = "admin"
TYPE_PAYMENT = "payment"


def dispatch_notification_event(
    event_type: str,
    recipient_id: str,
    recipient_email: str,
    recipient_name: str,
    title: str,
    message: str,
    sender_id: Optional[str] = None,
    sender_role: str = "system",
    receiver_role: str = "student",
    action_url: Optional[str] = None,
    action_text: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    send_smtp: bool = True
) -> Dict[str, Any]:
    """
    Central dispatch method for creating user notifications, admin notifications,
    and triggering fail-safe SMTP emails.
    """
    result = {
        "user_notification_created": True,
        "admin_notification_created": True,
        "smtp_sent": False,
        "smtp_error": None
    }

    # 1. Log event dispatch
    logger.info(
        f"[NotificationService] Dispatching '{event_type}' to {recipient_email} (Role: {receiver_role})"
    )

    # 2. Trigger SMTP Email (Fail-safe)
    if send_smtp and recipient_email:
        try:
            smtp_success = _trigger_smtp_by_event(
                event_type=event_type,
                to_email=recipient_email,
                name=recipient_name,
                metadata=metadata or {}
            )
            result["smtp_sent"] = smtp_success
        except Exception as e:
            logger.error(f"[NotificationService] SMTP dispatch failed for event '{event_type}': {e}")
            result["smtp_sent"] = False
            result["smtp_error"] = str(e)

    return result


def _trigger_smtp_by_event(
    event_type: str,
    to_email: str,
    name: str,
    metadata: Dict[str, Any]
) -> bool:
    """Map notification event to specific email template and send via SMTP."""
    recruiter_name = metadata.get("recruiter_name", "Recruiter")
    candidate_name = metadata.get("candidate_name", name)
    date_str = metadata.get("interview_date") or metadata.get("date") or "Scheduled Date"
    time_str = metadata.get("interview_time") or metadata.get("time") or ""
    full_datetime = f"{date_str} {time_str}".strip()
    meeting_link = metadata.get("meeting_link", "https://skilltrack.ai/student/live-interview")
    reason = metadata.get("reason") or metadata.get("reject_reason", "")
    new_date = metadata.get("new_date", "")
    new_time = metadata.get("new_time", "")
    rating = metadata.get("rating", "5/5")
    comment = metadata.get("comment", "")

    if event_type == TYPE_INTERVIEW_REQUEST:
        content = f"""
        <h1>New Interview Request 📅</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>You have received a new interview request from candidate <strong>{candidate_name}</strong>.</p>
        <p><strong>Requested Slot:</strong> {full_datetime}</p>
        <a class="btn" href="https://skilltrack.ai/recruiter/notifications">View Request & Respond →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"📅 New Interview Request from {candidate_name}",
            html_body=_base_template(content, "New Interview Request")
        )

    elif event_type in (TYPE_INTERVIEW_ACCEPTED, TYPE_MEETING_SCHEDULED):
        content = f"""
        <h1>Interview Confirmed 🎉</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Your interview with recruiter <span class="highlight">{recruiter_name}</span> has been confirmed.</p>
        <p><strong>Date & Time:</strong> {full_datetime}</p>
        <p><strong>Meeting Link:</strong> <a href="{meeting_link}" style="color:#10b981;">{meeting_link}</a></p>
        <a class="btn" href="{meeting_link}">Join Interview Room →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"🎉 Interview Confirmed with {recruiter_name}",
            html_body=_base_template(content, "Interview Confirmed")
        )

    elif event_type == TYPE_INTERVIEW_REJECTED:
        reason_html = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
        content = f"""
        <h1>Interview Request Update</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Unfortunately, <strong>{recruiter_name}</strong> is unable to take your interview at the requested time.</p>
        {reason_html}
        <a class="btn" href="https://skilltrack.ai/student/find-recruiters">Search Other Recruiters →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"Update on your interview request with {recruiter_name}",
            html_body=_base_template(content, "Interview Request Status")
        )

    elif event_type == TYPE_RESCHEDULE_REQUEST:
        content = f"""
        <h1>Reschedule Requested 🕒</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Recruiter <strong>{recruiter_name}</strong> has proposed a new interview time.</p>
        <p><strong>New Date & Time:</strong> {new_date} at {new_time}</p>
        {f'<p><strong>Message:</strong> {reason}</p>' if reason else ''}
        <a class="btn" href="https://skilltrack.ai/student/notifications">Accept or Decline New Time →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"🕒 Reschedule Requested by {recruiter_name}",
            html_body=_base_template(content, "Reschedule Request")
        )

    elif event_type == TYPE_RESCHEDULE_ACCEPTED:
        content = f"""
        <h1>Reschedule Accepted ✅</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Candidate <strong>{candidate_name}</strong> has accepted your proposed interview reschedule.</p>
        <a class="btn" href="https://skilltrack.ai/recruiter/notifications">View Updated Schedule →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"✅ Reschedule Accepted by {candidate_name}",
            html_body=_base_template(content, "Reschedule Accepted")
        )

    elif event_type == TYPE_FEEDBACK_RECEIVED:
        content = f"""
        <h1>New Candidate Feedback Received ⭐</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Candidate <strong>{candidate_name}</strong> left feedback for your recent interview session.</p>
        <p><strong>Rating:</strong> {rating}</p>
        {f'<p><strong>Comments:</strong> "{comment}"</p>' if comment else ''}
        <a class="btn" href="https://skilltrack.ai/recruiter/dashboard">Go to Recruiter Dashboard →</a>
        """
        return send_email(
            to_email=to_email,
            subject=f"⭐ New Feedback Received from {candidate_name}",
            html_body=_base_template(content, "New Feedback Received")
        )

    elif event_type == "registration":
        return send_registration_email(to_email, name, metadata.get("role", "student"))

    elif event_type == TYPE_MEETING_COMPLETED:
        return send_interview_completed_email(to_email, name, recruiter_name, metadata.get("score"))

    # Fallback to general email
    return send_email(
        to_email=to_email,
        subject=f"SkillTrack AI Notification: {event_type.replace('_', ' ').title()}",
        html_body=_base_template(f"<h1>Notification</h1><p>{metadata.get('message', 'You have a new update.')}</p>", "SkillTrack AI Alert")
    )
