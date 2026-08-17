import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function MatchMissingTab({
  matched = [],
  missing = [],
  feedback,
  matchedEmpty = 'No matches found.',
  missingEmpty = 'Nothing missing.',
}) {
  return (
    <div>
      <div className="subsection-title">
        <FiCheckCircle style={{ color: 'var(--color-success, #16a34a)', fontSize: '1rem' }} /> Matched Requirements
      </div>
      {(matched.length ? matched : [matchedEmpty]).map((item, i) => (
        <div
          key={`matched-${i}`}
          className={`match-card ${matched.length ? 'match-good' : 'match-neutral'}`}
        >
          <FiCheckCircle style={{ flexShrink: 0, marginTop: '3px' }} />
          <span>{item}</span>
        </div>
      ))}

      <hr className="tab-divider" />

      <div className="subsection-title">
        <FiAlertCircle style={{ color: 'var(--color-danger, #dc2626)', fontSize: '1rem' }} /> Missing Requirements
      </div>
      {(missing.length ? missing : [missingEmpty]).map((item, i) => (
        <div
          key={`missing-${i}`}
          className={`match-card ${missing.length ? 'match-bad' : 'match-good'}`}
        >
          {missing.length ? (
            <FiAlertCircle style={{ flexShrink: 0, marginTop: '3px' }} />
          ) : (
            <FiCheckCircle style={{ flexShrink: 0, marginTop: '3px' }} />
          )}
          <span>{item}</span>
        </div>
      ))}

      <hr className="tab-divider" />

      {feedback && (
        <div className="match-feedback">
          <FiInfo style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
