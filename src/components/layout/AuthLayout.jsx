import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi';
import { FiCheckCircle, FiShield, FiTrendingUp, FiAward } from 'react-icons/fi';
import './AuthLayout.css';

/**
 * AuthLayout — Split layout (Left Side Image/Visual Banner + Right Side Auth Page)
 */
export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        
        {/* Left Side: Visual Feature / Branding Section */}
        <div className="auth-visual-side">
          {/* Subtle background mesh gradients */}
          <div className="auth-visual-glow glow-1" />
          <div className="auth-visual-glow glow-2" />

          {/* Top Logo */}
          <div className="auth-visual-header">
            <Link to="/" className="navbar-brand navbar-brand--light" aria-label="SkillTrack AI Home">
              <div className="brand-icon-wrapper" aria-hidden="true">
                <HiSparkles className="brand-sparkle" />
              </div>
              <span className="brand-text">
                SkillTrack <span className="brand-accent">AI</span>
              </span>
            </Link>
          </div>

          {/* Main Visual Content */}
          <div className="auth-visual-body">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="auth-visual-badge">
                <HiSparkles /> Next-Gen AI Career Portal
              </span>
              <h2 className="auth-visual-headline">
                Accelerate Your Tech Career with Real-Time <span className="text-gradient-cyan">AI Intelligence</span>
              </h2>
              <p className="auth-visual-subtext">
                Join thousands of candidates and top recruiters utilizing AI mock interviews, instant resume ATS scoring, and verified skill badges.
              </p>
            </motion.div>

            {/* Feature Floating Graphic Showcase Cards */}
            <div className="auth-visual-cards">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="auth-floating-card card-1"
              >
                <div className="card-icon-bubble bg-indigo">
                  <FiTrendingUp />
                </div>
                <div>
                  <div className="card-mini-title">AI Match Score</div>
                  <div className="card-mini-val">94% Compatibility</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="auth-floating-card card-2"
              >
                <div className="card-icon-bubble bg-cyan">
                  <FiAward />
                </div>
                <div>
                  <div className="card-mini-title">Verified Skill Badge</div>
                  <div className="card-mini-val">Senior React Specialist</div>
                </div>
              </motion.div>
            </div>

            {/* Feature Points */}
            <ul className="auth-visual-list">
              <li>
                <FiCheckCircle className="check-icon" />
                <span>Instant 0–100 ATS Resume Compatibility Analysis</span>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <span>Live Voice NLP Technical Mock Drills</span>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <span>Direct Access to Verified Enterprise Recruiters</span>
              </li>
            </ul>
          </div>

          {/* Footer quote */}
          <div className="auth-visual-footer">
            <FiShield className="shield-icon" />
            <span>Enterprise-Grade Encryption & Privacy Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="auth-form-side">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="auth-card-wrapper"
          >
            {/* Mobile Header Logo */}
            <div className="auth-mobile-header">
              <Link to="/" className="navbar-brand" aria-label="SkillTrack AI Home">
                <div className="brand-icon-wrapper" aria-hidden="true">
                  <HiSparkles className="brand-sparkle" />
                </div>
                <span className="brand-text">
                  SkillTrack <span className="brand-accent">AI</span>
                </span>
              </Link>
            </div>

            <div className="auth-header">
              {title && <h1 className="auth-title">{title}</h1>}
              {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            </div>

            {children}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
