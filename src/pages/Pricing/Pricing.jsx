import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiStar,
  FiShield,
  FiHelpCircle,
  FiChevronDown,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import RazorpayCheckout from '../../components/Auth/RazorpayCheckout';
import PremiumBadge from '../../components/common/PremiumBadge';
import './Pricing.css';

const FAQ_DATA = [
  {
    q: 'How does the Razorpay Student Premium payment work?',
    a: 'Click "Upgrade to Premium" to open the secure Razorpay Checkout modal. You can pay via UPI, Credit/Debit Card, Netbanking, or Wallets. Once verified, your account is immediately upgraded to Premium.',
  },
  {
    q: 'What is included in the Student Premium plan?',
    a: 'Premium gives you unlimited AI Mock Interviews, full Voice NLP Reports, unlimited ATS Resume Screening, AI Career Roadmaps, Verified Skill Certificates, and priority recruiter visibility.',
  },
  {
    q: 'Do Recruiters pay for subscriptions?',
    a: 'No! SkillTrack AI is 100% free for Recruiters. Recruiters conduct interviews and earn payouts based on completed drills approved by the Admin.',
  },
  {
    q: 'Can I download payment invoices?',
    a: 'Yes! All student transactions are stored permanently in Supabase. You can view and download official invoices anytime from your Payment History page in the Student Dashboard.',
  },
];

export const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const isPremium = user?.is_premium || user?.membership_type === 'premium';

  return (
    <div className="pricing-page-wrapper">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="pricing-hero-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pricing-hero__content"
          >
            <div className="pricing-hero__badge-container">
              <PremiumBadge text="👑 Student Career Plans" size="medium" />
            </div>

            <h1 className="pricing-hero__title">
              Invest in Your Career with <br />
              <span className="pricing-gradient-text">SkillTrack AI Premium</span>
            </h1>
            <p className="pricing-hero__subtitle">
              Transparent, student-focused pricing. Unlock unlimited AI mock interviews, detailed ATS reports, and priority recruiter visibility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards Section ────────────────────────────────── */}
      <section className="pricing-cards-container">
        <div className="container">
          <div className="pricing-grid-layout">

            {/* 1. FREE STUDENT PLAN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pricing-card pricing-card--free"
            >
              <div className="pricing-card__header">
                <div className="pricing-card__title-row">
                  <span className="pricing-card__plan-title pricing-card__plan-title--free">
                    <FiStar className="pricing-icon--free" /> Free Plan
                  </span>
                  <span className="pricing-badge--free">Basic</span>
                </div>
                <p className="pricing-card__desc">
                  For candidates exploring AI interview preparation.
                </p>

                <div className="pricing-card__price-row">
                  <span className="price-amount--free">₹0</span>
                  <span className="price-period--free">/ forever</span>
                </div>
              </div>

              <ul className="pricing-feature-list">
                <li className="feature-item--included">
                  <FiCheckCircle className="check-icon" /> Resume Upload & Storage
                </li>
                <li className="feature-item--included">
                  <FiCheckCircle className="check-icon" /> Basic ATS Score Calculation
                </li>
                <li className="feature-item--included">
                  <FiCheckCircle className="check-icon" /> 3 AI Mock Interview Drills
                </li>
                <li className="feature-item--included">
                  <FiCheckCircle className="check-icon" /> 2 Practice Skill Tests
                </li>
                <li className="feature-item--included">
                  <FiCheckCircle className="check-icon" /> Candidate Community Access
                </li>
                <li className="feature-item--disabled">
                  <FiXCircle className="cross-icon" /> AI Career Roadmap
                </li>
                <li className="feature-item--disabled">
                  <FiXCircle className="cross-icon" /> Verified Skill Certificates
                </li>
              </ul>

              <div className="pricing-card__footer">
                {user ? (
                  <button disabled className="btn-plan-current">
                    {isPremium ? 'Free Tier Included' : 'Current Plan'}
                  </button>
                ) : (
                  <Link to="/signup" className="btn-plan-free">
                    Get Started Free
                  </Link>
                )}
              </div>
            </motion.div>

            {/* 2. PREMIUM STUDENT PLAN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pricing-card pricing-card--premium"
            >
              <div className="recommended-pill-wrapper">
                <span className="recommended-pill">★ RECOMMENDED FOR CANDIDATES</span>
              </div>

              <div className="pricing-card__header">
                <div className="pricing-card__title-row">
                  <span className="pricing-card__plan-title pricing-card__plan-title--premium">
                    <HiSparkles className="pricing-icon--premium" /> Student Premium
                  </span>
                  <span className="pricing-badge--premium">BEST VALUE</span>
                </div>
                <p className="pricing-card__desc pricing-card__desc--premium">
                  For serious candidates landing high-paying tech and engineering roles.
                </p>

                <div className="pricing-card__price-row">
                  <span className="price-amount--premium">₹999</span>
                  <span className="price-period--premium">/ year</span>
                </div>
              </div>

              <ul className="pricing-feature-list">
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Unlimited AI Mock Interviews
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Unlimited ATS Resume Reports
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> AI Career Roadmap Generator
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Detailed Voice NLP Feedback
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Full Interview Audio Recordings
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Verified Skill Certificates
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Priority Recruiter Visibility Badge
                </li>
                <li className="feature-item--premium">
                  <FiCheckCircle className="check-icon--premium" /> Priority 24/7 Support
                </li>
              </ul>

              <div className="pricing-card__footer">
                {isPremium ? (
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className="btn-plan-active-premium"
                  >
                    👑 You are Premium (Go to Dashboard)
                  </button>
                ) : (
                  <RazorpayCheckout planName="Student Premium" amount={999}>
                    <button className="btn-plan-upgrade-premium">
                      Upgrade to Premium <FiArrowRight />
                    </button>
                  </RazorpayCheckout>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Recruiter Banner ─────────────────────────────────────── */}
      <section className="recruiter-banner-section">
        <div className="container">
          <div className="recruiter-banner-card">
            <FiShield className="recruiter-banner__icon" />
            <div className="recruiter-banner__text">
              <h4 className="recruiter-banner__title">
                Are you a Recruiter or Enterprise Employer?
              </h4>
              <p className="recruiter-banner__subtitle">
                Recruiters NEVER pay subscription fees on SkillTrack AI! Create a free recruiter profile, post jobs, and earn payouts for conducted candidate interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────── */}
      <section className="pricing-faq-section">
        <div className="container">
          <div className="pricing-faq__header text-center">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">Everything you need to know about SkillTrack AI student billing.</p>
          </div>

          <div className="faq-accordion-list">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-card-item ${isOpen ? 'faq-card-item--open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question-header">
                    <span className="faq-question-text">{faq.q}</span>
                    <FiChevronDown className={`faq-chevron-icon ${isOpen ? 'faq-chevron-icon--open' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="faq-answer-body">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
