import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiSend } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './footer.css';

const PLATFORM_LINKS = [
  { label: 'AI Mock Interviews', path: '/how-it-works' },
  { label: 'ATS Resume Scanner', path: '/how-it-works' },
  { label: 'Skill Matrix Analytics', path: '/how-it-works' },
  { label: 'Pricing Plans', path: '/pricing' },
  { label: 'How It Works', path: '/how-it-works' },
];

const RESOURCE_LINKS = [
  { label: 'For Candidates', path: '/signup' },
  { label: 'For Recruiters', path: '/signup' },
  { label: 'For Institutions', path: '/contact' },
  { label: 'About SkillTrack', path: '/about' },
  { label: 'Contact Support', path: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: <FiGithub />, href: 'https://github.com', label: 'GitHub' },
  { icon: <FiTwitter />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <FiLinkedin />, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <FiMail />, href: 'mailto:support@skilltrack.ai', label: 'Email' },
];

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed! Welcome to the SkillTrack AI community.');
    setEmail('');
  };

  return (
    <footer className="footer-section" role="contentinfo">
      <div className="container">
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="navbar-brand footer-logo" aria-label="SkillTrack AI">
              <div className="brand-icon-wrapper" aria-hidden="true">
                <HiSparkles className="brand-sparkle" />
              </div>
              <span className="brand-text">
                SkillTrack <span className="brand-accent">AI</span>
              </span>
            </Link>
            <p className="footer-tagline">
              The next-generation AI assessment, mock interview, and recruiter discovery
              platform — powering career breakthroughs for candidates and talent teams worldwide.
            </p>
            <div className="social-links" aria-label="Social media links">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="social-icon"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-links-col">
            <h3 className="footer-heading">Platform</h3>
            <ul className="footer-links-list" role="list">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.path}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources / Solutions */}
          <div className="footer-links-col">
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-links-list" role="list">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.path}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter-col">
            <h3 className="footer-heading">Stay Updated</h3>
            <p className="newsletter-desc">
              Subscribe for weekly AI interview tips, ATS algorithm updates, and
              recruiter insights delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form" aria-label="Newsletter signup">
              <input
                type="email"
                placeholder="Enter your email address"
                className="input-glass newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="btn-primary newsletter-btn" aria-label="Subscribe to newsletter">
                <FiSend /> Subscribe
              </button>
            </form>
          </div>

        </div>

        <hr className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} SkillTrack AI Technologies Inc. All rights reserved.
          </p>
          <nav className="legal-links" aria-label="Legal links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Security</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
