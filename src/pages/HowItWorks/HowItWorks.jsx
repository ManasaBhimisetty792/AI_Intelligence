import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUserCheck,
  FiFileText,
  FiUploadCloud,
  FiBarChart2,
  FiVideo,
  FiTrendingUp,
  FiBriefcase,
  FiCheckCircle,
  FiUserPlus,
  FiShield,
  FiCalendar,
  FiPieChart,
  FiArrowRight,
  FiAward,
  FiBookOpen,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import './howitworks.css';

const STUDENT_STEPS = [
  { step: '01', title: 'Create Account', icon: <FiUserPlus />, desc: 'Register in seconds using email or 1-click Google Auth.' },
  { step: '02', title: 'Complete Profile', icon: <FiUserCheck />, desc: 'Define target roles, preferred tech stack, and career milestones.' },
  { step: '03', title: 'Upload Resume', icon: <FiUploadCloud />, desc: 'Drag-and-drop your resume PDF or Word file into the AI engine.' },
  { step: '04', title: 'Receive AI Resume Score', icon: <FiBarChart2 />, desc: 'Get instant 0–100 ATS compatibility feedback and structural tips.' },
  { step: '05', title: 'Practice AI Mock Drills', icon: <FiVideo />, desc: 'Answer role-tailored technical questions with real-time voice NLP scoring.' },
  { step: '06', title: 'Improve Skills', icon: <FiTrendingUp />, desc: 'Follow custom AI recommendations to patch skill & keyword gaps.' },
  { step: '07', title: 'Apply for Jobs', icon: <FiBriefcase />, desc: 'Apply to active recruiter listings with your verified skill badge.' },
  { step: '08', title: 'Track Career Growth', icon: <FiAward />, desc: 'Monitor application statuses, analytics, and interview performance over time.' },
];

const RECRUITER_STEPS = [
  { step: '01', title: 'Register Account', icon: <FiUserPlus />, desc: 'Sign up as an enterprise recruiter or hiring team lead.' },
  { step: '02', title: 'Company Verification', icon: <FiShield />, desc: 'Quick platform verification ensuring authentic employer access.' },
  { step: '03', title: 'Create Company Profile', icon: <FiBriefcase />, desc: 'Showcase your company culture, benefits, and tech stack.' },
  { step: '04', title: 'Post Jobs', icon: <FiFileText />, desc: 'Publish open engineering roles with custom ATS filter rubrics.' },
  { step: '05', title: 'Screen Candidates', icon: <FiBarChart2 />, desc: 'AI automatically scores and ranks candidate profiles by match accuracy.' },
  { step: '06', title: 'Schedule Interviews', icon: <FiCalendar />, desc: 'Sync calendars and issue 1-click interview invitations.' },
  { step: '07', title: 'Review AI Reports', icon: <FiPieChart />, desc: 'Listen to mock drill recordings and inspect detailed skill metrics.' },
  { step: '08', title: 'Hire Talent', icon: <FiCheckCircle />, desc: 'Send offers to pre-vetted, high-scoring talent fast.' },
];

const ADMIN_STEPS = [
  { step: '01', title: 'Platform Monitoring', icon: <FiPieChart />, desc: 'Real-time dashboard monitoring platform usage and system health.' },
  { step: '02', title: 'Recruiter Verification', icon: <FiShield />, desc: 'Review corporate credentials to approve authentic employer accounts.' },
  { step: '03', title: 'User Management', icon: <FiUserCheck />, desc: 'Manage candidate, recruiter, and institutional permissions.' },
  { step: '04', title: 'Subscription Management', icon: <FiAward />, desc: 'Oversee billing tiers, enterprise custom quotes, and renewals.' },
  { step: '05', title: 'Analytics & Insights', icon: <FiBarChart2 />, desc: 'Generate platform placement rates and recruiter engagement reports.' },
  { step: '06', title: 'Platform Reports', icon: <FiFileText />, desc: 'Export audit logs and placement statistics for partner institutions.' },
];

const BENEFITS_LIST = [
  {
    target: 'Students & Candidates',
    color: 'var(--color-primary)',
    icon: <FiUserCheck />,
    items: [
      '35+ point ATS resume score lift',
      'Realistic voice NLP mock interviews',
      'Verified cryptographic skill badges',
      'Personalized learning recommendations',
    ],
  },
  {
    target: 'Recruiters & Talent Teams',
    color: 'var(--color-secondary)',
    icon: <FiBriefcase />,
    items: [
      '75% faster time-to-hire',
      'Automated applicant screening & ranking',
      'Access to candidate mock drill recordings',
      'Integrated 1-click calendar scheduling',
    ],
  },
  {
    target: 'Educational Institutions',
    color: 'var(--color-accent)',
    icon: <FiBookOpen />,
    items: [
      'Centralized campus placement analytics',
      'Batch candidate readiness monitoring',
      'Custom institutional interview tracks',
      'Higher graduate placement velocity',
    ],
  },
  {
    target: 'Companies & Enterprises',
    color: 'var(--color-success)',
    icon: <FiShield />,
    items: [
      'Standardized objective candidate evaluation',
      'Eliminated resume screening bias',
      'Custom branding & API integrations',
      'Dedicated enterprise support SLA',
    ],
  },
];

