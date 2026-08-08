import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

import Hero from './Hero';
import TrustedBySection from './TrustedBySection';
import PlatformOverviewSection from './PlatformOverviewSection';
import FeaturesSection from './FeaturesSection';
import WhyChooseSection from './WhyChooseSection';
import WorkflowSection from './WorkflowSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import './home.css';

/* ── Module 4 Section #6: Platform Statistics Animated Counters ── */
const StatisticsSection = () => (
  <section className="stats-banner-section" id="platform-stats">
    <div className="container">
      <div className="glass-card stats-container">
        <div className="stat-box">
          <div className="stat-number text-gradient-primary">25,000+</div>
          <div className="stat-label">Students Prepared</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <div className="stat-number text-gradient-cyan">350+</div>
          <div className="stat-label">Active Recruiters</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <div className="stat-number text-gradient-primary">18,000+</div>
          <div className="stat-label">AI Interviews Evaluated</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <div className="stat-number text-gradient-gold">500+</div>
          <div className="stat-label">Enterprise Companies</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <div className="stat-number text-gradient-primary">98.4%</div>
          <div className="stat-label">Placement Success</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <div className="stat-number text-gradient-cyan">85,000+</div>
          <div className="stat-label">Resume Analyses</div>
        </div>
      </div>
    </div>
  </section>
);

/* ── Module 4 Section #9: Final Call to Action ── */
const CTABanner = () => {
  // const { googleLogin } = useAuth();

  return (
    <section className="section-padding cta-section" id="cta">
      <div className="container">
        <div className="glass-card cta-card text-center">
          <span className="badge-ai mb-3">
            <HiSparkles /> Transform Your Career Today
          </span>
          <h2 className="cta-title">Ready to Accelerate Your Career?</h2>
          <p className="cta-desc">
            Join SkillTrack AI today and experience AI-powered career preparation and intelligent recruitment.
          </p>
          <div className="cta-btn-group mt-4">
            <Link to="/signup" className="btn-primary cta-btn-lg">
              Get Started <FiArrowRight />
            </Link>
            {/* <button
              type="button"
              onClick={googleLogin}
              className="btn-glass cta-btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FcGoogle style={{ fontSize: '1.25rem' }} /> Continue with Google
            </button> */}
          </div>
          <div className="cta-guarantee mt-3">
            <FiCheckCircle className="text-emerald" /> No credit card required • Instant free practice credits
          </div>
        </div>
      </div>
    </section>
  );
};

export const Home = () => {
  return (
    <div className="home-page-wrapper">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trusted By */}
      <TrustedBySection />

      {/* 3. Platform Overview */}
      <PlatformOverviewSection />

      {/* 4. Core Features (12 Cards) */}
      <FeaturesSection />

      {/* 5. Why Choose SkillTrack AI (Traditional vs AI) */}
      <WhyChooseSection />

      {/* 6. Platform Statistics */}
      <StatisticsSection />

      {/* 7. How It Works Preview (Students, Recruiters, Admins) */}
      <WorkflowSection />

      {/* 8. Testimonials */}
      <TestimonialsSection />

      {/* FAQ Dropdown Section */}
      <FAQSection />

      {/* 9. Final Call to Action */}
      <CTABanner />
    </div>
  );
};

export default Home;
