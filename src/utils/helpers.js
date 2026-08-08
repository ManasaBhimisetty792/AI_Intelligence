/**
 * SkillTrack AI — Utility Helpers
 */

/**
 * Combine class names, filtering falsy values
 * @param {...string} classes
 * @returns {string}
 */
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Get the dashboard base path for a given role
 */
export const getDashboardPath = (role) => {
  if (role === 'recruiter') return '/recruiter/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/student/dashboard';
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate a string to a max length
 */
export const truncate = (str = '', maxLength = 80) =>
  str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
