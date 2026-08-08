import React from 'react';

/**
 * Input Component — Glassmorphism Styled Input
 */
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && (
        <label className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <Icon
            style={{
              position: 'absolute',
              left: '1rem',
              color: 'var(--color-subtle)',
              fontSize: '1.1rem',
              pointerEvents: 'none',
            }}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-glass ${className}`}
          style={{ paddingLeft: Icon ? '2.75rem' : '1rem' }}
          required={required}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  );
};

export default Input;
