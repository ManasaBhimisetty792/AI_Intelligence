import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button Component — Design System Button
 * Variants: 'primary' | 'secondary' | 'outline' | 'glass'
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'outline'
      ? 'btn-outline'
      : variant === 'glass'
      ? 'btn-glass'
      : 'btn-primary';

  const sizeClass = size === 'sm' ? 'nav-btn-sm' : size === 'lg' ? 'cta-btn-lg' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${variantClass} ${sizeClass} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
