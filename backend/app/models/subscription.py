"""
SQLAlchemy model for the student_subscriptions table.
Tracks each Premium subscription period a student has.
"""
from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
)
from app.models.user import Base


class Subscription(Base):
    """
    One row per subscription activation.
    When a student pays again or renews, a new row is inserted
    and the previous one is marked expired.
    """

    __tablename__ = "student_subscriptions"

    # Primary key
    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Foreign key — user / profile
    user_id = Column(String, nullable=False, index=True)

    # Plan details
    plan_name = Column(String, nullable=False, default="Student Premium")

    # Status: active | cancelled | expired
    subscription_status = Column(String, nullable=False, default="active")

    # Validity window
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)

    # Flags
    is_active = Column(Boolean, default=True, nullable=False)
    auto_renew = Column(Boolean, default=False, nullable=False)

    # Link to the triggering payment record
    payment_id = Column(String, nullable=True)  # UUID of Payment row

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Subscription id={self.id} user={self.user_id} "
            f"plan={self.plan_name} status={self.subscription_status}>"
        )
