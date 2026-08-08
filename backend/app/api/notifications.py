"""
notifications.py — Notification API routes for SkillTrack AI.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.notification_service import (
    dispatch_notification_event,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


class NotificationRequest(BaseModel):
    """
    Request body used to dispatch a notification.
    """

    event_type: Optional[str] = Field(None)
    event: Optional[str] = Field(None)
    recipient_id: Optional[str] = Field("user_guest")
    recipient_email: Optional[str] = Field("")
    recipient_name: Optional[str] = Field("User")
    to_email: Optional[str] = Field(None)
    name: Optional[str] = Field(None)
    title: Optional[str] = Field("Notification")
    message: Optional[str] = Field("You have a new update.")

    sender_id: Optional[str] = None
    sender_role: str = "system"
    receiver_role: str = "student"

    action_url: Optional[str] = None
    action_text: Optional[str] = None

    metadata: Optional[Dict[str, Any]] = None
    send_smtp: bool = True


class NotificationResponse(BaseModel):
    """
    Response returned after attempting notification dispatch.
    """

    user_notification_created: bool
    admin_notification_created: bool
    smtp_sent: bool
    smtp_error: Optional[str] = None


@router.get("/")
async def notification_health() -> Dict[str, str]:
    """
    Check whether the notifications router is available.
    """
    return {
        "status": "ok",
        "service": "notifications",
    }


@router.post(
    "/dispatch",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
@router.post(
    "/send-email",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
async def dispatch_notification(
    request: NotificationRequest,
) -> NotificationResponse:
    """
    Dispatch an application notification and optionally send an email.
    """

    try:
        final_event = request.event_type or request.event or "system"
        final_email = request.recipient_email or request.to_email or ""
        final_name = request.recipient_name or request.name or "User"

        result = dispatch_notification_event(
            event_type=final_event,
            recipient_id=request.recipient_id or "user_guest",
            recipient_email=final_email,
            recipient_name=final_name,
            title=request.title or "SkillTrack Notification",
            message=request.message or "You have a new update.",
            sender_id=request.sender_id,
            sender_role=request.sender_role,
            receiver_role=request.receiver_role,
            action_url=request.action_url,
            action_text=request.action_text,
            metadata=request.metadata,
            send_smtp=request.send_smtp,
        )

        return NotificationResponse(**result)

    except Exception as exc:
        logger.exception("Notification dispatch failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to dispatch notification",
        ) from exc