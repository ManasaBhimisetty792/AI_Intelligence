import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiCheckCircle, FiLock, FiX, FiCreditCard, FiSmartphone } from 'react-icons/fi';

const MockPaymentModal = ({ isOpen, onClose, onConfirmPay, planDetails, userDetails }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('student@upi');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    setTimeout(() => {
      onConfirmPay({
        paymentId: `pay_test_${Date.now()}`,
        orderId: `order_test_${Date.now()}`,
        signature: 'sig_mock_verified',
      });
      setProcessing(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">SkillTrack Checkout</h3>
                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Razorpay Sandbox Test Mode
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Plan Summary */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Plan Selected</p>
                <p className="font-bold text-slate-100">{planDetails?.planName || 'Student Premium'}</p>
                <p className="text-xs text-indigo-400 font-medium">1 Year Full Access</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-white">₹{planDetails?.amount || 1499}</p>
                <p className="text-xs text-slate-400">Inclusive of taxes</p>
              </div>
            </div>

            {/* Candidate Details */}
            <div className="text-xs text-slate-400 space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <p><span className="text-slate-500">Candidate:</span> {userDetails?.name || 'Student Candidate'}</p>
              <p><span className="text-slate-500">Email:</span> {userDetails?.email || 'student@example.com'}</p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Test Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedMethod === 'upi'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <FiSmartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <FiCreditCard className="w-4 h-4" />
                  <span>Card / Netbanking</span>
                </button>
              </div>
            </div>

            {selectedMethod === 'upi' ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Sandbox Test Card</p>
                <p>Card: 4111 •••• •••• 1111</p>
                <p>Exp: 12/28 | CVV: 123</p>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-5 bg-slate-950/60 border-t border-slate-800 space-y-3">
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Test Payment...</span>
                </>
              ) : (
                <>
                  <FiLock className="w-4 h-4" />
                  <span>Complete Test Payment — ₹{planDetails?.amount || 1499}</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <FiCheckCircle className="text-emerald-400" /> Safe SSL Encrypted Sandbox Environment
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MockPaymentModal;
