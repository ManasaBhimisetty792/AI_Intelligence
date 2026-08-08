import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, index = 0 }) => (
  <motion.div
    className="glass feature-card"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    whileHover={{ y: -6 }}
  >
    <div className="feature-card__icon">
      <Icon size={22} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

export default FeatureCard;
