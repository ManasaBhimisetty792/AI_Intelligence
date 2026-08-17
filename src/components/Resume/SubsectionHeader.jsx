import React from 'react';

export default function SubsectionHeader({ icon: Icon, label, color = 'var(--color-primary)' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color,
        margin: '22px 0 12px',
        paddingBottom: '8px',
        borderBottom: `2px solid var(--color-border)`,
      }}
    >
      {Icon && (
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.05rem', color }}>
          {typeof Icon === 'function' || typeof Icon === 'object' ? <Icon /> : Icon}
        </span>
      )}
      <span>{label}</span>
    </div>
  );
}
