import React from 'react';
import { motion } from 'framer-motion';

const LoadingPayment = ({ message = 'Processing payment details...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md text-white p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mb-6"
      />
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-slate-100 text-center"
      >
        {message}
      </motion.h3>
      <p className="text-slate-400 text-sm mt-2 text-center max-w-sm">
        Please do not refresh the page or close this window while we verify your transaction.
      </p>
    </div>
  );
};

export default LoadingPayment;
