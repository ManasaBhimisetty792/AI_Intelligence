import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTarget,
  FiEye,
  FiBookOpen,
  FiZap,
  FiShield,
  FiUsers,
  FiCpu,
  FiCheckCircle,
  FiArrowRight,
  FiLayers,
  FiGlobe,
  FiLock,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import './about.css';

const CORE_VALUES = [
  {
    icon: <FiZap />,
    color: 'var(--color-primary)',
    title: 'Innovation',
    desc: 'Continuously pioneering state-of-the-art AI algorithms, NLP models, and real-time assessment capabilities.',
  },
  {
    icon: <FiShield />,
    color: 'var(--color-secondary)',
    title: 'Integrity',
    desc: 'Ensuring objective, unbiased candidate evaluation with transparent cryptographic skill verification.',
  },
  {
    icon: <FiGlobe />,
    color: 'var(--color-accent)',
    title: 'Accessibility',
    desc: 'Providing high-caliber, staff-level interview coaching and resume screening tools to candidates everywhere.',
  },
  {
    icon: <FiUsers />,
    color: 'var(--color-success)',
    title: 'Collaboration',
    desc: 'Fostering seamless interaction between job seekers, university career departments, and enterprise talent teams.',
  },
  {
    icon: <FiBookOpen />,
    color: 'var(--color-warning)',
    title: 'Continuous Learning',
    desc: 'Empowering users to constantly upskill, iterate, and improve through data-driven feedback loops.',
  },
  {
    icon: <FiLock />,
    color: '#F43F5E',
    title: 'Transparency',
    desc: 'Open scoring rubrics, clear privacy standards, and predictable subscription models with zero hidden fees.',
  },
];

// const TECH_ITEMS = [
//   { name: 'Artificial Intelligence', desc: 'GPT-4 powered interview simulators & resume tailoring' },
//   { name: 'Machine Learning', desc: 'Custom NLP classification models trained on 500+ ATS specs' },
//   { name: 'Resume Analysis', desc: 'Deep parsing of skills, achievements, and formatting gaps' },
//   { name: 'Mock Interviews', desc: 'Real-time audio articulation and confidence analysis' },
//   { name: 'Recruitment Analytics', desc: 'Pipeline velocity, skill heatmaps, and salary benchmark data' },
//   { name: 'Cloud Infrastructure', desc: 'Distributed microservices ensuring sub-100ms latency globally' },
//   { name: 'FastAPI', desc: 'High-performance Python backend handling AI inference tasks' },
//   { name: 'React 19', desc: 'Modern reactive frontend with Vite and Framer Motion animations' },
//   { name: 'Supabase', desc: 'Enterprise-grade PostgreSQL with Row-Level Security & Auth' },
// ];

const ROADMAP_STEPS = [
  { phase: 'Q1 2026', title: 'AI Career Coach', desc: 'Personalized 24/7 AI mentor guiding candidate learning paths.' },
  { phase: 'Q2 2026', title: 'AI Job Matching', desc: 'Algorithmic 1-click candidate-to-recruiter matching system.' },
  { phase: 'Q3 2026', title: 'AI Learning Assistant', desc: 'Adaptive coding drills based on interview mistake analysis.' },
  { phase: 'Q4 2026', title: 'University Integrations', desc: 'LMS & Campus Career Portal integrations for 100+ partner universities.' },
  { phase: 'Q1 2027', title: 'Enterprise Hiring Suite', desc: 'Custom AI rubric builders and team video panel tools for Fortune 500s.' },
  { phase: 'Q2 2027', title: 'Global Expansion', desc: 'Multi-lingual voice NLP support in 15+ international languages.' },
];

