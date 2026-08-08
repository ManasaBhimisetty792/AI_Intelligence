import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Button from '../Buttons/Button';

const CTASection = ({
  title = 'Start Your AI Career Journey Today',
  subtitle = 'Join thousands of candidates using SkillTrack AI to land interviews faster.',
  primaryLabel = 'Register',
  primaryTo = '/contact',
  secondaryLabel = 'View Pricing',
  secondaryTo = '/pricing'
}) => (
  <section className="section cta-section">
    <div className="container">
      <motion.div
        className="cta-banner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="blob cta-banner__blob" />
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="cta-banner__actions">
          <Link to={primaryTo}><Button variant="primary" icon={FiArrowRight}>{primaryLabel}</Button></Link>
          <Link to={secondaryTo}><Button variant="outline">{secondaryLabel}</Button></Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
