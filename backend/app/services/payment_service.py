from datetime import datetime, timezone, timedelta
import uuid
from app.core.config import settings
from app.core.logging import logger
from app.services.razorpay_service import razorpay_service

class PaymentService:
    def _get_supabase_client(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            except Exception as e:
                logger.warning(f"Could not init Supabase admin client: {e}")
        return None

    def record_payment(self, user_id: str, order_id: str, payment_id: str, signature: str, amount: float, plan_name: str = "Student Premium", status: str = "success", raw_response: dict = None):
        invoice_no = f"INV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        payment_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "order_id": order_id,
            "payment_id": payment_id,
            "signature": signature,
            "amount": amount,
            "currency": "INR",
            "plan_name": plan_name,
            "payment_status": status,
            "payment_method": "Razorpay",
            "invoice_number": invoice_no,
            "transaction_reference": f"TXN_{order_id}",
            "razorpay_response": raw_response or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        supabase = self._get_supabase_client()
        if supabase:
            try:
                supabase.table("student_payments").insert(payment_record).execute()
                logger.info(f"Payment record saved to Supabase: {invoice_no}")
            except Exception as e:
                logger.error(f"Failed to insert student_payments record in Supabase: {e}")

        if status == "success":
            self.activate_premium_membership(user_id=user_id, plan_name=plan_name, payment_record_id=payment_record["id"])

        return payment_record

    def activate_premium_membership(self, user_id: str, plan_name: str = "Student Premium", payment_record_id: str = None):
        start_date = datetime.now(timezone.utc)
        end_date = start_date + timedelta(days=365)

        supabase = self._get_supabase_client()
        if supabase:
            try:
                profile_update = {
                    "is_premium": True,
                    "membership_type": "premium",
                    "current_plan": plan_name,
                    "subscription_status": "active",
                    "premium_start_date": start_date.isoformat(),
                    "premium_end_date": end_date.isoformat(),
                    "updated_at": start_date.isoformat()
                }
                supabase.table("profiles").update(profile_update).eq("id", user_id).execute()
                supabase.table("student_subscriptions").update({"is_active": False, "subscription_status": "expired"}).eq("user_id", user_id).execute()

                subscription_record = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "plan_name": plan_name,
                    "subscription_status": "active",
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "is_active": True,
                    "auto_renew": False,
                    "payment_id": payment_record_id,
                    "created_at": start_date.isoformat(),
                    "updated_at": start_date.isoformat()
                }
                supabase.table("student_subscriptions").insert(subscription_record).execute()
                logger.info(f"Activated Premium membership for user: {user_id}")
            except Exception as e:
                logger.error(f"Failed to activate premium in Supabase: {e}")

    def get_payment_history(self, user_id: str):
        supabase = self._get_supabase_client()
        if supabase:
            try:
                res = supabase.table("student_payments").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                logger.error(f"Error fetching payment history from Supabase: {e}")
        return []

payment_service = PaymentService()
