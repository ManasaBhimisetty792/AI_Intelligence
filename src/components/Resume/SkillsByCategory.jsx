import React from 'react';
import { displaySkillName, CATEGORY_PALETTE } from './resumeDisplayUtils';

export default function SkillsByCategory({ skillsByCategory, accentColor = 'var(--color-primary, #059669)' }) {
  const entries = Object.entries(skillsByCategory || {}).filter(([, skills]) => skills?.length);

  if (!entries.length) {
    return (
      <div style={{ color: 'var(--color-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
        No recognizable skills found in this resume.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 'var(--radius-xl, 12px)',
        padding: '16px 18px 14px',
        marginBottom: '12px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {entries.map(([category, skills], i) => {
        const { color, bg } = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
        return (
          <div key={category} style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-muted)',
                marginBottom: '6px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ color: 'var(--color-text)', minWidth: '110px' }}>{category}:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: 'inline-block',
                      background: bg,
                      color,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full, 999px)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {displaySkillName(s)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
