import React from 'react';
import { parseStructuredSection, highlightDates } from './resumeDisplayUtils';
import { FiCalendar } from 'react-icons/fi';

export default function StructuredSection({
  content,
  emptyMessage,
  accentColor = 'var(--color-primary, #059669)',
  accentBg = 'var(--color-primary-light, rgba(5, 150, 105, 0.1))',
  stripLinks = true,
}) {
  const { empty, rows } = parseStructuredSection(content, stripLinks);

  if (empty) {
    return (
      <div style={{ color: 'var(--color-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
        {emptyMessage}
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
      {rows.map((row, i) => {
        if (row.type === 'bullet') {
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                margin: '5px 0',
                fontSize: '0.85rem',
                color: 'var(--color-text)',
                lineHeight: 1.55,
              }}
            >
              <span style={{ color: accentColor, flexShrink: 0, fontWeight: 700 }}>•</span>
              <span>{row.text}</span>
            </div>
          );
        }

        if (row.type === 'heading') {
          const parts = highlightDates(row.text);
          return (
            <div
              key={i}
              style={{
                fontSize: '0.925rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: i === 0 ? '0 0 4px' : '12px 0 4px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              {parts.map((p, j) =>
                p.type === 'date' ? (
                  <span
                    key={j}
                    style={{
                      background: accentBg,
                      color: accentColor,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full, 999px)',
                      marginLeft: '6px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <FiCalendar style={{ fontSize: '0.75rem' }} /> {p.value}
                  </span>
                ) : (
                  <span key={j}>{p.value}</span>
                ),
              )}
            </div>
          );
        }

        const bodyParts = highlightDates(row.text);
        const hasBodyDate = bodyParts.some((p) => p.type === 'date');

        if (hasBodyDate) {
          return (
            <div
              key={i}
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-muted)',
                lineHeight: 1.55,
                margin: '4px 0',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              {bodyParts.map((p, j) =>
                p.type === 'date' ? (
                  <span
                    key={j}
                    style={{
                      background: accentBg,
                      color: accentColor,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full, 999px)',
                      marginLeft: '6px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <FiCalendar style={{ fontSize: '0.75rem' }} /> {p.value}
                  </span>
                ) : (
                  <span key={j}>{p.value}</span>
                ),
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-muted)',
              lineHeight: 1.55,
              margin: '4px 0',
            }}
          >
            {row.text}
          </div>
        );
      })}
    </div>
  );
}
