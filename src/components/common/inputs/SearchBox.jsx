import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * SearchBox Component
 */
export const SearchBox = ({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  className = '',
  style = {},
}) => {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', ...style }}>
      <FiSearch
        style={{
          position: 'absolute',
          left: '1rem',
          color: 'var(--color-subtle)',
          fontSize: '1.1rem',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-glass ${className}`}
        style={{ paddingLeft: '2.75rem', paddingRight: value ? '2.5rem' : '1rem' }}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          type="button"
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-subtle)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
