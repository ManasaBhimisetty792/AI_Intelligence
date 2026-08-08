"""
Razorpay Service — Production-Ready
====================================
- Creates Razorpay orders via the official REST API.
- Verifies payment signatures using HMAC-SHA256.
- Switching to Live Mode requires only changing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.
"""
import hmac
import hashlib
import time
import uuid
import httpx
from app.core.config import settings
from app.core.logging import logger


class RazorpayService:
    def __init__(self):
        self.key_id: str = settings.RAZORPAY_KEY_ID
        self.key_secret: str = settings.RAZORPAY_KEY_SECRET

    @property
    def _is_placeholder(self) -> bool:
        """Returns True when real API keys have NOT been configured yet."""
        return (
            not self.key_id
            or "placeholder" in self.key_id.lower()
            or not self.key_secret
            or "placeholder" in self.key_secret.lower()
        )

    def create_order(
        self,
        amount: float,
        currency: str = "INR",
        receipt: str | None = None,
    ) -> dict:
        """
        Create a Razorpay Order.

        Args:
            amount:   Amount in INR (will be converted to paise automatically).
            currency: Currency code (default 'INR').
            receipt:  Optional receipt string for idempotency.

        Returns:
            Razorpay order dict with keys: id, amount, currency, status, …
        """
        amount_in_paise = int(amount * 100)  # INR → paise
        receipt_id = receipt or f"rcpt_{uuid.uuid4().hex[:12]}"

        # ── Development fallback when real keys are not configured ──────────
        if self._is_placeholder:
            logger.warning(
                "Razorpay placeholder keys detected — returning mock order for local dev. "
                "Set real RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to use live checkout."
            )
            return {
                "id": f"order_mock_{uuid.uuid4().hex[:16]}",
                "entity": "order",
                "amount": amount_in_paise,
                "amount_paid": 0,
                "amount_due": amount_in_paise,
                "currency": currency,
                "receipt": receipt_id,
                "status": "created",
                "attempts": 0,
                "created_at": int(time.time()),
                "is_mock": True,
            }

        # ── Real Razorpay API Call ──────────────────────────────────────────
        try:
            url = "https://api.razorpay.com/v1/orders"
            payload = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": receipt_id,
                "payment_capture": 1,  # Auto-capture after payment
            }
            response = httpx.post(
                url,
                json=payload,
                auth=(self.key_id, self.key_secret),
                timeout=15.0,
            )
            response.raise_for_status()
            order = response.json()
            logger.info(f"Razorpay order created: {order.get('id')} for ₹{amount}")
            return order

        except httpx.HTTPStatusError as e:
            logger.error(
                f"Razorpay API HTTP error {e.response.status_code}: {e.response.text}"
            )
            raise ValueError(
                f"Razorpay order creation failed: {e.response.json().get('error', {}).get('description', str(e))}"
            )
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise ValueError(f"Payment gateway unreachable: {str(e)}")

    def verify_signature(
        self, order_id: str, payment_id: str, signature: str
    ) -> bool:
        """
        Verify Razorpay HMAC-SHA256 payment signature.

        The message is: "{order_id}|{payment_id}"
        The signature is computed with RAZORPAY_KEY_SECRET as the HMAC key.

        Returns True if signature is valid, False otherwise.
        """
        if not signature:
            logger.warning("Razorpay signature verification: empty signature received")
            return False

        # ── Development bypass when placeholder keys are configured ─────────
        if self._is_placeholder:
            logger.warning(
                "Razorpay placeholder keys — skipping real signature verification in dev mode."
            )
            return bool(signature)  # Accept any non-empty signature locally

        # ── Real HMAC-SHA256 Verification ────────────────────────────────────
        try:
            message = f"{order_id}|{payment_id}".encode("utf-8")
            secret = self.key_secret.encode("utf-8")

            # Python's hmac.new() computes the HMAC
            computed = hmac.new(secret, message, hashlib.sha256).hexdigest()

            # Constant-time comparison to prevent timing attacks
            is_valid = hmac.compare_digest(computed, signature)
            if not is_valid:
                logger.warning(
                    f"Razorpay signature mismatch for order={order_id}, payment={payment_id}"
                )
            return is_valid

        except Exception as e:
            logger.error(f"Razorpay signature verification error: {e}")
            return False

    def get_key_id(self) -> str:
        """Return the configured key ID (safe to expose to frontend)."""
        return self.key_id


# Singleton instance
razorpay_service = RazorpayService()
