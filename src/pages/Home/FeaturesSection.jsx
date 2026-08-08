import React from 'react';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiEdit3,
  FiVideo,
  FiBarChart2,
  FiTarget,
  FiCompass,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiLayers,
  FiBookOpen,
  FiPieChart,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const CORE_FEATURES = [
  {
    id: 'resume-analysis',
    icon: <FiFileText />,
    color: 'var(--color-primary)',
    title: 'AI Resume Analysis',
    desc: 'Instant structural, keyword, and formatting audit against 500+ top ATS parser algorithms.',
  },
  {
    id: 'resume-builder',
    icon: <FiEdit3 />,
    color: 'var(--color-secondary)',
    title: 'Resume Builder',
    desc: 'Dynamic AI templates that auto-tailor achievements and bullet points for specific job descriptions.',
  },
  {
    id: 'mock-interviews',
    icon: <FiVideo />,
    color: 'var(--color-accent)',
    title: 'AI Mock Interviews',
    desc: 'Simulate real technical & behavioral rounds with voice NLP articulation scoring and feedback.',
  },
  {
    id: 'resume-score',
    icon: <FiBarChart2 />,
    color: 'var(--color-success)',
    title: 'Resume Score',
    desc: 'Get an instant 0–100 ATS compatibility score with line-by-line recommendations for improvement.',
  },
  {
    id: 'job-matching',
    icon: <FiTarget />,
    color: 'var(--color-warning)',
    title: 'Job Matching',
    desc: 'Algorithmic matching connecting your verified skill profile directly to open recruiter roles.',
  },
  {
    id: 'career-recommendations',
    icon: <FiCompass />,
    color: '#F43F5E',
    title: 'Career Recommendations',
    desc: 'Personalized career roadmaps and role recommendations based on your evolving market strengths.',
  },
  {
    id: 'recruiter-dashboard',
    icon: <FiBriefcase />,
    color: 'var(--color-primary)',
    title: 'Recruiter Dashboard',
    desc: 'Centralized talent hub allowing hiring managers to screen, filter, and review top candidates.',
  },
  {
    id: 'interview-scheduling',
    icon: <FiCalendar />,
    color: 'var(--color-secondary)',
    title: 'Interview Scheduling',
    desc: 'Automated calendar sync and 1-click candidate interview invite management.',
  },
  {
    id: 'performance-analytics',
    icon: <FiTrendingUp />,
    color: 'var(--color-accent)',
    title: 'Performance Analytics',
    desc: 'Track your growth over time across technical accuracy, tone confidence, and problem-solving speed.',
  },
  {
    id: 'skill-gap-analysis',
    icon: <FiLayers />,
    color: 'var(--color-success)',
    title: 'Skill Gap Analysis',
    desc: 'Identify missing technologies or certifications required to land staff-level engineering offers.',
  },
  {
    id: 'personalized-learning',
    icon: <FiBookOpen />,
    color: 'var(--color-warning)',
    title: 'Personalized Learning',
    desc: 'Custom study tracks, coding drills, and curated prep guides tailored to your weak areas.',
  },
  {
    id: 'hiring-insights',
    icon: <FiPieChart />,
    color: '#F43F5E',
    title: 'Hiring Insights',
    desc: 'Market salary benchmarks, hiring velocity analytics, and talent supply reports for teams.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="section-padding" id="features">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header text-center"
        >
          <span className="badge-ai"><HiSparkles /> Powerful Capability Suite</span>
          <h2 className="section-title">
            12 Core Features for <span className="text-gradient-primary">End-to-End Success</span>
          </h2>
          <p className="section-subtitle">
            From resume crafting to live recruiter interviews, discover the tools powering modern talent acquisition.
          </p>
        </motion.div>

        <div className="features-grid mt-5">
          {CORE_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card feature-card"
            >
              <div
                className="feature-icon"
                style={{ background: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
