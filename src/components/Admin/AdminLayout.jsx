import React from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { FiRefreshCw, FiShield } from 'react-icons/fi';

export const AdminLayout = ({
  children,
  title = 'Admin Console',
  subtitle = 'Real-time production administrative dashboard powered by Supabase.',
  onRefresh,
  refreshing = false,
  rightSidebar = null,
  actions = null,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <DashboardLayout title={title} rightSidebar={rightSidebar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Page Top Bar */}
        <div
          style={{
            background: 'var(--gradient-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  letterSpacing: '0.04em',
                }}
              >
                <FiShield /> ADMIN CONSOLE
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600 }}>{currentDate}</span>
            </div>

            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.85rem',
                  color: 'var(--color-muted)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Main Page Children */}
        {children}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminLayout;
