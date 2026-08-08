/**
 * usePayment — Official Razorpay Native Checkout Hook
 * ====================================================
 * - Launches Razorpay's native Checkout Modal when Upgrade is clicked.
 * - Handles payment verification, activates Premium state, and redirects to dashboard.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import paymentService, { loadRazorpaySDK } from '../services/paymentService';
import { tokenStorage } from '../services/api';

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TK5SkXFb1fsSwg';

export const PLANS = {
  student_premium: {
    planName: 'Student Premium',
    amount: 1499,
    currency: 'INR',
    description: 'Unlimited AI Mock Interviews + ATS + Certificates',
    durationLabel: '1 Year Access',
  },
};

export const usePayment = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('idle'); // idle | loading | checkout | verifying | success | failed
  const [error, setError] = useState(null);

  const initiatePayment = useCallback(
    async (planKey = 'student_premium') => {
      // ── Guard: Login Check ─────────────────────────────────────────────
      if (!user) {
        toast.error('Please sign in to upgrade to Premium.');
        navigate('/login');
        return;
      }

      const plan = PLANS[planKey] || PLANS.student_premium;

      setStatus('loading');
      setError(null);
      const toastId = toast.loading('Initializing Razorpay Checkout…');

      try {
        // Load official Razorpay SDK
        const sdkLoaded = await loadRazorpaySDK();
        if (!sdkLoaded) {
          throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
        }

        // Try creating backend order if available
        let order = null;
        try {
          order = await paymentService.createOrder({
            planName: plan.planName,
            amount: plan.amount,
            currency: plan.currency,
          });
        } catch (e) {
          console.warn('Backend order creation warning:', e.message);
        }

        toast.dismiss(toastId);

        const keyId =
          (order && order.key_id && !order.key_id.includes('placeholder'))
            ? order.key_id
            : (RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes('placeholder'))
            ? RAZORPAY_KEY_ID
            : 'rzp_test_TK5SkXFb1fsSwg';

        // Official Razorpay Native Options
        const options = {
          key: keyId,
          amount: (order && order.amount) ? order.amount : plan.amount * 100, // Amount in paise
          currency: (order && order.currency) ? order.currency : plan.currency,
          name: 'SkillTrack AI',
          description: plan.description,
          prefill: {
            name: user.name || user.full_name || 'Student Candidate',
            email: user.email || 'student@example.com',
            contact: user.phone || user.mobile || '9856321472',
          },
          notes: {
            platform: 'SkillTrack AI',
            plan: plan.planName,
            user_id: user.id || '',
          },
          theme: {
            color: '#6366f1',
          },
          handler: async (razorpayResponse) => {
            setStatus('verifying');
            const verifyToastId = toast.loading('Verifying payment & activating Premium…');

            try {
              const verification = await paymentService.verifyPayment({
                orderId: razorpayResponse.razorpay_order_id || (order && order.order_id) || `order_${Date.now()}`,
                paymentId: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
                signature: razorpayResponse.razorpay_signature || 'sig_demo',
                planName: plan.planName,
                amount: plan.amount,
                user,
              });

              const updatedUser = {
                ...user,
                is_premium: true,
                membership_type: 'premium',
                current_plan: plan.planName,
              };
              setUser(updatedUser);
              tokenStorage.set({ user: updatedUser, access: tokenStorage.access });

              toast.success('🎉 Welcome to SkillTrack AI Premium!', {
                id: verifyToastId,
                duration: 3000,
              });
              setStatus('success');

              // Redirect to Payment Success page (which auto redirects to dashboard) or direct dashboard redirect
              const dashboardPath = user.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard';
              navigate('/payment-success', {
                replace: true,
                state: {
                  transactionId: verification.transaction_id || razorpayResponse.razorpay_payment_id,
                  paymentId: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
                  orderId: razorpayResponse.razorpay_order_id || (order && order.order_id) || `order_${Date.now()}`,
                  amount: plan.amount,
                  planName: plan.planName,
                  invoiceNumber: verification.invoice_number || null,
                  redirectTo: dashboardPath,
                },
              });
            } catch (verifyErr) {
              toast.error(verifyErr.message || 'Payment verification failed.', {
                id: verifyToastId,
              });
              setStatus('failed');
              setError(verifyErr.message || 'Signature verification error');
              navigate('/payment-failed', {
                replace: true,
                state: { reason: verifyErr.message || 'Signature mismatch' },
              });
            }
          },
          modal: {
            ondismiss: () => {
              setStatus('idle');
              toast('Payment cancelled.', { icon: 'ℹ️' });
            },
            backdropclose: false,
            escape: true,
            animation: true,
          },
        };

        if (order && order.order_id && !order.order_id.startsWith('order_mock_')) {
          options.order_id = order.order_id;
        }

        setStatus('checkout');
        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', (failedResponse) => {
          const reason =
            failedResponse.error?.description ||
            failedResponse.error?.reason ||
            'Transaction declined by gateway';

          console.warn('Razorpay payment.failed event:', failedResponse.error);
          toast.error(`Payment failed: ${reason}`);
          setStatus('failed');
          setError(reason);
          navigate('/payment-failed', {
            replace: true,
            state: { reason },
          });
        });

        rzp.open();
      } catch (err) {
        toast.dismiss(toastId);
        console.error('Razorpay initialization error:', err);
        toast.error(err.message || 'Could not open Razorpay checkout modal.');
        setStatus('failed');
        setError(err.message || 'Unknown error');
      }
    },
    [user, navigate, setUser]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    initiatePayment,
    reset,
    status,
    error,
    isLoading: status === 'loading' || status === 'verifying',
    isCheckout: status === 'checkout',
    isSuccess: status === 'success',
    isFailed: status === 'failed',
  };
};

export default usePayment;

