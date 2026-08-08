import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export const ErrorState = ({
  title = 'Something Went Wrong',
  message = 'Failed to load dashboard data. Please try again.',
  onRetry,
}) => {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.04)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          fontSize: '1.75rem',
          marginBottom: '1rem',
        }}
      >
        <FiAlertCircle />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>{title}</h4>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-muted)', maxWidth: '340px', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
          <FiRefreshCw /> Retry Loading
        </button>
      )}
    </div>
  );
};

export default ErrorState;
