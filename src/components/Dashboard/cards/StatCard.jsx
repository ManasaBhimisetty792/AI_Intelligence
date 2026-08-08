import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive', // positive, negative, neutral
  badge,
  iconBg = 'rgba(79, 70, 229, 0.1)',
  iconColor = 'var(--color-primary)',
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-card stat-card"
      style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-muted)' }}>{title}</span>
          {icon && (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: iconBg,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.2rem',
              }}
            >
              {icon}
            </div>
          )}
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          {value}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
        {subtitle && (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{subtitle}</span>
        )}
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background:
                trendType === 'positive'
                  ? 'rgba(34, 197, 94, 0.1)'
                  : trendType === 'negative'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(148, 163, 184, 0.1)',
              color:
                trendType === 'positive'
                  ? 'var(--color-success)'
                  : trendType === 'negative'
                  ? 'var(--color-danger)'
                  : 'var(--color-muted)',
            }}
          >
            {trend}
          </span>
        )}
        {badge && (
          <span className="badge-glass" style={{ fontSize: '0.72rem' }}>
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
