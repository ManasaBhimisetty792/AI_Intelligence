import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const TestimonialCard = ({ name, role, quote, rating = 5, initials, index = 0 }) => (
  <motion.div
    className="glass testimonial-card"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="testimonial-card__stars">
      {Array.from({ length: rating }).map((_, i) => <FiStar key={i} size={15} fill="var(--warning)" color="var(--warning)" />)}
    </div>
    <p className="testimonial-card__quote">&ldquo;{quote}&rdquo;</p>
    <div className="testimonial-card__person">
      <div className="testimonial-card__avatar">{initials}</div>
      <div>
        <h4>{name}</h4>
        <span>{role}</span>
      </div>
    </div>
  </motion.div>
);

export default TestimonialCard;
