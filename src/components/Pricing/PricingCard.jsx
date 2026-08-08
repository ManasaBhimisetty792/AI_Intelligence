import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import Button from '../Buttons/Button';

const PricingCard = ({ plan, price, period, tagline, features, highlighted = false, index = 0 }) => (
  <motion.div
    className={`glass pricing-card ${highlighted ? 'pricing-card--highlighted' : ''}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay: index * 0.12 }}
    whileHover={{ y: -8 }}
  >
    {highlighted && <span className="pricing-card__badge">Most Popular</span>}
    <h3>{plan}</h3>
    <p className="pricing-card__tagline">{tagline}</p>
    <div className="pricing-card__price">
      <span className="amount">{price}</span>
      <span className="period">/{period}</span>
    </div>
    <Button variant={highlighted ? 'primary' : 'outline'} full>Get Started</Button>
    <ul className="pricing-card__features">
      {features.map((f, i) => (
        <li key={i}><FiCheck size={16} color="var(--success)" /> {f}</li>
      ))}
    </ul>
  </motion.div>
);

export default PricingCard;
