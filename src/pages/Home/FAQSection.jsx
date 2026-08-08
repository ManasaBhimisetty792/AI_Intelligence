import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

const faqs = [
  {
    q: 'How does the AI evaluate my mock interview answers?',
    a: 'SkillTrack AI utilizes proprietary Large Language Models trained on thousands of technical interview rubrics. It evaluates technical correctness, problem-solving structure, speech articulation, and edge-case awareness.',
  },
  {
    q: 'How does Supabase Authentication & Google OAuth work?',
    a: 'We use enterprise-grade Supabase Auth supporting OAuth 2.0 PKCE flow. You can sign in instantly with Google, GitHub, or email/password with secure session persistence and Row Level Security.',
  },
  {
    q: 'Can recruiters verify the authenticity of my skill score?',
    a: 'Yes! Every completed assessment generates a cryptographically signed score breakdown link that recruiters can inspect directly on your profile.',
  },
  {
    q: 'What is the difference between Student and Recruiter portals?',
    a: 'The Student portal focuses on resume building, ATS scoring, and AI interview drills. The Recruiter portal provides multi-candidate search, ATS screening automation, job posting management, and team analytics.',
  },
  {
    q: 'Is there a free tier available for candidates?',
    a: 'Absolutely. Every candidate gets 3 free AI mock interview sessions and complete ATS resume parsing without entering a credit card.',
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-padding">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="section-header text-center">
          <span className="badge-glass"><FiHelpCircle /> Got Questions?</span>
          <h2 className="section-title mt-2">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
        </div>

        <div className="faq-list mt-5">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card faq-item mb-3">
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="faq-question-btn"
              >
                <span className="faq-question-text">{faq.q}</span>
                <FiChevronDown className={`faq-chevron ${openIndex === index ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="faq-answer-container"
                  >
                    <p className="faq-answer-text">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
