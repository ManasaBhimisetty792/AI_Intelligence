import React from 'react';
import { FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const NotificationCard = ({
  title,
  message,
  time,
  type = 'info',
  unread = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle style={{ color: 'var(--color-success)' }} />;
      case 'warning':
        return <FiAlertTriangle style={{ color: 'var(--color-warning)' }} />;
      default:
        return <FiInfo style={{ color: 'var(--color-primary)' }} />;
    }
  };

  return (
    <div
      style={{
        padding: '0.75rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        background: unread ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
        border: unread
          ? '1px solid rgba(79, 70, 229, 0.12)'
          : '1px solid var(--color-border)',
        display: 'flex',
        gap: '0.65rem',
        alignItems: 'flex-start',
        position: 'relative',
        transition: 'background 0.2s ease',
        minWidth: 0,
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px', fontSize: '1rem', lineHeight: 1 }}>
        {getIcon()}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Title row with time */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h4
            style={{
              fontSize: '0.83rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text)',
              lineHeight: 1.3,
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            {title}
          </h4>
          {time && (
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--color-subtle)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                paddingTop: '1px',
              }}
            >
              {time}
            </span>
          )}
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-muted)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>
      </div>

      {/* Unread dot */}
      {unread && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            flexShrink: 0,
            marginTop: '5px',
          }}
        />
      )}
    </div>
  );
};

export default NotificationCard;
