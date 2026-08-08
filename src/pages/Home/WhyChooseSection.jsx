import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck, FiZap, FiClock, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const TRADITIONAL_POINTS = [
  'Blind resume submissions into black-hole applicant portals',
  'No feedback on why your resume was rejected by ATS filters',
  'Nerve-wracking interviews without realistic practice or scoring',
  'Manual recruiter screening taking 3–4 weeks per role',
  'Generic job recommendations without skill alignment',
  'High candidate drop-off and inefficient hiring pipelines',
];

const SKILLTRACK_POINTS = [
  'Instant AI ATS analysis & score optimization before applying',
  'Real-time voice NLP mock interviews with instant rubrics',
  'Verified skill badges visible to 350+ active recruiters',
  'Automated recruiter screening reduces hiring time by 75%',
  'Personalized AI learning paths to close skill gaps quickly',
  'Highest placement success with 95% candidate satisfaction',
];

export const WhyChooseSection = () => {
  return (
    <section className="section-padding bg-subtle-glow" id="why-choose">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header text-center"
        >
          <span className="badge-glass"><FiZap /> The AI Advantage</span>
          <h2 className="section-title">
            Traditional Process vs <span className="text-gradient-primary">SkillTrack AI</span>
          </h2>
          <p className="section-subtitle">
            See how AI-powered career intelligence eliminates guesswork, bias, and delay for candidates and recruiters.
          </p>
        </motion.div>

        <div className="benefits-dual-grid mt-5">
          {/* Traditional Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card benefit-card benefit-card--traditional"
          >
            <div className="benefit-header">
              <div className="benefit-badge-icon icon-danger">
                <FiAlertTriangle />
              </div>
              <div>
                <h3 className="benefit-card-title">Traditional Process</h3>
                <p className="benefit-card-subtitle">Manual, slow, and opaque</p>
              </div>
            </div>

            <ul className="benefit-list">
              {TRADITIONAL_POINTS.map((pt, i) => (
                <li key={i}>
                  <FiX className="benefit-check text-danger" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SkillTrack AI Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card benefit-card benefit-card--skilltrack"
          >
            <div className="benefit-header">
              <div className="benefit-badge-icon icon-student">
                <HiSparkles />
              </div>
              <div>
                <h3 className="benefit-card-title text-gradient-primary">SkillTrack AI</h3>
                <p className="benefit-card-subtitle">Instant, intelligent, and transparent</p>
              </div>
            </div>

            <ul className="benefit-list">
              {SKILLTRACK_POINTS.map((pt, i) => (
                <li key={i}>
                  <FiCheck className="benefit-check text-emerald" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
