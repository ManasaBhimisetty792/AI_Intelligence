import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertOctagon, FiRefreshCw, FiHome } from 'react-icons/fi';

export const ServerError = () => {
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
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.8rem',
            margin: '0 auto 1.5rem',
          }}
        >
          <FiAlertOctagon />
        </div>

        <span className="badge-glass mb-2" style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          500 Server Error
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--color-text)' }}>
          Internal Server Error
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          Our security & server infrastructure encountered an unexpected glitch. Please refresh or return home.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiRefreshCw /> Refresh Page
          </button>
          <Link
            to="/"
            className="btn-primary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiHome /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
