import React from 'react';

export const ActivityCard = ({ title, timestamp, description, status, icon }) => {
  return (
    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
      {icon && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.08)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '0.95rem',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h5 style={{ fontSize: '0.84rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>{title}</h5>
          {timestamp && <span style={{ fontSize: '0.72rem', color: 'var(--color-subtle)' }}>{timestamp}</span>}
        </div>
        {description && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0.15rem 0 0', lineHeight: 1.4 }}>
            {description}
          </p>
        )}
      </div>
      {status && (
        <span className="badge-glass" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
          {status}
        </span>
      )}
    </div>
  );
};

export default ActivityCard;
