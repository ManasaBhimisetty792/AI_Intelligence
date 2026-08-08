import React from 'react';

/**
 * LoadingSpinner Component
 */
export const LoadingSpinner = ({ size = 'md', color = 'var(--color-primary)', text = '' }) => {
  const spinnerSize = size === 'sm' ? '20px' : size === 'lg' ? '56px' : '40px';
  const borderWidth = size === 'sm' ? '2px' : '3px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <div
        className="spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: borderWidth,
          borderTopColor: color,
        }}
        aria-label="Loading..."
      />
      {text && <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
