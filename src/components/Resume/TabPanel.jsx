import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function TabPanel({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '1.25rem',
        }}
      >
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = active === i;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(i)}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all var(--transition-fast, 150ms ease)',
                borderRadius: 0,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {Icon && <Icon style={{ fontSize: '1rem' }} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}

export function Expander({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl, 12px)',
        overflow: 'hidden',
        marginBottom: '10px',
        background: 'var(--color-surface)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'var(--color-surface-sec)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          fontFamily: 'inherit',
          transition: 'background var(--transition-fast, 150ms ease)',
        }}
      >
        <span>{title}</span>
        {open ? <FiChevronUp style={{ color: 'var(--color-primary)' }} /> : <FiChevronDown />}
      </button>
      {open && (
        <div style={{ padding: '14px 18px', background: 'var(--color-surface)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
