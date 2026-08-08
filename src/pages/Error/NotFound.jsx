import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCompass, FiHome, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export const NotFound = () => {
  const { role, isAuthenticated } = useAuth();

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
        style={{ padding: '3.5rem 2.5rem', maxWidth: '500px', width: '100%', borderRadius: 'var(--radius-xl)' }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.1)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.8rem',
            margin: '0 auto 1.5rem',
          }}
        >
          <FiCompass />
        </div>

        <span className="badge-ai mb-2">404 Page Not Found</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--color-text)' }}>
          Page Lost in Hyperspace
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          The requested page route does not exist or has been relocated. Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiHome /> Back to Home
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className="btn-primary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Go to Dashboard <FiArrowRight />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
