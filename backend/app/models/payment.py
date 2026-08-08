"""
SQLAlchemy model for the student_payments table.
Mirrors the Supabase `student_payments` schema exactly.
"""
from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Numeric,
    DateTime,
    Text,
    JSON,
)
from app.models.user import Base


class Payment(Base):
    """
    Permanent record of every Razorpay payment attempt.
    One row per payment (success or failure).
    """

    __tablename__ = "student_payments"

    # Primary key
    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Foreign key — references auth user / profile
    user_id = Column(String, nullable=False, index=True)

    # Razorpay IDs
    order_id = Column(String, nullable=False, index=True)
    payment_id = Column(String, nullable=True)  # Null for failed payments
    signature = Column(Text, nullable=True)

    # Financials
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="INR", nullable=False)

    # Plan metadata
    plan_name = Column(String, default="Student Premium", nullable=False)

    # Status: created | success | failed | refunded
    payment_status = Column(String, nullable=False, default="created")

    # Method: Razorpay | UPI | card | netbanking
    payment_method = Column(String, default="Razorpay")

    # Invoice / receipt tracking
    invoice_number = Column(String, nullable=True, unique=True)
    transaction_reference = Column(String, nullable=True)

    # Full Razorpay response blob for audit trail
    razorpay_response = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Payment id={self.id} order={self.order_id} "
            f"status={self.payment_status} amount=₹{self.amount}>"
        )
