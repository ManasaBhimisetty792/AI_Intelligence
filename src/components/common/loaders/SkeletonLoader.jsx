import React from 'react';

/**
 * SkeletonLoader Component
 */
export const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', className = '', style = {} }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
};

export default SkeletonLoader;
