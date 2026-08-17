import React from 'react';
import { calculateJobMatchBreakdown } from './resumeDisplayUtils';
import {
  FiCheckCircle,
  FiHelpCircle,
  FiInfo,
  FiSliders,
  FiCheckSquare,
  FiTarget,
  FiLayers,
  FiUserCheck,
  FiCode,
  FiBriefcase,
  FiBookOpen,
  FiFolder,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import OverallScoreChart from './OverallScoreChart';

/**
 * Small metric card with accent borders and colored icons.
 */
function MetricCard({ value, label, icon: Icon, color = 'var(--color-primary)', bgLight = 'var(--color-primary-light)', isText = false }) {
  return (
    <div
      className="metric-card"
      style={{
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
        {Icon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: bgLight,
              color: color,
              fontSize: '0.85rem',
            }}
          >
            <Icon />
          </span>
        )}
        <div className={`value${isText ? ' text-sm' : ''}`} style={{ color: isText ? color : 'var(--color-text)' }}>
          {value}
        </div>
      </div>

      <div className="label">
        {label}
      </div>
    </div>
  );
}

/**
 * Converts a value into a safe numeric score.
 */
function safeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
}

const BREAKDOWN_ITEMS = [
  {
    key: 'skills',
    label: 'Skills',
    max: 35,
    weight: '35%',
    icon: FiCode,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    key: 'experience',
    label: 'Experience',
    max: 20,
    weight: '20%',
    icon: FiBriefcase,
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.12)',
  },
  {
    key: 'education',
    label: 'Education',
    max: 10,
    weight: '10%',
    icon: FiBookOpen,
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.12)',
  },
  {
    key: 'semantic',
    label: 'Semantic Match',
    max: 20,
    weight: '20%',
    icon: FiTarget,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  {
    key: 'project_quality',
    label: 'Project Quality',
    max: 15,
    weight: '15%',
    icon: FiFolder,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
];

/**
 * Horizontal progress lines for Job Match Score Breakdown.
 */
function JobMatchHorizontalBreakdown({ breakdown }) {
  const totalScore = BREAKDOWN_ITEMS.reduce(
    (total, item) => total + safeNumber(breakdown?.[item.key]),
    0
  );

  return (
    <div
      className="job-match-breakdown-card"
      style={{
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl, 14px)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-muted)' }}>
          Weighted Component Breakdown
        </span>
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            background: 'var(--color-primary-light, rgba(5, 150, 105, 0.12))',
            padding: '3px 10px',
            borderRadius: 'var(--radius-md, 6px)',
          }}
        >
          {totalScore.toFixed(1)} / 100 pts
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {BREAKDOWN_ITEMS.map(({ key, label, max, weight, icon: Icon, color, bg }) => {
          const val = safeNumber(breakdown?.[key]);
          const pct = Math.min(100, Math.max(0, Math.round((val / max) * 100)));

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: bg,
                      color: color,
                      fontSize: '0.75rem',
                    }}
                  >
                    <Icon />
                  </span>
                  <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{label}</strong>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>({weight})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.825rem' }}>
                    {val.toFixed(1)} <span style={{ color: 'var(--color-muted)', fontWeight: 500, fontSize: '0.75rem' }}>/ {max} pts</span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: color,
                      minWidth: '32px',
                      textAlign: 'right',
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Small horizontal progress line */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--color-surface-sec, rgba(0, 0, 0, 0.06))',
                  borderRadius: '99px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '99px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Displays the explanation for each score factor.
 */
function ScoreExplanation({ explanation }) {
  const explanationEntries = Object.entries(explanation || {});

  if (!explanationEntries.length) {
    return (
      <p
        style={{
          margin: 0,
          color: 'var(--color-muted)',
          fontSize: '0.875rem',
        }}
      >
        No detailed explanation is available for this score.
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {explanationEntries.map(([key, item]) => {
        const explanationValue =
          typeof item === 'object' && item !== null
            ? item.value || item.description || JSON.stringify(item)
            : item;

        return (
          <div
            key={key}
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg, 10px)',
              fontSize: '0.85rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
            }}
          >
            <strong
              style={{
                textTransform: 'capitalize',
                color: 'var(--color-primary)',
                fontWeight: 700,
              }}
            >
              {key.replace(/_/g, ' ')}
            </strong>

            {' — '}

            <span>{explanationValue}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interview talking points.
 */
function InterviewTalkingPoints({ talkingPoints }) {
  if (!talkingPoints?.length) {
    return (
      <p
        style={{
          margin: 0,
          color: 'var(--color-muted)',
          fontSize: '0.875rem',
        }}
      >
        No interview talking points are available.
      </p>
    );
  }

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: '1.25rem',
        fontSize: '0.875rem',
        color: 'var(--color-text)',
        lineHeight: 1.7,
      }}
    >
      {talkingPoints.map((point, index) => (
        <li key={`${point}-${index}`}>
          {point}
        </li>
      ))}
    </ul>
  );
}

/**
 * Main scores section.
 */
export default function ScoreSection({ result }) {
  const overall = result?.overall_resume_score || {};
  const breakdown = calculateJobMatchBreakdown(result);

  if (!result || !breakdown) {
    return null;
  }

  const jobMatchScore = safeNumber(
    result.job_match_score ?? overall.job_match_score
  );

  const completenessScore = safeNumber(
    result.resume_completeness?.score ??
      overall.completeness_score
  );

  const structureScore = safeNumber(
    result.resume_structure?.score ??
      overall.structure_score
  );

  return (
    <>
      {/* ── KPI Metric Cards: Completeness, Structure, Job Match, Interview Readiness ── */}
      <div
        className="scores-row"
        style={{
          marginTop: '0.25rem',
        }}
      >
        <MetricCard
          value={`${Math.round(completenessScore)}%`}
          label="Resume Completeness"
          icon={FiCheckSquare}
          color="#10b981"
          bgLight="rgba(16, 185, 129, 0.12)"
        />

        <MetricCard
          value={`${Math.round(structureScore)}%`}
          label="Resume Structure"
          icon={FiLayers}
          color="#0284c7"
          bgLight="rgba(2, 132, 199, 0.12)"
        />

        <MetricCard
          value={`${Math.round(jobMatchScore)}%`}
          label="Job Match Score"
          icon={FiTarget}
          color="#059669"
          bgLight="rgba(5, 150, 105, 0.12)"
        />

        <MetricCard
          value={result.interview_readiness?.level || '—'}
          label="Interview Readiness"
          icon={FiUserCheck}
          color="#d97706"
          bgLight="rgba(217, 119, 6, 0.12)"
          isText
        />
      </div>

      {/* Overall score explanation & weights */}
      <div style={{ marginTop: '1rem' }}>
        <p
          className="small-note"
          style={{
            marginTop: 0,
            color: 'var(--color-muted)',
            lineHeight: 1.5,
          }}
        >
          The headline score synthesizes your Resume Completeness (25%), Structure (25%), and Job Match Score (50%) into an actionable ATS readiness indicator.
        </p>

        <ul
          style={{
            margin: '8px 0 0',
            paddingLeft: '1.2rem',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            lineHeight: 1.6,
          }}
        >
          <li>
            <strong>Resume Completeness:</strong> {Math.round(completenessScore)}% (25% weight)
          </li>

          <li>
            <strong>Resume Structure:</strong> {Math.round(structureScore)}% (25% weight)
          </li>

          <li>
            <strong>Job Match Score:</strong> {Math.round(jobMatchScore)}% (50% weight)
          </li>
        </ul>

        {(overall.feedback || []).map((feedback, index) => (
          <p
            key={`${feedback}-${index}`}
            style={{
              margin: '8px 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <FiCheckCircle style={{ flexShrink: 0 }} />
            {feedback}
          </p>
        ))}
      </div>

      {/* Interview readiness information */}
      <div className="readiness-info">
        <FiInfo
          style={{
            flexShrink: 0,
            marginTop: '3px',
            color: 'var(--color-primary)',
          }}
        />

        <span>
          {result.interview_readiness?.summary ||
            'Interview readiness assessment completed.'}
        </span>
      </div>

      {/* Job Match Score Breakdown - Horizontal progress lines */}
      <div className="section-title">
        <HiSparkles style={{ color: 'var(--color-primary)' }} />
        Job Match Score Breakdown
      </div>

      {/* Small horizontal lines breakdown */}
      <JobMatchHorizontalBreakdown breakdown={breakdown} />

      {/* Explanation included in this same section */}
      <div
        className="score-explanation"
        style={{
          marginTop: '1.5rem',
        }}
      >
        <div
          className="subsection-title"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.75rem',
            color: 'var(--color-text)',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          <FiHelpCircle style={{ color: 'var(--color-primary)' }} />
          Why You Got This Score
        </div>

        <ScoreExplanation
          explanation={result.explanation}
        />
      </div>
    </>
  );
}

/**
 * Walkthrough & Interview Talking Points section.
 */
export function ExplainabilitySection({ result }) {
  if (!result) {
    return null;
  }

  return (
    <>
      <div className="section-title" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <HiSparkles style={{ color: 'var(--color-warning)' }} />
        Walkthrough & Interview Talking Points
      </div>

      <InterviewTalkingPoints
        talkingPoints={result.interview_readiness?.talking_points}
      />
    </>
  );
}