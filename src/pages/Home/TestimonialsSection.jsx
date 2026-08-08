import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const TESTIMONIALS = [
  {
    id: 'student-testimonial',
    roleType: 'Student',
    name: 'Alex Johnson',
    role: 'Full Stack Engineer at TechCorp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 5,
    quote:
      'The AI mock drills were a game changer for me. Getting instant voice feedback on my system design answers boosted my confidence and lifted my ATS score by 34 points before interviewing!',
  },
  {
    id: 'recruiter-testimonial',
    roleType: 'Recruiter',
    name: 'Sarah Jenkins',
    role: 'Lead Talent Partner at Scale AI',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    rating: 5,
    quote:
      'SkillTrack AI transformed our candidate screening pipeline. Being able to review verified skill scores and candidate drill recordings cut our time-to-hire from weeks down to days.',
  },
  {
    id: 'placement-testimonial',
    roleType: 'Placement Officer',
    name: 'Dr. Michael Chen',
    role: 'Director of Career Services at Stanford Tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5,
    quote:
      'We integrated SkillTrack AI across our graduating class. Over 98% of our computer science students landed technical offers within 90 days of graduation. Outstanding platform.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-subtle-glow" id="testimonials">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header text-center"
        >
          <span className="badge-ai"><HiSparkles /> Real Success Stories</span>
          <h2 className="section-title">
            Loved by <span className="text-gradient-primary">Candidates & Hiring Teams</span>
          </h2>
          <p className="section-subtitle">
            Hear from students, senior recruiters, and career placement directors using SkillTrack AI.
          </p>
        </motion.div>

        <div className="testimonials-grid mt-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card testimonial-card"
            >
              <div className="rating-stars mb-2">
                {[...Array(t.rating)].map((_, starIndex) => (
                  <FiStar key={starIndex} style={{ fill: '#F59E0B' }} />
                ))}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="reviewer-info">
                <img src={t.avatar} alt={t.name} className="reviewer-img" />
                <div>
                  <h4 className="reviewer-name">{t.name}</h4>
                  <p className="reviewer-role">
                    <span className="badge-glass" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginRight: '0.35rem' }}>
                      {t.roleType}
                    </span>
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
