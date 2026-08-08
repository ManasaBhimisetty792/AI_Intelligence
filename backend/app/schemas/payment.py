from typing import Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class CreateOrderRequest(BaseModel):
    plan_name: str = Field(default="Student Premium", description="Target plan name")
    amount: float = Field(default=1499.0, description="Amount in INR")
    currency: str = Field(default="INR", description="Currency code")

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    is_mock: Optional[bool] = False

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan_name: str = "Student Premium"
    amount: float = 1499.0

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    payment_id: str
    membership_type: str = "premium"
    is_premium: bool = True
    transaction_id: str

class PaymentRecord(BaseModel):
    id: str
    user_id: str
    order_id: str
    payment_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    plan_name: str
    payment_status: str
    invoice_number: Optional[str] = None
    created_at: datetime

class MembershipStatusResponse(BaseModel):
    is_premium: bool
    membership_type: str
    current_plan: str
    subscription_status: str
    premium_start_date: Optional[str] = None
    premium_end_date: Optional[str] = None
