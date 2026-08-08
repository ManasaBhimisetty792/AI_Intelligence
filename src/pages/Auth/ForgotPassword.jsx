import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Toast notification in AuthContext handles error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
          style={{ padding: '1rem 0' }}
        >
          <FiCheckCircle style={{ fontSize: '3.5rem', color: 'var(--color-success)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Check Your Email
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set your new password.
          </p>
          <Link to="/login" className="btn-primary w-full">
            <FiArrowLeft /> Back to Sign In
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.student@skilltrack.ai"
                className="input-glass auth-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="btn-primary auth-submit-btn"
            style={{ marginTop: '1rem' }}
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'} <FiArrowRight />
          </button>

          <div className="auth-footer-text">
            <Link to="/login" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
