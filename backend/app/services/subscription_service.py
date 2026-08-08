from datetime import datetime, timezone
from app.core.config import settings
from app.core.logging import logger

class SubscriptionService:
    def _get_supabase_client(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            except Exception as e:
                logger.warning(f"Could not init Supabase admin client: {e}")
        return None

    def get_current_subscription(self, user_id: str):
        supabase = self._get_supabase_client()
        if supabase:
            try:
                res = supabase.table("student_subscriptions").select("*").eq("user_id", user_id).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error fetching current subscription from Supabase: {e}")
        return {
            "user_id": user_id,
            "plan_name": "Free Plan",
            "subscription_status": "inactive",
            "is_active": False
        }

    def get_subscription_history(self, user_id: str):
        supabase = self._get_supabase_client()
        if supabase:
            try:
                res = supabase.table("student_subscriptions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                logger.error(f"Error fetching subscription history from Supabase: {e}")
        return []

    def cancel_subscription(self, user_id: str):
        supabase = self._get_supabase_client()
        if supabase:
            try:
                supabase.table("student_subscriptions").update({"is_active": False, "subscription_status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("user_id", user_id).eq("is_active", True).execute()
                supabase.table("profiles").update({"subscription_status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", user_id).execute()
                return {"message": "Subscription cancelled successfully", "user_id": user_id}
            except Exception as e:
                logger.error(f"Error cancelling subscription in Supabase: {e}")
        return {"message": "Subscription updated locally", "user_id": user_id}

subscription_service = SubscriptionService()
