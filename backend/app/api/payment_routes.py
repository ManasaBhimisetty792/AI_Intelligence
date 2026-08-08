from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.services.razorpay_service import razorpay_service
from app.database.supabase_client import supabase
from app.middleware.auth_middleware import get_current_user


from fastapi import APIRouter, Request
from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import get_current_user
from app.models.user import Profile

from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)

from app.services.razorpay_service import razorpay_service
from app.services.payment_service import payment_service
from app.services.subscription_service import subscription_service

router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)

@router.post("/webhook")
async def razorpay_webhook(request: Request):

    body = await request.body()

    print(body)

    return {
        "success": True
    }
router = APIRouter()

class CreateOrderRequest(BaseModel):
    amount: int
    currency: str = "INR"
    plan_name: str = "Premium"

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan_name: str
    billing_cycle: str  # 'monthly' or 'yearly'

@router.post("/create-order")
async def create_order(request: CreateOrderRequest, user: dict = Depends(get_current_user)):
    """Create Razorpay order"""
    try:
        order = razorpay_service.create_order(
    amount=request.amount,
    currency=request.currency
)
        
        # Store pending transaction
        supabase.table("payment_history").insert({
            "candidate_id": user["id"],
            "razorpay_order_id": order["id"],
            "amount": request.amount,
            "currency": request.currency,
            "status": "pending",
            "plan_name": request.plan_name
        }).execute()
        
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(request: VerifyPaymentRequest, user: dict = Depends(get_current_user)):
    """Verify payment and activate subscription in candidate_profiles"""
    # Verify signature
    is_valid = razorpay_service.verify_signature(
    order_id=request.order_id,
    payment_id=request.payment_id,
    signature=request.signature
)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Calculate subscription dates
    now = datetime.now()
    if request.billing_cycle == "yearly":
        end_date = now + timedelta(days=365)
    else:  # monthly
        end_date = now + timedelta(days=30)
    
    # Update candidate_profiles with subscription data
    update_result = supabase.table("candidate_profiles").update({
        "is_premium": True,
        "membership_type": "premium",
        "current_plan": "premium",
        "subscription_status": "active",
        "subscription_plan_id": request.plan_name.lower(),
        "subscription_start_date": now.isoformat(),
        "subscription_end_date": end_date.isoformat(),
        "billing_cycle": request.billing_cycle,
        "last_payment_id": request.payment_id,
        "last_payment_amount": None,  # Will be fetched from order
        "last_payment_date": now.isoformat(),
        "updated_at": now.isoformat()
    }).eq("id", user["id"]).execute()
    
    # Update payment_history
    supabase.table("payment_history").update({
        "razorpay_payment_id": request.payment_id,
        "razorpay_signature": request.signature,
        "status": "captured"
    }).eq("razorpay_order_id", request.order_id).execute()
    
    return {
        "status": "success",
        "subscription_end_date": end_date.isoformat(),
        "message": "Subscription activated successfully"
    }

@router.get("/subscription-status")
async def get_subscription_status(user: dict = Depends(get_current_user)):
    """Get user's subscription status from candidate_profiles"""
    try:
        # Fetch profile with subscription fields
        result = supabase.table("candidate_profiles")\
            .select("is_premium,membership_type,current_plan,subscription_status,"
                    "subscription_start_date,subscription_end_date,billing_cycle,"
                    "last_payment_id,last_payment_date")\
            .eq("id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = result.data[0]
        
        # Check if subscription is still active
        is_active = (
            profile["subscription_status"] == "active" and
            profile["subscription_end_date"] and
            datetime.fromisoformat(profile["subscription_end_date"]) > datetime.now()
        )
        
        if not is_active:
            # Subscription expired - update status
            supabase.table("candidate_profiles").update({
                "subscription_status": "expired",
                "is_premium": False
            }).eq("id", user["id"]).execute()
            
            return {
                "is_premium": False,
                "status": "expired",
                "message": "Your subscription has expired"
            }
        
        return {
            "is_premium": True,
            "status": "active",
            "plan": profile["current_plan"],
            "billing_cycle": profile["billing_cycle"],
            "renewal_date": profile["subscription_end_date"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel-subscription")
async def cancel_subscription(user: dict = Depends(get_current_user)):
    """Cancel subscription (set to inactive)"""
    try:
        supabase.table("candidate_profiles").update({
            "subscription_status": "cancelled",
            "is_premium": True,  # Keep premium until end date
            "current_plan": "cancelled"
        }).eq("id", user["id"]).execute()
        
        return {"status": "success", "message": "Subscription cancelled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))