import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { FiCheckCircle, FiAlertTriangle, FiAward, FiTrendingUp } from 'react-icons/fi';

/**
 * OverallScoreChart
 * =================
 * Displays the overall resume score as a responsive donut chart with premium UI colors.
 *
 * Props:
 *   score  – raw score value (number | string | null | undefined)
 *            Safely clamped to [0, 100]. Defaults to 0.
 */
export default function OverallScoreChart({ score: rawScore }) {
  // Safe parse + clamp: handles null, undefined, NaN, negative, >100
  const score = Math.min(100, Math.max(0, Number(rawScore) || 0));
  const remaining = 100 - score;
  const isQualified = score >= 75;
  const roundedScore = Math.round(score);

  const scoreData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: remaining },
  ];

  const scoreColor = isQualified
    ? '#10b981' // Emerald
    : '#f59e0b'; // Amber / Warm Gold

  const tooltipContent = ({ active }) => {
    if (!active) return null;
    return (
      <div className="overall-score-tooltip">
        <strong>{roundedScore}%</strong> Overall Score
        <br />
        <span>Requirement: 75% for next stage</span>
      </div>
    );
  };

  return (
    <div
      className={`overall-score-card ${isQualified ? 'qualified' : 'needs-improvement'}`}
      role="region"
      aria-label={`Overall Resume Score: ${roundedScore} percent`}
    >
      {/* Donut chart with centered label and SVG gradients */}
      <div className="overall-score-chart-wrapper">
        <div
          className="overall-score-chart"
          aria-hidden="true"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Vibrant Emerald Gradient for Passing Score */}
                <linearGradient id="scoreEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Vibrant Amber / Orange Gradient for Under Threshold */}
                <linearGradient id="scoreAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Remaining background segment */}
                <linearGradient id="scoreRemainingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)" />
                  <stop offset="100%" stopColor="rgba(148, 163, 184, 0.08)" />
                </linearGradient>
              </defs>

              <Pie
                data={scoreData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="84%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={score > 0 && score < 100 ? 3 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill={isQualified ? 'url(#scoreEmeraldGrad)' : 'url(#scoreAmberGrad)'} />
                <Cell fill="url(#scoreRemainingGrad)" />
              </Pie>
              <Tooltip content={tooltipContent} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered percentage label */}
          <div className="overall-score-chart-center">
            <strong
              style={{
                color: scoreColor,
                textShadow: isQualified
                  ? '0 0 16px rgba(16, 185, 129, 0.35)'
                  : '0 0 16px rgba(245, 158, 11, 0.35)',
              }}
            >
              {roundedScore}%
            </strong>
            <span className="score-center-sub">Resume Score</span>
          </div>
        </div>
      </div>

      {/* Score details */}
      <div className="overall-score-content">
        <div className="overall-score-header-line">
          <h2 className="overall-score-title">
            <FiAward style={{ color: scoreColor, fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '6px' }} />
            Overall Resume Score
          </h2>

          <div
            className={`overall-score-badge ${isQualified ? 'badge-success-glow' : 'badge-warning-glow'}`}
          >
            {isQualified ? (
              <>
                <FiCheckCircle aria-hidden="true" />
                Ready for Next Step (≥ 75%)
              </>
            ) : (
              <>
                <FiAlertTriangle aria-hidden="true" />
                Needs Improvement (&lt; 75%)
              </>
            )}
          </div>
        </div>

        <p className="overall-score-description">
          {isQualified
            ? 'Excellent! Your resume surpasses the 75% target threshold and is competitive for applicant screening.'
            : 'Your resume is currently below the 75% target threshold. Follow the section recommendations below to boost your score.'}
        </p>

        {/* Threshold indicator bar */}
        <div className="overall-score-threshold">
          <div className="threshold-track">
            <div
              className="threshold-fill"
              style={{
                width: `${roundedScore}%`,
                background: isQualified
                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #fbbf24 0%, #ea580c 100%)',
                boxShadow: isQualified
                  ? '0 0 10px rgba(16, 185, 129, 0.5)'
                  : '0 0 10px rgba(245, 158, 11, 0.5)',
              }}
            />
            <div className="threshold-marker" title="75% minimum threshold" />
          </div>
          <div className="threshold-labels">
            <span>0%</span>
            <span className="threshold-target-badge">
              <FiTrendingUp style={{ marginRight: '3px' }} />
              75% Target Threshold
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Screen-reader accessible text */}
        <span className="sr-only">
          Overall Resume Score: {roundedScore} percent.{' '}
          {isQualified
            ? 'Ready for the next step.'
            : 'Needs improvement to meet the 75 percent threshold.'}
        </span>
      </div>
    </div>
  );
}
