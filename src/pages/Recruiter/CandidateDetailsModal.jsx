import React, { useEffect, useMemo, useState } from 'react';
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
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiCheck,
  FiBriefcase,
  FiAward,
  FiSliders,
  FiLayers,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

const profileBoxStyle = {
  background: '#f8fafc',
  padding: '0.85rem 1rem',
  borderRadius: '10px',
  color: '#334155',
  fontSize: '0.85rem',
  border: '1px solid #e2e8f0',
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

  if (normalizedStatus === 'accepted' || normalizedStatus === 'reschedule_accepted') {
    return {
      background: '#dcfce7',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    };
  }

  if (normalizedStatus === 'rejected') {
    return {
      background: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fecaca',
    };
  }

  if (normalizedStatus === 'reschedule_requested') {
    return {
      background: '#eef2ff',
      color: '#4f46e5',
      border: '1px solid #c7d2fe',
    };
  }

  return {
    background: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
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
  onReschedule,
  showActions = true,
}) => {
  const studentId =
    candidate?.id ||
    candidate?.user_id ||
    request?.student_id ||
    request?.candidate_id;

  const [fetchedScore, setFetchedScore] = useState(null);
  const [fetchingScore, setFetchingScore] = useState(false);
  const [fetchedEmail, setFetchedEmail] = useState('');
  const [fetchedName, setFetchedName] = useState('');

  // Fetch student's latest resume analysis score and profile email from Supabase
  useEffect(() => {
    if (studentId && isSupabaseConfigured() && supabase) {
      let isMounted = true;
      (async () => {
        try {
          // 1. Fetch base profile for email and name
          const { data: profData } = await supabase
            .from('profiles')
            .select('email, name')
            .eq('id', studentId)
            .maybeSingle();

          if (profData && isMounted) {
            if (profData.email) setFetchedEmail(profData.email);
            if (profData.name) setFetchedName(profData.name);
          }

          // 2. Fetch analysis score if not already provided
          if (!request?.analysis_score) {
            setFetchingScore(true);
            const { data: scoreData } = await supabase
              .from('resume_analysis_scores')
              .select('*')
              .eq('student_id', studentId)
              .order('analyzed_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (scoreData && isMounted) {
              setFetchedScore(scoreData);
              if (scoreData.candidate_email && !profData?.email) {
                setFetchedEmail(scoreData.candidate_email);
              }
              if (scoreData.candidate_name && !profData?.name) {
                setFetchedName(scoreData.candidate_name);
              }
            }
          }
        } catch (err) {
          console.warn('Could not fetch student details in modal:', err);
        } finally {
          if (isMounted) setFetchingScore(false);
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [studentId, request?.analysis_score]);

  const details = useMemo(() => {
    const candidateData = candidate || {};
    const requestData = request || {};
    const activeScore = fetchedScore || requestData.analysis_score || null;

    const name =
      getValue(
        candidateData.full_name,
        candidateData.name,
        candidateData.candidate_name,
        candidateData.student_name,
        requestData.candidate_name,
        requestData.student_name,
        requestData.name,
        fetchedName,
        activeScore?.candidate_name
      ) || 'Candidate';

    const skills = normalizeSkills(
      getValue(
        candidateData.skills,
        candidateData.key_skills,
        candidateData.skill_set,
        requestData.skills
      )
    );

    // Job description can come from analysis score or request message
    const jobDescription =
      getValue(
        activeScore?.jd_text,
        requestData.message,
        candidateData.message,
        candidateData.candidate_note
      ) || '';

    const jdFileName = activeScore?.jd_file_name || '';

    const email =
      getValue(
        candidateData.email,
        candidateData.email_address,
        candidateData.candidate_email,
        requestData.student_email,
        requestData.candidate_email,
        requestData.email,
        fetchedEmail,
        activeScore?.candidate_email
      ) || 'Email not specified';

    return {
      name,
      email,

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
        ) || 'Remote',

      role:
        getValue(
          candidateData.role,
          candidateData.job_title,
          candidateData.position,
          requestData.role,
          requestData.interview_type
        ) || 'Technical Interview',

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

      overallScore: activeScore?.overall_score ?? requestData.ats_score ?? candidateData.ats_score ?? null,
      jobMatchScore: activeScore?.job_match_score ?? null,
      completenessScore: activeScore?.completeness_score ?? null,
      structureScore: activeScore?.structure_score ?? null,
      interviewReadiness: activeScore?.interview_readiness ?? null,
      analyzedAt: activeScore?.analyzed_at ?? null,

      jobDescription,
      jdFileName,

      appliedDate: getValue(
        requestData.created_at,
        candidateData.applied_date,
        candidateData.created_at
      ),

      preferredDatetime: requestData.preferred_datetime || null,

      interviewStatus:
        getValue(
          requestData.status,
          candidateData.interview_status,
          candidateData.status
        ) || 'pending',

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
  }, [candidate, request, fetchedScore]);

  const avatarUrl =
    details.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      details.name
    )}&background=4f46e5&color=fff&size=128`;

  const statusStyles = getStatusStyles(details.interviewStatus);

  const isPending =
    details.interviewStatus === 'pending' ||
    details.interviewStatus === 'requested';

  const hasScores = details.overallScore !== null && details.overallScore !== undefined;
  const isScorePassing = Number(details.overallScore) >= 75;

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
        background: 'rgba(11, 21, 51, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem 2rem',
          background: '#ffffff',
          borderRadius: 18,
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem', color: '#4f46e5', display: 'flex' }}>
              <HiSparkles />
            </span>
            <h3
              id="candidate-details-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              Candidate Profile & Interview Assessment
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate details"
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#475569',
              transition: 'background 0.2s',
            }}
          >
            <FiX />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <FiLoader
              className="spin-animation"
              size={36}
              style={{ color: '#4f46e5' }}
            />
            <div style={{ marginTop: '0.85rem', fontWeight: 700 }}>
              Loading candidate profile...
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Candidate Profile Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 260 }}>
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
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #4f46e5',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: statusStyles.background,
                        color: statusStyles.color,
                        border: statusStyles.border,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                      }}
                    >
                      {String(details.interviewStatus).replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div
                    style={{
                      color: '#475569',
                      fontSize: '0.86rem',
                      marginTop: '0.2rem',
                      fontWeight: 600,
                    }}
                  >
                    {details.role} • {details.experience}
                  </div>

                  {details.appliedDate && (
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Requested on: {formatDate(details.appliedDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Social / Portfolio Links */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {details.githubUrl && (
                  <a
                    href={details.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.4rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
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
                      fontSize: '0.78rem',
                      padding: '0.4rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
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
                      fontSize: '0.78rem',
                      padding: '0.4rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
                    }}
                  >
                    <FiGlobe /> Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Candidate Contact Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div style={profileBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem', color: '#64748b' }}>
                  <FiMail style={{ color: '#4f46e5' }} /> Email
                </div>
                <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{details.email}</div>
              </div>

              <div style={profileBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem', color: '#64748b' }}>
                  <FiMapPin style={{ color: '#4f46e5' }} /> Location
                </div>
                <div style={{ fontWeight: 600 }}>{details.location}</div>
              </div>
            </div>

            {/* ── SECTION: RESUME ANALYSIS & READINESS SCORES ── */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiAward style={{ color: '#4f46e5', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    Resume Readiness & ATS Analysis Scores
                  </span>
                </div>

                {details.analyzedAt && (
                  <span style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    Analysed on {new Date(details.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {fetchingScore ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  <FiLoader className="spin-animation" style={{ marginRight: '0.5rem' }} /> Loading score analysis...
                </div>
              ) : hasScores ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {/* Overall Score */}
                  <div
                    style={{
                      background: isScorePassing ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1.5px solid ${isScorePassing ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                      borderRadius: '10px',
                      padding: '1rem 0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isScorePassing ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                      {details.overallScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginTop: '0.35rem' }}>
                      Overall Score
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isScorePassing ? '#059669' : '#dc2626', marginTop: '0.2rem', fontWeight: 700 }}>
                      {isScorePassing ? '✓ Threshold Passed (≥75%)' : '⚠ Below Threshold'}
                    </div>
                  </div>

                  {/* Job Match */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem 0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      {details.jobMatchScore !== null ? `${details.jobMatchScore}%` : '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginTop: '0.35rem' }}>
                      Job Match
                    </div>
                  </div>

                  {/* Completeness */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem 0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      {details.completenessScore !== null ? `${details.completenessScore}%` : '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginTop: '0.35rem' }}>
                      Completeness
                    </div>
                  </div>

                  {/* Structure */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem 0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      {details.structureScore !== null ? `${details.structureScore}%` : '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginTop: '0.35rem' }}>
                      Structure
                    </div>
                  </div>

                  {/* Readiness Level */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem 0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5', lineHeight: 1.3 }}>
                      {details.interviewReadiness || 'Ready'}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginTop: '0.35rem' }}>
                      Readiness Level
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                  No resume analysis recorded yet for this student.
                </div>
              )}
            </div>

            {/* ── SECTION: TARGET JOB DESCRIPTION ── */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiBriefcase style={{ color: '#4f46e5', fontSize: '1.15rem' }} />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    Target Job Description (JD)
                  </span>
                </div>

                {details.jdFileName && (
                  <span style={{ fontSize: '0.75rem', color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                    Uploaded Document: {details.jdFileName}
                  </span>
                )}
              </div>

              {details.jobDescription ? (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    fontSize: '0.84rem',
                    color: '#1e293b',
                    lineHeight: 1.6,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {details.jobDescription}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 8,
                    color: '#64748b',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                  }}
                >
                  {details.jdFileName
                    ? `Job description provided via file: ${details.jdFileName}`
                    : 'No specific job description text was provided with this interview request.'}
                </div>
              )}
            </div>

            {/* Skills & Expertise */}
            <div style={profileBoxStyle}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
                <FiLayers style={{ color: '#4f46e5' }} /> Skills & Expertise
              </div>

              {details.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {details.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="badge-glass"
                      style={{ fontSize: '0.78rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: 6 }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#64748b' }}>No skills listed.</span>
              )}
            </div>

            {/* Modal Action Buttons Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginTop: '0.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
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
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    padding: '0.6rem 1.1rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FiX /> Decline Request
                </button>
              )}

              {showActions && isPending && onReschedule && (
                <button
                  type="button"
                  onClick={onReschedule}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.6rem 1.1rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FiClock /> Reschedule
                </button>
              )}

              {showActions && isPending && onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <FiCheck /> Accept & Schedule Interview
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailsModal;