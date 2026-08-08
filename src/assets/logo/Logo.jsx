import React from 'react';

/**
 * SkillTrack AI brand mark.
 * Concept: a document silhouette (resume) whose top folds into a
 * neural/brain node cluster, with a growth arrow cutting through —
 * "your resume, made intelligent, trending up."
 */
const Logo = ({ size = 36, withWordmark = true, className = '' }) => (
  <div className={`logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#logoGrad)" />
      {/* document */}
      <path d="M15 12h12l6 6v18a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z" fill="white" fillOpacity="0.92" />
      <path d="M27 12v6h6" stroke="#4F46E5" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* text lines */}
      <rect x="17" y="24" width="10" height="1.6" rx="0.8" fill="#4F46E5" fillOpacity="0.45" />
      <rect x="17" y="28" width="14" height="1.6" rx="0.8" fill="#4F46E5" fillOpacity="0.30" />
      {/* growth arrow + node */}
      <path d="M16 22.5 21 17.5 25 20.5 32 12" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="12" r="2.4" fill="#06B6D4" />
      <circle cx="16" cy="22.5" r="1.6" fill="#4F46E5" />
      <circle cx="21" cy="17.5" r="1.6" fill="#4F46E5" />
      <circle cx="25" cy="20.5" r="1.6" fill="#4F46E5" />
    </svg>
    {withWordmark && (
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.5,
        letterSpacing: '-0.01em',
        color: 'var(--text-primary)'
      }}>
        SkillTrack <span className="text-gradient">AI</span>
      </span>
    )}
  </div>
);

export default Logo;
