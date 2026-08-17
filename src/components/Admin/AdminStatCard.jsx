import React from 'react';

export const AdminStatCard = ({
  icon,
  label,
  value,
  sub,
  accent = 'var(--color-primary)',
  loading = false,
}) => {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${accent}33`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${accent}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-lg)',
            background: `${accent}18`,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: accent,
            fontSize: '1.2rem',
          }}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <div
          style={{
            height: 32,
            background: 'var(--glass-border-subtle)',
            borderRadius: 'var(--radius-md)',
            animation: 'adminPulse 1.5s infinite',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {value ?? '—'}
        </div>
      )}
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 600 }}>
          {sub}
        </div>
      )}

      <style>{`
        @keyframes adminPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};

export default AdminStatCard;
