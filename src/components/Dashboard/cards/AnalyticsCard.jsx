import React from 'react';

export const AnalyticsCard = ({ title, subtitle, action, children }) => {
  return (
    <div className="glass-card analytics-card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          {title && <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export default AnalyticsCard;
