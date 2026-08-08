import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const {
    transactionId = 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    paymentId = 'pay_test_' + Math.random().toString(36).substring(2, 9),
    orderId = 'order_test_' + Math.random().toString(36).substring(2, 9),
    amount = 1499,
    planName = 'Student Premium',
    invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000),
  } = state;

  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/student/dashboard', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: -20,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
              rotate: 360,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear'
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'][i % 5]
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center z-10 relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white mb-2">Payment Successful!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Thank you for subscribing. Your account has been upgraded to <span className="text-indigo-400 font-semibold">{planName}</span>.
        </p>

        {/* Transaction Summary Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span>Amount Paid</span>
            <span className="text-white font-bold text-base">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Payment ID</span>
            <span className="font-mono text-xs text-slate-300">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Order ID</span>
            <span className="font-mono text-xs text-slate-300">{orderId}</span>
          </div>
          {invoiceNumber && (
            <div className="flex justify-between items-center text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Invoice Ref</span>
              <span className="font-mono text-xs text-indigo-400">{invoiceNumber}</span>
            </div>
          )}
        </div>

        {/* Redirect notice */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-6 text-xs text-indigo-300 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Redirecting to Dashboard in <strong>{countdown}s</strong>...</span>
        </div>

        <Link
          to="/student/dashboard"
          className="block w-full py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/25"
        >
          Go to Dashboard Now
        </Link>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
