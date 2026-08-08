import React from 'react';
import { FiInbox } from 'react-icons/fi';

export const EmptyState = ({
  icon = <FiInbox />,
  title = 'No Data Available',
  description = 'There are no records to show at this time.',
  action = null,
}) => {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px stroke rgba(226, 232, 240, 0.6)',
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
          background: 'rgba(79, 70, 229, 0.08)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          fontSize: '1.75rem',
          marginBottom: '1rem',
        }}
      >
        {icon}
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>{title}</h4>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-muted)', maxWidth: '320px', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
