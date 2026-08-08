import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentFailed = () => {
  const location = useLocation();
  const state = location.state || {};
  const reason = state.reason || 'The transaction was declined by the issuing bank or cancelled.';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center z-10"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: [0, -5, 5, -5, 0], scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white mb-2">Payment Failed</h2>
        <p className="text-slate-400 text-sm mb-6">
          We couldn't process your payment. Don't worry, no money was charged.
        </p>

        <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-4 text-left mb-6 text-sm">
          <span className="text-rose-400 font-semibold block mb-1">Reason:</span>
          <span className="text-slate-300 text-xs leading-relaxed">{reason}</span>
        </div>

        <div className="space-y-3">
          <Link
            to="/pricing"
            className="block w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-500/25"
          >
            Try Again
          </Link>
          <Link
            to="/student/dashboard"
            className="block w-full py-3 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
