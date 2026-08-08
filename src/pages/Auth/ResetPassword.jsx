import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pwd) => {
    if (!pwd) return { label: '', percent: 0, color: '' };
    if (pwd.length < 6) return { label: 'Weak', percent: 33, color: 'var(--color-danger)' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { label: 'Strong', percent: 100, color: 'var(--color-success)' };
    }
    return { label: 'Medium', percent: 66, color: 'var(--color-warning)' };
  };

  const strength = calculateStrength(password);
  const isMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatch || password.length < 6) return;
    setIsSubmitting(true);
    try {
      await resetPassword(password);
      setUpdated(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      // Toast handles error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below to regain access to your account."
    >
      {updated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
          style={{ padding: '1rem 0' }}
        >
          <FiCheckCircle style={{ fontSize: '3.5rem', color: 'var(--color-success)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Password Reset Successful!
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            Your password has been updated. Redirecting to login page...
          </p>
          <Link to="/login" className="btn-primary w-full">
            Go to Login Now <FiArrowRight />
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-glass auth-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                  <span>Password Strength:</span>
                  <span>{strength.label}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(203,213,225,0.4)', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'all 0.3s' }} />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-glass auth-input"
                required
              />
            </div>
            {confirmPassword && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isMatch ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '2px' }}>
                {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isMatch || password.length < 6}
            className="btn-primary auth-submit-btn"
            style={{ marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'} <FiArrowRight />
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