export const About = () => {
  return (
    <div className="about-page-wrapper">
      {/* 1. Hero */}
      <section className="section-padding about-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-header text-center"
          >
            <span className="badge-ai"><HiSparkles /> Empowering Careers Through Artificial Intelligence</span>
            <h1 className="section-title mt-2">
              About <span className="text-gradient-primary">SkillTrack AI</span>
            </h1>
            <p className="section-subtitle">
              SkillTrack AI was built by senior software architects and AI researchers to remove hiring bias,
              speed up recruitment, and give every candidate equal access to world-class career preparation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Mission & Our Vision */}
      <section className="section-padding bg-subtle-glow">
        <div className="container">
          <div className="mission-vision-grid">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card mission-card"
            >
              <div className="mission-icon icon-primary"><FiTarget /></div>
              <h2 className="mission-title">Our Mission</h2>
              <p className="mission-desc">
                Our mission is to bridge the gap between education and employment by helping students
                become industry-ready while enabling recruiters to identify the best talent using intelligent
                AI-powered tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card mission-card"
            >
              <div className="mission-icon icon-secondary"><FiEye /></div>
              <h2 className="mission-title text-gradient-primary">Our Vision</h2>
              <p className="mission-desc">
                To become the world's most trusted AI-powered career development and recruitment platform
                that transforms how students learn, prepare, and get hired across every technology domain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Our Story */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '850px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card story-card"
          >
            <span className="badge-glass mb-2"><FiBookOpen /> How We Started</span>
            <h2 className="story-heading">The Story Behind SkillTrack AI</h2>
            <div className="story-content">
              <p>
                In 2024, our founders—former engineering leads and university career mentors—noticed a broken dynamic in the tech industry:
                brilliant candidates were getting rejected by keyword-blind ATS parsers, while recruiters were overwhelmed by thousands of unformatted PDFs.
              </p>
              <p>
                Students lacked objective feedback on how to handle high-stakes technical interviews, and university placement officers struggled to track candidate readiness at scale.
              </p>
              <p>
                We built SkillTrack AI to solve this exact problem. By combining LLM-powered resume optimization, real-time voice NLP interview simulators, and cryptographically verified skill badges, we built an end-to-end ecosystem where merit and skill take center stage.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="section-padding bg-subtle-glow">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge-ai"><HiSparkles /> Our Foundation</span>
            <h2 className="section-title">Core <span className="text-gradient-primary">Values</span></h2>
            <p className="section-subtitle">The core principles guiding our product development, engineering, and customer support.</p>
          </div>

          <div className="features-grid mt-5">
            {CORE_VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                className="glass-card value-card"
              >
                <div className="value-icon" style={{ background: `${val.color}15`, color: val.color }}>
                  {val.icon}
                </div>
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Technology */}
      {/* <section className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge-glass"><FiCpu /> Technology Stack</span>
            <h2 className="section-title">Powered by <span className="text-gradient-primary">Cutting-Edge AI</span></h2>
            <p className="section-subtitle">Under the hood, SkillTrack AI integrates robust backend microservices, modern frontends, and security protocols.</p>
          </div>

          <div className="tech-grid mt-5">
            {TECH_ITEMS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i % 3) * 0.06 }}
                className="glass-card tech-card"
              >
                <FiCheckCircle className="text-emerald tech-check" />
                <div>
                  <h4 className="tech-name">{item.name}</h4>
                  <p className="tech-desc">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 6. Why SkillTrack AI */}
      <section className="section-padding bg-subtle-glow">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Organizations & Students <span className="text-gradient-primary">Choose Us</span></h2>
            <p className="section-subtitle">Proven outcomes for students, universities, talent teams, and enterprise recruiters.</p>
          </div>

          <div className="why-benefits-dual mt-4">
            <div className="glass-card why-benefit-box">
              <h3 className="why-box-title text-primary">For Candidates & Students</h3>
              <ul className="why-box-list">
                <li><FiCheckCircle className="text-emerald" /> Boost ATS resume match score by up to 35+ points</li>
                <li><FiCheckCircle className="text-emerald" /> Practice 100+ role-specific technical & behavioral interview scenarios</li>
                <li><FiCheckCircle className="text-emerald" /> Get instant voice articulation and filler-word analysis</li>
                <li><FiCheckCircle className="text-emerald" /> Earn verified skill badges showcased directly to hiring partners</li>
              </ul>
            </div>

            <div className="glass-card why-benefit-box">
              <h3 className="why-box-title text-secondary">For Recruiters & Institutions</h3>
              <ul className="why-box-list">
                <li><FiCheckCircle className="text-emerald" /> Reduce resume screening time by over 75%</li>
                <li><FiCheckCircle className="text-emerald" /> Shortlist top candidates based on objective AI performance metrics</li>
                <li><FiCheckCircle className="text-emerald" /> Access verified interview audio & skill transcripts</li>
                <li><FiCheckCircle className="text-emerald" /> Centralized campus placement monitoring for career directors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Future Roadmap */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge-ai"><HiSparkles /> Innovation Timeline</span>
            <h2 className="section-title">Future <span className="text-gradient-primary">Roadmap</span></h2>
            <p className="section-subtitle">Our strategic vision for advancing AI career intelligence over the coming quarters.</p>
          </div>

          <div className="roadmap-timeline mt-5">
            {ROADMAP_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="roadmap-item glass-card"
              >
                <div className="roadmap-phase-badge">{step.phase}</div>
                <h4 className="roadmap-title">{step.title}</h4>
                <p className="roadmap-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="glass-card text-center" style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.06) 100%)' }}>
            <HiSparkles style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <h2 className="section-title">Join SkillTrack AI Today</h2>
            <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0.75rem auto 2rem' }}>
              Experience AI-powered career preparation and intelligent talent acquisition.
            </p>
            <Link to="/signup" className="btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
