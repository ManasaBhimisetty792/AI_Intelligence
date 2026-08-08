import React from 'react';
import { motion } from 'framer-motion';

export const ChartCard = ({
  title,
  subtitle,
  type = 'line', // line, bar, donut, pipeline
  data = [],
}) => {
  return (
    <div className="glass-card chart-card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>{subtitle}</p>}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
        {type === 'line' && (
          <div style={{ width: '100%' }}>
            <svg viewBox="0 0 400 120" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,90 Q 60,30 120,60 T 240,20 T 360,40 T 400,10 L 400,120 L 0,120 Z"
                fill="url(#chartGrad)"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                d="M 0,90 Q 60,30 120,60 T 240,20 T 360,40 T 400,10"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
              />
              {[
                { x: 0, y: 90, label: 'Mon' },
                { x: 120, y: 60, label: 'Wed' },
                { x: 240, y: 20, label: 'Fri' },
                { x: 360, y: 40, label: 'Sun' },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="var(--color-primary)" strokeWidth="2" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-subtle)', marginTop: '0.5rem' }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        )}

        {type === 'bar' && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: '140px', padding: '0 0.5rem' }}>
            {(data.length ? data : [
              { label: 'Jan', value: 40 },
              { label: 'Feb', value: 65 },
              { label: 'Mar', value: 85 },
              { label: 'Apr', value: 55 },
              { label: 'May', value: 95 },
              { label: 'Jun', value: 75 },
            ]).map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  style={{
                    width: '70%',
                    maxWidth: '32px',
                    borderRadius: '4px 4px 0 0',
                    background: idx % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                    opacity: 0.85,
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.4rem' }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {type === 'pipeline' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data.length ? data : [
              { stage: 'Applied', count: 120, pct: 100, color: 'var(--color-primary)' },
              { stage: 'ATS Screened', count: 64, pct: 53, color: 'var(--color-accent)' },
              { stage: 'AI Interview', count: 28, pct: 23, color: 'var(--color-secondary)' },
              { stage: 'Hired', count: 12, pct: 10, color: 'var(--color-success)' },
            ]).map((pipe, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span>{pipe.stage}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{pipe.count} ({pipe.pct}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(226, 232, 240, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pipe.pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    style={{ height: '100%', background: pipe.color, borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
