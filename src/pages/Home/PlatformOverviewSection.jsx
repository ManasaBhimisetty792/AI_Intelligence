import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCpu, FiTrendingUp, FiShield } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const OVERVIEW_POINTS = [
  {
    icon: <FiCpu />,
    title: 'AI-Powered Optimization',
    desc: 'Advanced natural language models continuously analyze resumes against real-world ATS filters and job specifications.',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Interactive Mock Drills',
    desc: 'Practice technical & behavioral interviews with instant voice NLP feedback, tone scoring, and ideal answer recommendations.',
  },
  {
    icon: <FiShield />,
    title: 'Verified Skill Profiles',
    desc: 'Skill badges and standardized assessments build cryptographic trust between top-tier candidates and enterprise recruiters.',
  },
];

export const PlatformOverviewSection = () => {
  return (
    <section className="section-padding bg-subtle-glow" id="platform-overview">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header text-center"
        >
          <span className="badge-ai"><HiSparkles /> Unified Career Platform</span>
          <h2 className="section-title">
            Everything You Need to <span className="text-gradient-primary">Build Your Career</span>
          </h2>
          <p className="section-subtitle">
            SkillTrack AI combines resume optimization, interview preparation, recruiter collaboration,
            and AI-powered insights into a single intelligent platform designed for career success.
          </p>
        </motion.div>

        <div className="overview-cards-grid mt-5">
          {OVERVIEW_POINTS.map((pt, i) => (
            <motion.div
              key={pt.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card overview-card"
            >
              <div className="overview-icon">{pt.icon}</div>
              <h3 className="overview-card-title">{pt.title}</h3>
              <p className="overview-card-desc">{pt.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformOverviewSection;
