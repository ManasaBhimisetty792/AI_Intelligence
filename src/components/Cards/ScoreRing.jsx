import React from 'react';
import { motion } from 'framer-motion';

/**
 * Circular ATS-score gauge — the product's signature visual motif.
 * Reused across Hero, Dashboard previews, and Interview report mocks.
 */
const ScoreRing = ({ score = 82, size = 180, label = 'ATS Score' }) => {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(79,70,229,0.12)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {score}%
        </span>
        <span style={{ fontSize: size * 0.075, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.03em' }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default ScoreRing;