/* ── Beautiful Alternating Flowchart ──────────────────────────────── */
const FlowChartSteps = ({ steps }) => {
  return (
    <div className="hiw-flowchart-wrapper">
      {steps.map((step, index) => {
        const side = index % 2 === 0 ? 'left-side' : 'right-side';
        return (
          <React.Fragment key={step.step}>
            {/* Step Row */}
            <motion.div
              className={`hiw-flow-row ${side}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
            >
              {/* Card */}
              <div className="hiw-flow-card-new">
                <div className="hiw-card-inner">
                  <div className="hiw-card-icon-wrap-new">{step.icon}</div>
                  <div className="hiw-card-content">
                    <h3 className="hiw-card-title-new">{step.title}</h3>
                    <p className="hiw-card-desc-new">{step.desc}</p>
                  </div>
                </div>
              </div>

              {/* Central spine node */}
              <div className="hiw-flow-node">
                <span className="hiw-flow-node-step">STEP</span>
                <span className="hiw-flow-node-num">{parseInt(step.step)}</span>
              </div>
            </motion.div>

            {/* Connector between steps */}
            {index !== steps.length - 1 && (
              <div className="hiw-flow-connector">
                <motion.div
                  className="hiw-flow-connector-dot"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.07 + 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const HowItWorks = () => {
  const [activeRole, setActiveRole] = useState('student');

  const currentSteps =
    activeRole === 'recruiter'
      ? RECRUITER_STEPS
      : activeRole === 'admin'
      ? ADMIN_STEPS
      : STUDENT_STEPS;

  return (
    <div className="hiw-page-wrapper">
      <section className="section-padding hiw-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-header text-center"
          >
            <span className="badge-ai"><HiSparkles /> Step-by-Step Interactive Workflow</span>
            <h1 className="section-title mt-2">
              How <span className="text-gradient-primary">SkillTrack AI</span> Works
            </h1>
            <p className="section-subtitle">
              Explore the end-to-end interactive journeys for candidates, recruiters, and platform administrators.
            </p>
          </motion.div>

          <div className="hiw-role-tabs-container">
            <button
              type="button"
              onClick={() => setActiveRole('student')}
              className={`hiw-role-tab ${activeRole === 'student' ? 'active' : ''}`}
            >
              <FiUserCheck /> Student Journey
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('recruiter')}
              className={`hiw-role-tab ${activeRole === 'recruiter' ? 'active' : ''}`}
            >
              <FiBriefcase /> Recruiter Journey
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`hiw-role-tab ${activeRole === 'admin' ? 'active' : ''}`}
            >
              <FiShield /> Administrator Journey
            </button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-subtle-glow">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="hiw-flow-section"
            >
              <FlowChartSteps steps={currentSteps} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge-glass"><HiSparkles /> Measurable Value</span>
            <h2 className="section-title">
              Benefits for <span className="text-gradient-primary">Every Stakeholder</span>
            </h2>
            <p className="section-subtitle">
              SkillTrack AI delivers high-impact outcomes across every tier of career preparation and talent acquisition.
            </p>
          </div>

          <div className="hiw-benefits-grid mt-5">
            {BENEFITS_LIST.map((b, i) => (
              <motion.div
                key={b.target}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="hiw-benefit-card"
              >
                <div className="hiw-benefit-header">
                  <div className="hiw-benefit-icon" style={{ background: `${b.color}15`, color: b.color }}>
                    {b.icon}
                  </div>
                  <h3 className="hiw-benefit-target">{b.target}</h3>
                </div>

                <ul className="hiw-benefit-items">
                  {b.items.map((item, idx) => (
                    <li key={idx}>
                      <FiCheckCircle className="text-emerald" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="glass-card text-center" style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.06) 100%)' }}>
            <HiSparkles style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <h2 className="section-title">Start Your Journey Today</h2>
            <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0.75rem auto 2rem' }}>
              Join candidates and recruiters using SkillTrack AI for intelligent career growth.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
                Get Started Free <FiArrowRight />
              </Link>
              <Link to="/pricing" className="btn-secondary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;