import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard Component — Premium Glassmorphism Container Card
 */
export const GlassCard = ({
  children,
  className = '',
  hoverEffect = true,
  dark = false,
  padding = '1.5rem',
  style = {},
  ...props
}) => {
  const cardClass = dark ? 'glass-card-dark' : 'glass-card';

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`${cardClass} ${className}`}
      style={{ padding, ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
