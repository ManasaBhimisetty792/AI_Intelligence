import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiZap, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import PremiumBadge from './PremiumBadge';

export const UpgradeModal = ({ isOpen, onClose, featureName = 'Premium Feature' }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 15, 26, 0.82)',
          backdropFilter: 'blur(12px)',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 15, 26, 0.98))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '1.5rem',
            padding: '2.25rem',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.35)',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FiX style={{ fontSize: '1.2rem' }} />
          </button>

          <div style={{ marginBottom: '1rem', display: 'inline-block' }}>
            <PremiumBadge text="⚡ Upgrade Required" size="medium" />
          </div>

          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.5rem 0', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Unlock {featureName}
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: '0.5rem 0 1.5rem' }}>
            This feature is exclusive to <strong>SkillTrack AI Premium</strong> candidates. Upgrade today for full access to AI interview drills, career roadmaps, and priority recruiter matching.
          </p>

          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '1.1rem 1.4rem', marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              'Unlimited AI Mock Interviews & NLP Voice Analysis',
              'Full ATS Resume Compatibility Diagnostics',
              'AI Career Roadmap & Skill Gap Intelligence',
              'Priority Recruiter Visibility Badge',
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: idx === 3 ? 0 : '0.65rem' }}>
                <FiCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.4rem', borderRadius: '0.75rem' }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgradeClick}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Upgrade to Premium <FiArrowRight />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;
