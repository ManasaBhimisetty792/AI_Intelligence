import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiBriefcase, FiLinkedin, FiGlobe, FiShield,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import './Login.css';
import './SignUp.css';

/* ---------- helpers ---------- */
function getStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

const ROLE_TABS = [
  { role: 'student', label: 'Candidate', icon: <FiUser /> },
  { role: 'recruiter', label: 'Recruiter', icon: <FiBriefcase /> },
];

export const SignUp = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: 'student', company: '', linkedinUrl: '', agree: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    
    if (form.role === 'recruiter') {
      if (!form.company.trim()) errs.company = 'Company name is required for recruiter accounts.';
      if (!form.linkedinUrl.trim()) {
        errs.linkedinUrl = 'LinkedIn profile URL is required for admin verification.';
      } else if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i.test(form.linkedinUrl.trim())) {
        errs.linkedinUrl = 'Enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username).';
      }
    }

    if (!form.agree) errs.agree = 'You must accept the Terms and Privacy Policy.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '', auth: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        company: form.company,
        linkedinUrl: form.linkedinUrl,
      });
      if (form.role === 'recruiter') {
        setSuccess('Recruiter account created! Your request & LinkedIn URL have been submitted to Admin for verification and approval.');
      } else {
        setSuccess('Account created! Please check your email to verify your account.');
      }
    } catch (err) {
      setErrors({ auth: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const user = await googleLogin();
      if (user) navigate(getDashboardPath(user?.role || form.role), { replace: true });
    } catch (_) {}
  };

  const getDashboardPath = (role) =>
    role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard';

  if (success) {
    return (
      <AuthLayout title={form.role === 'recruiter' ? "Verification Pending" : "Check Your Email"} subtitle={success}>
        <div className="text-center" style={{ padding: '1.5rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{form.role === 'recruiter' ? '🛡️' : '📧'}</div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {form.role === 'recruiter' ? (
              <>Your LinkedIn profile (<strong style={{ color: 'var(--color-primary)' }}>{form.linkedinUrl}</strong>) has been linked for admin review. You will receive access once approved.</>
            ) : (
              <>We've sent a verification link to <strong style={{ color: 'var(--color-primary)' }}>{form.email}</strong>.</>
            )}
          </p>
          <Link to="/login" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}>
            Go to Sign In <FiArrowRight />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join the AI-powered career ecosystem. It's free.">
      {/* Role Tabs */}
      <div className="auth-role-tabs" role="group" aria-label="Select account type">
        {ROLE_TABS.map(({ role, label, icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => setForm((p) => ({ ...p, role }))}
            className={`role-tab${form.role === role ? ' active' : ''}`}
            aria-pressed={form.role === role}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Recruiter Verification Info Banner */}
      {form.role === 'recruiter' && (
        <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiShield style={{ color: 'var(--color-primary)', fontSize: '1.4rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-body)' }}>
            Recruiter accounts require admin approval. Please provide your official LinkedIn URL for identity verification.
          </span>
        </div>
      )}

      {/* Google OAuth */}
      <div className="social-auth-group">
        <button type="button" onClick={handleGoogle} className="btn-secondary social-auth-btn" aria-label="Sign up with Google">
          <FcGoogle style={{ fontSize: '1.2rem' }} /> Continue with Google
        </button>
      </div>

      <div className="auth-divider"><span>or create with email</span></div>

      {errors.auth && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="auth-alert auth-alert--error" role="alert">
          {errors.auth}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full Name</label>
          <div className="input-with-icon">
            <FiUser className="input-icon" aria-hidden="true" />
            <input
              id="signup-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              className={`input-glass auth-input${errors.name ? ' input-error' : ''}`}
              autoComplete="name"
            />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">Email Address</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" aria-hidden="true" />
            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@skilltrack.ai"
              className={`input-glass auth-input${errors.email ? ' input-error' : ''}`}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        {/* Recruiter Extra Fields */}
        {form.role === 'recruiter' && (
          <>
            {/* Company Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-company">Company Name</label>
              <div className="input-with-icon">
                <FiBriefcase className="input-icon" aria-hidden="true" />
                <input
                  id="signup-company"
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Nexus Tech Global"
                  className={`input-glass auth-input${errors.company ? ' input-error' : ''}`}
                />
              </div>
              {errors.company && <span className="field-error">{errors.company}</span>}
            </div>

            {/* LinkedIn Profile URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-linkedin">LinkedIn Profile URL (Required for Verification)</label>
              <div className="input-with-icon">
                <FiLinkedin className="input-icon" aria-hidden="true" />
                <input
                  id="signup-linkedin"
                  type="url"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourname"
                  className={`input-glass auth-input${errors.linkedinUrl ? ' input-error' : ''}`}
                />
              </div>
              {errors.linkedinUrl && <span className="field-error">{errors.linkedinUrl}</span>}
            </div>
          </>
        )}

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">Password</label>
          <div className="input-with-icon">
            <FiLock className="input-icon" aria-hidden="true" />
            <input
              id="signup-password"
              type={showPwd ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              className={`input-glass auth-input${errors.password ? ' input-error' : ''}`}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="password-toggle" aria-label={showPwd ? 'Hide password' : 'Show password'}>
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {form.password && (
            <div className="strength-indicator">
              <div className="password-strength-bar">
                <div
                  className="password-strength-fill"
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    background: STRENGTH_COLORS[strength],
                  }}
                />
              </div>
              <span className="strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
                {STRENGTH_LABELS[strength]}
              </span>
            </div>
          )}
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
          <div className="input-with-icon">
            <FiLock className="input-icon" aria-hidden="true" />
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat your password"
              className={`input-glass auth-input${errors.confirm ? ' input-error' : ''}`}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="password-toggle" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>

        {/* Terms */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
              I agree to the{' '}
              <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</Link>
            </span>
          </label>
          {errors.agree && <span className="field-error">{errors.agree}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary auth-submit-btn"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <><div className="spinner spinner-sm" aria-hidden="true" /> Creating Account...</>
          ) : (
            <>Create Account <FiArrowRight /></>
          )}
        </button>
      </form>
      <div className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-switch-link">Sign in</Link>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
