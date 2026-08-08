import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';

export const EmailVerificationSuccess = () => {
  return (
    <AuthLayout
      title="Email Verified!"
      subtitle="Your email address has been successfully verified."
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        style={{ padding: '1rem 0' }}
      >
        <FiCheckCircle style={{ fontSize: '4rem', color: 'var(--color-success)', marginBottom: '1.25rem' }} />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Welcome to SkillTrack AI
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your account is fully activated. You can now access AI mock drills, ATS resume scoring, and recruiter matching features.
        </p>
        <Link to="/login" className="btn-primary w-full" style={{ padding: '0.9rem' }}>
          Proceed to Sign In <FiArrowRight />
        </Link>
      </motion.div>
    </AuthLayout>
  );
};

export default EmailVerificationSuccess;
