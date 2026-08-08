import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', size = 'medium' }) => {
  const { isDark, toggleTheme } = useTheme();
  const isSmall = size === 'small';

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer border ${
        isDark
          ? 'bg-slate-900/90 border-amber-500/30 text-amber-300 hover:border-amber-400/60 shadow-lg shadow-amber-500/15'
          : 'bg-white/90 border-indigo-200/80 text-indigo-600 hover:border-indigo-400/60 shadow-md shadow-indigo-500/15'
      } ${isSmall ? 'w-9 h-9 p-0 text-base' : 'w-10 h-10 p-0 text-lg'} ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -180, scale: 0.2, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 180, scale: 0.2, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center justify-center relative"
      >
        {isDark ? (
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm animate-pulse" />
            <FiMoon className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 blur-sm animate-pulse" />
            <FiSun className="w-5 h-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
          </div>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
