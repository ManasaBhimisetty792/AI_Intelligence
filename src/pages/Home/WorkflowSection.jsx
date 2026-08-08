import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBriefcase, FiShield, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const AUDIENCE_WORKFLOWS = [
  {
    role: 'Students & Candidates',
    icon: <FiUser />,
    badgeColor: 'icon-student',
    stepCount: '3 Simple Steps',
    title: 'Optimize, Practice & Get Discovered',
    desc: 'Upload your resume for instant ATS scoring, practice AI mock interviews with voice feedback, and share verified skill badges with top recruiters.',
    linkText: 'Explore Student Journey',
  },
  {
    role: 'Recruiters & Companies',
    icon: <FiBriefcase />,
    badgeColor: 'icon-recruiter',
    stepCount: '4 Simple Steps',
    title: 'Post, Screen & Hire 10x Faster',
    desc: 'Post job requirements, let AI auto-screen applicants based on verified technical scores, review interview recordings, and hire top talent seamlessly.',
    linkText: 'Explore Recruiter Journey',
  },
  {
    role: 'Universities & Admins',
    icon: <FiShield />,
    badgeColor: 'icon-admin',
    stepCount: 'Platform Control',
    title: 'Monitor Placement & Talent Metrics',
    desc: 'Empower career centers and institution admins to track candidate readiness, verify recruiter accounts, and streamline campus hiring drives.',
    linkText: 'Explore Admin Features',
  },
];

export const WorkflowSection = () => {
  return (
    <section className="section-padding" id="how-it-works-preview">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header text-center"
        >
          <span className="badge-ai"><HiSparkles /> Simple & Seamless</span>
          <h2 className="section-title">
            How SkillTrack AI <span className="text-gradient-primary">Works For You</span>
          </h2>
          <p className="section-subtitle">
            Tailored workflows for candidates, talent acquisition teams, and university administrators.
          </p>
        </motion.div>

        <div className="workflow-grid mt-5">
          {AUDIENCE_WORKFLOWS.map((wf, i) => (
            <motion.div
              key={wf.role}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card workflow-card"
            >
              <div className="workflow-step-badge">{wf.stepCount}</div>
              <div className={`workflow-icon ${wf.badgeColor}`}>{wf.icon}</div>
              <h3 className="workflow-title">{wf.title}</h3>
              <p className="workflow-desc">{wf.desc}</p>
              <Link to="/how-it-works" className="workflow-link mt-3">
                {wf.linkText} <FiArrowRight />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link to="/how-it-works" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Learn More About How It Works <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
