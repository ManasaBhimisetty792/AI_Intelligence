import React from 'react';
import { motion } from 'framer-motion';
import '../dashboard.css';

export const QuickActionCard = ({ actions = [] }) => {
  return (
    <div className="glass-card quick-action-card">
      <h4 className="quick-action-title">Quick Actions</h4>

      <div className="quick-action-grid">
        {actions.map((act, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={act.onClick}
            type="button"
            className={act.primary ? 'btn-primary quick-action-btn' : 'btn-secondary quick-action-btn'}
          >
            <span className="quick-action-icon">{act.icon}</span>
            <span>{act.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionCard;