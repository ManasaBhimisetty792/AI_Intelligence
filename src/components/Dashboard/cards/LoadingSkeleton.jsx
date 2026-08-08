import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="glass-card animate-pulse"
            style={{ padding: '1.5rem', height: '120px', borderRadius: 'var(--radius-lg)', background: 'rgba(241, 245, 249, 0.6)' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card animate-pulse" style={{ padding: '1.5rem' }}>
        <div style={{ height: '24px', width: '30%', background: 'rgba(226, 232, 240, 0.8)', borderRadius: '4px', marginBottom: '1rem' }} />
        {items.map((_, i) => (
          <div key={i} style={{ height: '40px', width: '100%', background: 'rgba(241, 245, 249, 0.6)', borderRadius: '4px', marginBottom: '0.5rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse" style={{ height: '100px', width: '100%', background: 'rgba(241, 245, 249, 0.6)', borderRadius: 'var(--radius-md)' }} />
  );
};

export default LoadingSkeleton;
