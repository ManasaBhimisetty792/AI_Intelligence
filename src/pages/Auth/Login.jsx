import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiHome, FiUser, FiBriefcase, FiShield,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import './Login.css';

const ROLE_TABS = [
  { role: 'student', label: 'Candidate', icon: <FiUser /> },
  { role: 'recruiter', label: 'Recruiter', icon: <FiBriefcase /> },
];

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'student', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;
  const getDashboardPath = (role) =>
    role === 'recruiter' ? '/recruiter/dashboard' : role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      let targetRole = form.role;
      if (form.email === 'admin@skilltrack.ai') {
        targetRole = 'admin';
      }
      const user = await login({ email: form.email, password: form.password, role: targetRole });
      if (user?.role === 'admin' || form.email === 'admin@skilltrack.ai') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const target = from || getDashboardPath(user?.role || form.role);
        navigate(target, { replace: true });
      }
    } catch (err) {
      setErrors({ auth: err.message || 'Invalid email or password. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const user = await googleLogin();
      if (user) {
        const target = from || getDashboardPath(user?.role || 'student');
        navigate(target, { replace: true });
      }
    } catch (_) {}
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your AI career intelligence portal."
    >
      {/* Role Tabs */}
      <div className="auth-role-tabs" role="group" aria-label="Select login role">
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

      {/* Google OAuth */}
      <div className="social-auth-group">
        <button
          type="button"
          onClick={handleGoogle}
          className="btn-secondary social-auth-btn"
          aria-label="Sign in with Google"
        >
          <FcGoogle style={{ fontSize: '1.2rem' }} /> Continue with Google
        </button>
      </div>

      <div className="auth-divider"><span>or sign in with email</span></div>

      {errors.auth && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-alert auth-alert--error"
          role="alert"
        >
          {errors.auth}
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@skilltrack.ai"
              className={`input-glass auth-input${errors.email ? ' input-error' : ''}`}
              required
              autoComplete="email"
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
          </div>
          {errors.email && <span id="login-email-error" className="field-error" role="alert">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <div className="input-with-icon">
            <FiLock className="input-icon" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className={`input-glass auth-input${errors.password ? ' input-error' : ''}`}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="field-error" role="alert">{errors.password}</span>}
        </div>

        {/* Remember Me */}
        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              aria-label="Remember me for 30 days"
            />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary auth-submit-btn"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <><div className="spinner spinner-sm" aria-hidden="true" /> Signing In...</>
          ) : (
            <>Sign In <FiArrowRight /></>
          )}
        </button>
      </form>

      <div className="auth-footer-text">
        Don't have an account?{' '}
        <Link to="/signup" className="auth-switch-link">Create free account</Link>
      </div>

      <div className="text-center mt-3">
        <Link to="/" className="btn-glass" style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
          <FiHome /> Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
