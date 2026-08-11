import React from 'react';

export const ActivityCard = ({ title, timestamp, description, status, icon }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'flex-start',
        padding: '0.8rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Title + timestamp row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <h5
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text)',
              lineHeight: 1.35,
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </h5>
          {timestamp && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-subtle)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                paddingTop: '1px',
              }}
            >
              {timestamp}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-muted)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}

        {/* Status badge below description */}
        {status && (
          <span
            className="badge-glass"
            style={{
              fontSize: '0.68rem',
              padding: '0.2rem 0.5rem',
              alignSelf: 'flex-start',
              marginTop: '0.15rem',
            }}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
