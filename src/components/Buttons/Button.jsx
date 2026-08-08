import React from 'react';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-ai)] text-white shadow-[var(--shadow-primary)] hover:shadow-[0_16px_32px_-6px_rgba(37,99,235,0.4)] hover:-translate-y-0.5',
  outline:
    'bg-white/70 backdrop-blur border border-gray-300 text-gray-800 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100',
  light:
    'bg-white text-[var(--color-primary)] shadow-md hover:-translate-y-0.5',
};

const SIZES = {
  sm: 'text-sm px-4 py-2',
  md: 'text-[0.95rem] px-6 py-3',
  lg: 'text-base px-7 py-3.5',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold
      transition-all duration-300 ease-out cursor-pointer select-none
      ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {Icon && iconPosition === 'left' && <Icon size={18} />}
    {children}
    {Icon && iconPosition === 'right' && <Icon size={18} />}
  </button>
);

export default Button;
