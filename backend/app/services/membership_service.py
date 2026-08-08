from app.core.config import settings
from app.core.logging import logger

class MembershipService:
    def _get_supabase_client(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            except Exception as e:
                logger.warning(f"Could not init Supabase admin client: {e}")
        return None

    def get_membership_status(self, user_id: str):
        supabase = self._get_supabase_client()
        if supabase:
            try:
                res = supabase.table("profiles").select("id, role, membership_type, is_premium, subscription_status, current_plan, premium_start_date, premium_end_date").eq("id", user_id).single().execute()
                if res.data:
                    return {
                        "is_premium": bool(res.data.get("is_premium", False)),
                        "membership_type": res.data.get("membership_type", "free"),
                        "current_plan": res.data.get("current_plan", "Free Plan"),
                        "subscription_status": res.data.get("subscription_status", "inactive"),
                        "premium_start_date": res.data.get("premium_start_date"),
                        "premium_end_date": res.data.get("premium_end_date")
                    }
            except Exception as e:
                logger.error(f"Error reading membership status from Supabase: {e}")

        return {
            "is_premium": False,
            "membership_type": "free",
            "current_plan": "Free Plan",
            "subscription_status": "inactive"
        }

membership_service = MembershipService()
