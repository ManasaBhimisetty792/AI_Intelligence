import React from 'react';
import { HiSparkles } from 'react-icons/hi';

export const PremiumBadge = ({ text = '👑 Premium User', size = 'medium' }) => {
  const isSmall = size === 'small';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.2rem 0.65rem' : '0.35rem 0.85rem',
        fontSize: isSmall ? '0.72rem' : '0.82rem',
        fontWeight: 700,
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 70, 239, 0.25) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        color: '#f59e0b',
        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)',
        backdropFilter: 'blur(6px)',
        letterSpacing: '0.02em',
      }}
    >
      <HiSparkles style={{ color: '#f59e0b', fontSize: isSmall ? '0.85rem' : '1rem' }} />
      {text}
    </span>
  );
};

export default PremiumBadge;
