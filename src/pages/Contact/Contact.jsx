import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  FiClock,
  FiMapPin,
  FiBriefcase,
  FiSend,
  FiCheckCircle,
  FiHelpCircle,
  FiZap,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiPlayCircle,
  FiChevronDown
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import OfficeMap from './OfficeMap';
import './contact.css';

const CONTACT_CARDS = [
  {
    icon: <FiMail />,
    color: 'var(--color-primary)',
    title: 'Support & Inquiries',
    desc: 'General platform help & candidate support',
    value: 'support@skilltrack.ai',
    actionText: 'Email Support',
    actionHref: 'mailto:support@skilltrack.ai',
  },
  {
    icon: <FiBriefcase />,
    color: 'var(--color-secondary)',
    title: 'Business & Enterprise',
    desc: 'Recruiter partnerships & university plans',
    value: 'sales@skilltrack.ai',
    actionText: 'Contact Sales',
    actionHref: 'mailto:sales@skilltrack.ai',
  },
  {
    icon: <FiPhone />,
    color: 'var(--color-accent)',
    title: 'Phone Support',
    desc: 'Mon–Fri from 9am to 6pm PST',
    value: '+1 (800) 555-SKILL',
    actionText: 'Call Now',
    actionHref: 'tel:+18005557545',
  },
  {
    icon: <FiClock />,
    color: 'var(--color-success)',
    title: 'Office Hours',
    desc: 'Customer success response window',
    value: '9:00 AM – 6:00 PM PST',
    actionText: 'Live SLA Active',
    actionHref: null,
  },
];

const SOCIAL_MEDIA = [
  { icon: <FiLinkedin />, name: 'LinkedIn', url: 'https://linkedin.com', handle: '@skilltrack-ai' },
  { icon: <FiGithub />, name: 'GitHub', url: 'https://github.com', handle: 'skilltrack-ai' },
  { icon: <FiTwitter />, name: 'Twitter/X', url: 'https://twitter.com', handle: '@SkillTrackAI' },
  { icon: <FiInstagram />, name: 'Instagram', url: 'https://instagram.com', handle: '@skilltrack.ai' },
  { icon: <FiYoutube />, name: 'YouTube', url: 'https://youtube.com', handle: 'SkillTrack AI Channel' },
];

const CONTACT_FAQS = [
  {
    cat: 'Accounts',
    q: 'How do I create and manage my candidate or recruiter account?',
    a: 'You can create an account in 60 seconds using your email or 1-click Google authentication. Role switching is available from your portal settings.',
  },
  {
    cat: 'Recruitment',
    q: 'How does AI candidate screening work for recruiters?',
    a: 'Recruiters upload job descriptions and filter criteria. Our NLP models parse and rank candidate resumes by verified skill match and mock interview scores.',
  },
  {
    cat: 'Resume Analysis',
    q: 'What file formats are supported for AI Resume Analysis?',
    a: 'We support PDF, DOCX, and TXT files up to 10MB in size. Our parser extracts text, skills, bullet metrics, and section headers automatically.',
  },
  {
    cat: 'Mock Interviews',
    q: 'Can I practice voice mock interviews on mobile devices?',
    a: 'Yes, our mock interview simulator works seamlessly across mobile, tablet, and desktop web browsers with microphone access.',
  },
  {
    cat: 'Subscriptions',
    q: 'How do I upgrade or request an enterprise custom quote?',
    a: 'Visit our Pricing page to select Student Pro or Recruiter Pro, or fill out the contact form below for custom enterprise licensing.',
  },
  {
    cat: 'Technical Support',
    q: 'What should I do if I encounter an issue during a mock interview?',
    a: 'Our technical support team is available 24/7 via email at support@skilltrack.ai or through the priority chat widget in your dashboard.',
  },
];

