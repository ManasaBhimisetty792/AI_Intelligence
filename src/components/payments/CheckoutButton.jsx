import React from 'react';
import { motion } from 'framer-motion';
import usePayment from '../../hooks/usePayment';
import LoadingPayment from './LoadingPayment';

const CheckoutButton = ({
  planKey = 'student_premium',
  buttonText = 'Upgrade to Premium',
  className = '',
  variant = 'primary'
}) => {
  const {
    initiatePayment,
    isLoading,
    status,
  } = usePayment();

  const baseStyles = "relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-indigo-500/25 cursor-pointer";

  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white border border-indigo-400/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-none",
    glow: "bg-indigo-600 hover:bg-indigo-500 text-white ring-4 ring-indigo-500/20"
  };

  return (
    <>
      {isLoading && <LoadingPayment message={status === 'verifying' ? 'Verifying payment with gateway...' : 'Opening Razorpay Checkout...'} />}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => initiatePayment(planKey)}
        disabled={isLoading}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      >
        <span>{isLoading ? 'Processing...' : buttonText}</span>
        {!isLoading && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </motion.button>
    </>
  );
};

export default CheckoutButton;

