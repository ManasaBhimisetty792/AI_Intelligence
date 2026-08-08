import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiPlayCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import heroMockup from '../../assets/images/hero-mockup.png';
import './Hero.css';

export const Hero = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-glow-blob blob-primary animate-pulse-glow" />
      <div
        className="hero-glow-blob blob-secondary animate-pulse-glow"
        style={{ animationDelay: '2s' }}
      />

      <div className="container hero-container">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="badge-ai hero-badge"
          >
            <HiSparkles /> Next-Gen AI Career & Hiring Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
          >
             
            Walk into your real interview <span className="text-gradient-primary">already knowing your score.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle"
          >
            InterviewReady matches your resume against any job description,
             then pairs you with a verified interviewer
             for a live mock interview — scored on communication,
              technical signal, and on-camera presence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-cta-group"
          >
            <Link to="/signup" className="btn-primary hero-btn-main">
              Get Started <FiArrowRight />
            </Link>

            <Link to="/how-it-works" className="btn-secondary hero-btn-demo">
              <FiPlayCircle /> Book Demo
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-visual-wrapper"
        >
          <div className="hero-image-card">
            <img
              src={heroMockup}
              alt="AI Interview and Personalized Care Platform Preview"
              className="hero-mockup-img"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;