export const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    toast.success('Thank you! Your message has been sent to the SkillTrack AI team.');
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-page-wrapper">
      {/* 1. Hero */}
      <section className="section-padding contact-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-header text-center"
          >
            <span className="badge-ai"><HiSparkles /> We're Here to Help</span>
            <h1 className="section-title mt-2">
              Contact <span className="text-gradient-primary">SkillTrack AI</span>
            </h1>
            <p className="section-subtitle">
              Have questions about enterprise recruiter plans, candidate API integration, or career coaching? Get in touch today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Contact Information Cards */}
      <section className="section-padding bg-subtle-glow" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-cards-grid">
            {CONTACT_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="glass-card contact-info-card-m8"
              >
                <div className="contact-card-icon" style={{ background: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </div>
                <h3 className="contact-card-title">{card.title}</h3>
                <p className="contact-card-desc">{card.desc}</p>
                <div className="contact-card-val">{card.value}</div>
                {card.actionHref && (
                  <a href={card.actionHref} className="contact-card-link">
                    {card.actionText} →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Form & Office Map Layout */}
      <section className="section-padding">
        <div className="container">
          <div className="contact-main-grid">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card contact-form-card"
            >
              <h2 className="contact-form-heading">Send Us a Message</h2>
              <p className="contact-form-subtext">Fill out the details below and our team will respond within 2–4 hours.</p>

              {submitted ? (
                <div className="form-success-box text-center">
                  <FiCheckCircle style={{ fontSize: '3.5rem', color: 'var(--color-success)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent Successfully!</h3>
                  <p style={{ color: 'var(--color-muted)', margin: 0 }}>Thank you for reaching out. A representative will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="contact-form">
                  <div className="form-row-2">
                    <div className="form-group-m8">
                      <label className="form-label" htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="input-glass"
                        required
                      />
                    </div>
                    <div className="form-group-m8">
                      <label className="form-label" htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@company.com"
                        className="input-glass"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group-m8">
                      <label className="form-label" htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="input-glass"
                      />
                    </div>
                    <div className="form-group-m8">
                      <label className="form-label" htmlFor="organization">Organization / University</label>
                      <input
                        id="organization"
                        type="text"
                        name="organization"
                        value={form.organization}
                        onChange={handleChange}
                        placeholder="TechCorp or Stanford University"
                        className="input-glass"
                      />
                    </div>
                  </div>

                  <div className="form-group-m8">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Enterprise Plan Inquiry, API Access, General Support..."
                      className="input-glass"
                    />
                  </div>

                  <div className="form-group-m8">
                    <label className="form-label" htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help your candidate prep or hiring pipeline?"
                      className="input-glass"
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                    <FiSend /> Submit Inquiry
                  </button>
                </form>
              )}
            </motion.div>

            {/* Office Location & Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="contact-map-col"
            >
              <div className="glass-card office-info-box">
                <h3 className="office-info-title">Headquarters</h3>
                <p className="office-address">
                  <FiMapPin className="text-primary" /> 500 Rail Street, Suite 400<br />
                  Hyderabad, CA 94105, INDIA
                </p>
                <p className="office-notes">
                  Our team operates globally with hubs in Hyderabad, Chennai, Banglore.
                </p>
              </div>

              {/* Office Map Component Placeholder */}
              <OfficeMap />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) */}
      <section className="section-padding bg-subtle-glow">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header text-center">
            <span className="badge-ai"><FiHelpCircle /> FAQs</span>
            <h2 className="section-title">Common <span className="text-gradient-primary">Questions</span></h2>
            <p className="section-subtitle">Answers regarding accounts, recruitment, resume scoring, subscriptions, and technical support.</p>
          </div>

          <div className="contact-faqs-list mt-4">
            {CONTACT_FAQS.map((faq, i) => (
              <div key={i} className="glass-card contact-faq-item">
                <button
  type="button"
  className="contact-faq-btn"
  onClick={() => setOpenFaq(openFaq === i ? null : i)}
  aria-expanded={openFaq === i}
>
  <span
    className="badge-glass"
    style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginRight: '0.5rem' }}
  >
    {faq.cat}
  </span>
  <span className="contact-faq-q">{faq.q}</span>
  <FiChevronDown className={`faq-chevron ${openFaq === i ? 'open' : ''}`} />
</button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="contact-faq-a"
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Social Media */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Connect With Us <span className="text-gradient-primary">On Social</span></h2>
            <p className="section-subtitle">Follow SkillTrack AI for product updates, AI interview tips, and talent hiring news.</p>
          </div>

          <div className="social-grid mt-4">
            {SOCIAL_MEDIA.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="glass-card social-card"
              >
                <div className="social-card-icon">{s.icon}</div>
                <div className="social-card-name">{s.name}</div>
                <div className="social-card-handle">{s.handle}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="glass-card text-center" style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.06) 100%)' }}>
            <HiSparkles style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <h2 className="section-title">Still Have Questions?</h2>
            <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0.75rem auto 2rem' }}>
              Our dedicated support team and solutions architects are ready to help you succeed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:support@skilltrack.ai" className="btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
                <FiMail /> Contact Support
              </a>
              <Link to="/how-it-works" className="btn-secondary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
                <FiPlayCircle /> Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
