import React from 'react';
import { FiBell, FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const NotificationCard = ({
  title,
  message,
  time,
  type = 'info', // info, success, warning
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
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: unread ? 'rgba(79, 70, 229, 0.04)' : 'rgba(255, 255, 255, 0.4)',
        border: unread ? '1px solid rgba(79, 70, 229, 0.12)' : '1px solid rgba(226, 232, 240, 0.6)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ marginTop: '2px', fontSize: '1.1rem' }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>{title}</h4>
          {time && <span style={{ fontSize: '0.72rem', color: 'var(--color-subtle)' }}>{time}</span>}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>
      {unread && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            position: 'absolute',
            top: '12px',
            right: '10px',
          }}
        />
      )}
    </div>
  );
};

export default NotificationCard;
