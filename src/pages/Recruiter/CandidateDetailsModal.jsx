import React, { useMemo } from 'react';
import {
  FiDownload,
  FiFileText,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiX,
} from 'react-icons/fi';

const profileBoxStyle = {
  background: '#f8fafc',
  padding: '0.85rem',
  borderRadius: '8px',
  color: '#334155',
  fontSize: '0.85rem',
};

const getValue = (...values) => {
  return values.find((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    return true;
  });
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getStatusStyles = (status) => {
  const normalizedStatus = String(status || 'pending').toLowerCase();

  if (normalizedStatus === 'accepted') {
    return {
      background: '#dcfce7',
      color: '#15803d',
    };
  }

  if (normalizedStatus === 'rejected') {
    return {
      background: '#fee2e2',
      color: '#dc2626',
    };
  }

  if (normalizedStatus === 'reschedule_requested') {
    return {
      background: '#eef2ff',
      color: '#4f46e5',
    };
  }

  return {
    background: '#fef3c7',
    color: '#b45309',
  };
};

const CandidateDetailsModal = ({
  candidate = null,
  request = null,
  resumeUrl = '',
  loading = false,
  onClose,
  onAccept,
  onReject,
  showActions = true,
}) => {
  const details = useMemo(() => {
    const candidateData = candidate || {};
    const requestData = request || {};

    const name =
      getValue(
        candidateData.full_name,
        candidateData.name,
        candidateData.candidate_name,
        candidateData.student_name,
        requestData.candidate_name,
        requestData.student_name,
        requestData.name
      ) || 'Candidate';

    const skills = normalizeSkills(
      getValue(
        candidateData.skills,
        candidateData.key_skills,
        candidateData.skill_set,
        requestData.skills
      )
    );

    return {
      name,

      email:
        getValue(
          candidateData.email,
          candidateData.email_address,
          candidateData.candidate_email,
          requestData.candidate_email,
          requestData.email
        ) || 'N/A',

      phone:
        getValue(
          candidateData.phone,
          candidateData.phone_number,
          candidateData.mobile,
          candidateData.mobile_number,
          requestData.phone
        ) || 'N/A',

      location:
        getValue(
          candidateData.location,
          candidateData.city,
          candidateData.loc,
          requestData.location,
          requestData.loc
        ) || 'N/A',

      role:
        getValue(
          candidateData.role,
          candidateData.job_title,
          candidateData.position,
          requestData.role,
          requestData.interview_type
        ) || 'N/A',

      experience:
        getValue(
          candidateData.experience,
          candidateData.years_of_experience,
          candidateData.exp,
          requestData.experience,
          requestData.exp
        ) || 'N/A',

      avatar:
        getValue(
          candidateData.avatar_url,
          candidateData.profile_image,
          candidateData.profile_image_url,
          candidateData.img,
          requestData.candidate_avatar,
          requestData.avatar_url
        ) || '',

      skills,

      atsScore: getValue(
        candidateData.ats_score,
        candidateData.ats,
        requestData.ats_score,
        requestData.ats
      ),

      appliedDate: getValue(
        candidateData.applied_date,
        candidateData.created_at,
        requestData.created_at
      ),

      interviewStatus:
        getValue(
          requestData.status,
          candidateData.interview_status,
          candidateData.status
        ) || 'pending',

      message: getValue(
        requestData.message,
        candidateData.message,
        candidateData.candidate_note
      ),

      githubUrl: getValue(
        candidateData.github_url,
        candidateData.github,
        candidateData.github_link
      ),

      linkedinUrl: getValue(
        candidateData.linkedin_url,
        candidateData.linkedin,
        candidateData.linkedin_link
      ),

      portfolioUrl: getValue(
        candidateData.portfolio_url,
        candidateData.portfolio,
        candidateData.website
      ),
    };
  }, [candidate, request]);

  const avatarUrl =
    details.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      details.name
    )}&background=4f46e5&color=fff&size=128`;

  const statusStyles = getStatusStyles(details.interviewStatus);

  const isPending =
    details.interviewStatus === 'pending' ||
    details.interviewStatus === 'requested';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-details-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 21, 51, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem',
          background: '#ffffff',
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <h3
            id="candidate-details-title"
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            Candidate Profile & Resume
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate details"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.3rem',
              color: '#475569',
            }}
          >
            <FiX />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <FiLoader
              className="spin-animation"
              size={30}
              style={{ color: '#4f46e5' }}
            />

            <div style={{ marginTop: '0.75rem', fontWeight: 700 }}>
              Loading candidate profile...
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <img
                src={avatarUrl}
                alt={`${details.name} profile`}
                onError={(event) => {
                  event.currentTarget.src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      details.name
                    )}&background=4f46e5&color=fff&size=128`;
                }}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #4f46e5',
                  marginBottom: '0.5rem',
                }}
              />

              <h4
                style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                {details.name}
              </h4>

              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.88rem',
                  marginTop: '0.25rem',
                }}
              >
                {details.role} • {details.experience}
              </div>

              <div
                style={{
                  display: 'inline-block',
                  marginTop: '0.6rem',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: statusStyles.background,
                  color: statusStyles.color,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                Status:{' '}
                {String(details.interviewStatus).replaceAll('_', ' ')}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div style={profileBoxStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                  }}
                >
                  <FiMail /> Email
                </div>

                <div>{details.email}</div>
              </div>

              <div style={profileBoxStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                  }}
                >
                  <FiPhone /> Phone
                </div>

                <div>{details.phone}</div>
              </div>

              <div style={profileBoxStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                  }}
                >
                  <FiMapPin /> Location
                </div>

                <div>{details.location}</div>
              </div>

              <div style={profileBoxStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                  }}
                >
                  <FiUser /> Experience
                </div>

                <div>{details.experience}</div>
              </div>
            </div>

            <div style={{ ...profileBoxStyle, marginTop: '0.75rem' }}>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: '0.35rem',
                }}
              >
                ATS Score
              </div>

              <div
                style={{
                  color:
                    Number(details.atsScore) >= 85
                      ? '#149174'
                      : '#d97706',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                }}
              >
                {details.atsScore ?? 'N/A'}
                {details.atsScore !== null &&
                details.atsScore !== undefined &&
                details.atsScore !== ''
                  ? '%'
                  : ''}
              </div>
            </div>

            <div style={{ ...profileBoxStyle, marginTop: '0.75rem' }}>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                Skills & Expertise
              </div>

              {details.skills.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                  }}
                >
                  {details.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="badge-glass"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#64748b' }}>
                  No skills available.
                </span>
              )}
            </div>

            {details.message && (
              <div
                style={{
                  ...profileBoxStyle,
                  marginTop: '0.75rem',
                  borderLeft: '3px solid #4f46e5',
                  fontStyle: 'italic',
                }}
              >
                <strong>Candidate Note:</strong>

                <div style={{ marginTop: '0.3rem' }}>
                  “{details.message}”
                </div>
              </div>
            )}

            <div style={{ ...profileBoxStyle, marginTop: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                  }}
                >
                  <FiFileText /> Candidate Resume
                </div>

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <FiDownload /> Open Resume
                  </a>
                )}
              </div>

              {resumeUrl ? (
                <iframe
                  src={resumeUrl}
                  title={`${details.name} Resume`}
                  style={{
                    width: '100%',
                    height: 460,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    background: '#ffffff',
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: '1rem',
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 8,
                    color: '#64748b',
                  }}
                >
                  No resume URL is available for this candidate.
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '0.75rem',
              }}
            >
              {details.githubUrl && (
                <a
                  href={details.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FiGithub /> GitHub
                </a>
              )}

              {details.linkedinUrl && (
                <a
                  href={details.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FiLinkedin /> LinkedIn
                </a>
              )}

              {details.portfolioUrl && (
                <a
                  href={details.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FiGlobe /> Portfolio
                </a>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Close
              </button>

              {showActions && isPending && onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="btn btn-outline"
                  style={{
                    color: '#ef4444',
                    borderColor: '#fecaca',
                  }}
                >
                  Reject / Reschedule
                </button>
              )}

              {showActions && isPending && onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="btn btn-primary"
                  style={{
                    background:
                      'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  }}
                >
                  Accept & Schedule Interview
                </button>
              )}
            </div>

            {details.appliedDate && (
              <div
                style={{
                  textAlign: 'right',
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  marginTop: '0.75rem',
                }}
              >
                Applied: {formatDate(details.appliedDate)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailsModal;