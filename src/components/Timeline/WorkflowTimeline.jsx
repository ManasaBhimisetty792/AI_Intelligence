import React from 'react';
import { motion } from 'framer-motion';

/**
 * Vertical connected timeline used on Home + How It Works.
 * `steps` = [{ icon, title, description }]
 */
const WorkflowTimeline = ({ steps }) => (
  <div className="timeline">
    <div className="timeline__line" />
    {steps.map((step, i) => {
      const Icon = step.icon;
      return (
        <motion.div
          className="timeline__item"
          key={i}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
        >
          <div className="timeline__marker">
            <span className="timeline__index">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <div className="glass timeline__content">
            {Icon && <Icon size={20} color="var(--primary)" />}
            <h4>{step.title}</h4>
            <p>{step.description}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default WorkflowTimeline;
