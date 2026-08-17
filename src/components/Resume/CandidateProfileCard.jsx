import React from 'react';
import SubsectionHeader from './SubsectionHeader';
import SkillsByCategory from './SkillsByCategory';
import StructuredSection from './StructuredSection';
import { FiBookOpen, FiBriefcase, FiFolder, FiAward, FiCpu, FiMail, FiPhone } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const PROFILE_SECTIONS = [
  {
    key: 'education',
    icon: FiBookOpen,
    label: 'Education',
    color: 'var(--color-accent, #0284c7)',
    bg: 'var(--color-accent-light, #e0f2fe)',
    empty: 'No education section clearly detected in this resume.',
  },
  {
    key: 'experience',
    icon: FiBriefcase,
    label: 'Experience',
    color: 'var(--color-secondary, #0d9488)',
    bg: 'var(--color-secondary-light, #ccfbf1)',
    empty: 'No experience section clearly detected in this resume.',
  },
  {
    key: 'projects',
    icon: FiFolder,
    label: 'Projects',
    color: 'var(--color-warning, #d97706)',
    bg: 'var(--color-warning-light, #fef3c7)',
    empty: 'No projects section clearly detected in this resume.',
  },
  {
    key: 'certifications',
    icon: FiAward,
    label: 'Certifications',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    empty: 'No certifications section clearly detected in this resume.',
  },
];

export default function CandidateProfileCard({ result }) {
  const c = result?.candidate || {};
  const sections = result?.sections || {};
  const name = c.name || 'Unknown Candidate';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  const experience = c.years_experience != null ? `${c.years_experience} yrs` : 'Not found';

  const stats = [
    { label: 'Experience', value: experience, border: 'var(--color-primary, #059669)' },
    { label: 'Highest Education', value: c.highest_education || 'Not specified', border: 'var(--color-secondary, #0d9488)' },
    { label: 'Email', value: c.email || 'Not found', border: 'var(--color-accent, #0284c7)' },
    { label: 'Phone', value: c.phone || 'Not found', border: 'var(--color-warning, #d97706)' },
  ];

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-2xl, 16px)',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'var(--color-primary-light, rgba(5, 150, 105, 0.15))',
              border: '2px solid var(--color-primary)',
              borderRadius: '50%',
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: 'var(--color-primary)',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{name}</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: 'var(--color-muted)' }}>Candidate Profile</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {stats.map(({ label, value, border }) => (
            <div key={label} style={{ borderLeft: `3px solid ${border}`, paddingLeft: '12px' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0 6px' }} />

      <SubsectionHeader icon={FiCpu} label="Skills" color="var(--color-primary, #059669)" />
      <SkillsByCategory skillsByCategory={result?.resume_skills_by_category} accentColor="var(--color-primary, #059669)" />

      {PROFILE_SECTIONS.map(({ key, icon, label, color, bg, empty }) => (
        <div key={key}>
          <SubsectionHeader icon={icon} label={label} color={color} />
          <StructuredSection
            content={sections[key]}
            emptyMessage={empty}
            accentColor={color}
            accentBg={bg}
          />
        </div>
      ))}
    </div>
  );
}
