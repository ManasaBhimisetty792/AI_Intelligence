import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShieldOff, FiHome, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export const Forbidden = () => {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card text-center"
        style={{ padding: '3rem 2.5rem', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)' }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem',
          }}
        >
          <FiShieldOff />
        </div>

        <span className="badge-glass mb-2" style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          403 Forbidden Access
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--color-text)' }}>
          Access Restricted
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          You do not have administrative or role-based permission to view this page. Please navigate back to your assigned portal.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiArrowLeft /> Go Back
          </button>
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="btn-primary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiHome /> My Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Forbidden;
