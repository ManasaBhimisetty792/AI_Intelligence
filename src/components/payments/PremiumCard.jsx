import React from 'react';
import { motion } from 'framer-motion';
import CheckoutButton from './CheckoutButton';
import { PLANS } from '../../hooks/usePayment';

const PremiumCard = ({ planKey = 'student_premium' }) => {
  const plan = PLANS[planKey] || PLANS.student_premium;

  const features = [
    'Unlimited AI Mock Interviews',
    'Real-time Audio & Video Voice AI Analysis',
    'Automated Resume ATS Scoring & Recommendations',
    'Verified Skill Certificates & Badge Generation',
    'Recruiter Discovery Profile Visibility',
    'Detailed Feedback Breakdown & Scoring'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-8 bg-slate-900/80 border border-indigo-500/30 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
        RECOMMENDED FOR STUDENTS
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{plan.planName}</h3>
      <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-4xl font-extrabold text-white">₹{plan.amount}</span>
        <span className="text-slate-400 text-sm">/ {plan.durationLabel}</span>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
            <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <CheckoutButton planKey={planKey} buttonText="Upgrade to Student Premium" className="w-full" />
    </motion.div>
  );
};

export default PremiumCard;
