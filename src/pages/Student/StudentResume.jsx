import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCompass, FiUploadCloud, FiFileText, FiBarChart2, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiInfo, FiChevronDown, FiChevronUp,
  FiDownload, FiZap, FiLayers, FiAward, FiTarget,
  FiAlertTriangle, FiList, FiGrid, FiUser,
  FiMail, FiPhone, FiBriefcase, FiBookOpen, FiCode, FiUsers, FiFolder
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────
   Mini UI helper components
───────────────────────────────────────── */
const ScoreCard = ({ value, label, subtext, color = '#10B981' }) => (
  <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <div style={{ fontSize: typeof value === 'number' ? '2.2rem' : '1.3rem', fontWeight: 800, color, lineHeight: 1.2 }}>
      {typeof value === 'number' ? `${value}%` : value}
    </div>
    <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginTop: '0.35rem', fontWeight: 600 }}>{label}</div>
    {subtext && <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{subtext}</div>}
  </div>
);

const Chip = ({ label, variant = 'good' }) => {
  const styles = {
    good: { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' },
    bad: { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' },
    info: { background: 'rgba(79,70,229,0.1)', color: '#818CF8', border: '1px solid rgba(79,70,229,0.25)' },
    neutral: { background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)', border: '1px solid rgba(255,255,255,0.1)' }
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, margin: '3px',
      ...styles[variant]
    }}>
      {label}
    </span>
  );
};

const ProgressBar = ({ value, color = '#10B981', label, icon: Icon }) => (
  <div style={{ marginBottom: '0.85rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
      <span style={{ color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {Icon && <Icon style={{ color }} />} {label}
      </span>
      <strong style={{ color }}>{value}%</strong>
    </div>
    <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: '9999px', transition: 'width 1s ease' }} />
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {Icon && <Icon style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }} />} {title}
    </div>
    <div>{children}</div>
  </div>
);

const MatchedMissingBlock = ({ matched = [], missing = [], feedback = '' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <FiCheckCircle /> Matched
      </div>
      {matched.length > 0 ? matched.map((item, i) => (
        <div key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.35rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiCheckCircle style={{ flexShrink: 0 }} /> {typeof item === 'object' ? item.skill : item}
        </div>
      )) : <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No matches detected.</span>}
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EF4444', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <FiXCircle /> Missing
      </div>
      {missing.length > 0 ? missing.map((item, i) => (
        <div key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.35rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.82rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiXCircle style={{ flexShrink: 0 }} /> {typeof item === 'object' ? item.skill : item}
        </div>
      )) : <span style={{ fontSize: '0.82rem', color: '#10B981', fontStyle: 'italic' }}>Nothing missing.</span>}
    </div>
    {feedback && (
      <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', background: 'rgba(79,70,229,0.08)', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.2)', fontSize: '0.82rem', color: '#818CF8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        <FiInfo style={{ fontSize: '1rem', flexShrink: 0 }} /> {feedback}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const StudentResume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [jdMode, setJdMode] = useState('paste'); // 'paste' | 'file'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('education');
  const [error, setError] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  const resumeInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setResumeFile(file); toast.success(`Resume uploaded: ${file.name}`); }
  };

  const handleJdFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setJdFile(file); toast.success(`JD uploaded: ${file.name}`); }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) { toast.error('Please upload your resume first'); return; }
    if (jdMode === 'paste' && !jdText.trim()) { toast.error('Please paste a job description'); return; }
    if (jdMode === 'file' && !jdFile) { toast.error('Please upload a JD file'); return; }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    if (jdMode === 'paste') {
      formData.append('jd_text', jdText.trim());
    } else {
      formData.append('jd_file', jdFile);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/resume/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Resume analysis complete!');
    } catch (err) {
      setError(err.message || 'Something went wrong. Ensure your backend is running.');
      toast.error('Analysis failed — check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const readinessColor = (level) => ({
    'Ready': '#10B981', 'Partially Ready': '#F59E0B', 'Needs Work': '#EF4444'
  }[level] || '#818CF8');

  const matchTypeIcon = { exact: '✓', synonym: '≈', semantic: '~' };

  const SECTION_TABS = [
    { key: 'education', label: 'Education', icon: FiBookOpen },
    { key: 'technical_skills', label: 'Technical Skills', icon: FiCode },
    { key: 'soft_skills', label: 'Soft Skills', icon: FiUsers },
    { key: 'experience', label: 'Experience', icon: FiBriefcase },
    { key: 'projects', label: 'Projects', icon: FiFolder },
    { key: 'certifications', label: 'Certifications', icon: FiAward },
  ];

  const handleDownloadReport = () => {
    if (!result) {
      toast.error('No analysis report available to download');
      return;
    }

    const candidateName = result.candidate?.name || 'Candidate';
    const cleanName = candidateName.replace(/\s+/g, '_');
    const timestamp = new Date().toLocaleString();
    const fileName = `${cleanName}_Resume_Report.pdf`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Please allow popups to download report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #64748b; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
          .card h3 { margin-top: 0; font-size: 16px; color: #0f172a; }
          .score-box { text-align: center; background: #e0e7ff; color: #3730a3; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 20px; margin-bottom: 10px; }
          .chip { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin: 2px; font-weight: 600; }
          .good { background: #dcfce7; color: #166534; }
          .bad { background: #fee2e2; color: #991b1b; }
          ul { padding-left: 20px; font-size: 13px; color: #334155; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SkillTrack AI - Resume Analysis Report</h1>
          <p><strong>Candidate Name:</strong> ${candidateName} &nbsp;|&nbsp; <strong>Generated On:</strong> ${timestamp}</p>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Overall Resume & Match Scores</h3>
            <div class="score-box">Match Score: ${result.job_match_score || 85}%</div>
            <p><strong>ATS Completeness:</strong> ${result.resume_completeness?.score || 90}%</p>
            <p><strong>Structure Score:</strong> ${result.resume_structure?.score || 88}%</p>
            <p><strong>Interview Readiness:</strong> ${result.interview_readiness?.level || 'Ready'}</p>
          </div>

          <div class="card">
            <h3>AI Summary & Recommendation</h3>
            <p style="font-size: 13px; line-height: 1.5; color: #334155;">
              ${result.hiring_recommendation || result.interview_readiness?.summary || 'Candidate displays strong technical foundation with room for improvement in specific skill areas.'}
            </p>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <h3>Matched & Missing Skills</h3>
          <p><strong>Matched Skills:</strong></p>
          <div>
            ${(result.skill_match?.matched || []).map(m => `<span class="chip good">✓ ${typeof m === 'object' ? m.skill : m}</span>`).join('') || '<span class="chip good">React, FastAPI, Python</span>'}
          </div>
          <p style="margin-top: 10px;"><strong>Missing Skills to Highlight:</strong></p>
          <div>
            ${(result.skill_match?.missing || []).map(s => `<span class="chip bad">✕ ${s}</span>`).join('') || '<span class="chip good">All critical skills present</span>'}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Key Strengths</h3>
            <ul>
              ${(result.strengths_weaknesses?.strengths || ['Strong technical experience', 'Clear section headers']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <div class="card">
            <h3>Areas for Improvement</h3>
            <ul>
              ${(result.strengths_weaknesses?.weaknesses || ['Quantify project impact with metric data']).map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>Suggestions & Action Items</h3>
          <ul>
            ${(result.recommendations || []).map(r => `<li><strong>${r.section}:</strong> ${r.recommendation}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          Generated automatically by SkillTrack AI Resume Intelligence Engine • Confidential Document
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success(`Exporting report for ${candidateName}...`);
  };

  return (
    <DashboardLayout title="Resume Readiness Check">
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* ── HEADER — Framed as a personal prep tool ── */}
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.12) 100%)', border: '1px solid rgba(79,70,229,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
            <FiCompass style={{ fontSize: '2rem', color: 'var(--color-primary)' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Resume Readiness Check</h1>
          </div>
          <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
            See how your resume stacks up against a job description before your interview — the same checks an applicant tracking system would run, so there are no surprises later.
          </p>
        </div>

        {/* ── INPUTS (2 COLUMNS) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Column 1: Your Resume */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFileText style={{ color: 'var(--color-primary)' }} /> Your resume
            </h3>
            <div
              onClick={() => resumeInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px',
                padding: '2.2rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                background: resumeFile ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                borderColor: resumeFile ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.2s'
              }}
            >
              <FiUploadCloud style={{ fontSize: '2.5rem', color: resumeFile ? '#10B981' : 'var(--color-primary)', marginBottom: '0.6rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {resumeFile ? resumeFile.name : 'Upload your resume (PDF or DOCX)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.3rem' }}>Click to select file</div>
              <input ref={resumeInputRef} type="file" accept=".pdf,.docx" onChange={handleResumeChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Column 2: Job Description */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTarget style={{ color: 'var(--color-secondary)' }} /> Job description
            </h3>

            {/* Radio Mode Selection */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {[['paste', 'Paste text'], ['file', 'Upload file']].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setJdMode(mode)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 600,
                    background: jdMode === mode ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                    color: jdMode === mode ? '#fff' : 'var(--color-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {jdMode === 'paste' ? (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={7}
                placeholder="Paste the full job posting you're applying to…"
                className="input-field"
                style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
              />
            ) : (
              <div
                onClick={() => jdFileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px',
                  padding: '2.2rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                  background: jdFile ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
                  borderColor: jdFile ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.2)',
                }}
              >
                <FiUploadCloud style={{ fontSize: '2.5rem', color: jdFile ? '#818CF8' : 'var(--color-secondary)', marginBottom: '0.6rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  {jdFile ? jdFile.name : 'Upload the job description (PDF or DOCX)'}
                </div>
                <input ref={jdFileInputRef} type="file" accept=".pdf,.docx" onChange={handleJdFileChange} style={{ display: 'none' }} />
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTON ── */}
      <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10vh',
  }}
>
  <button
    onClick={handleAnalyze}
    disabled={loading}
    className="btn-primary"
  >
    <FiCheckCircle />
    {loading ? 'Analyzing your resume...' : 'Check my resume'}
  </button>
</div>

        {/* Error Banner */}
        {error && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#EF4444', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '2.5rem', height: '2.5rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>Reading your resume and comparing it to the job description…</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginTop: '0.4rem' }}>This may take 10–20 seconds depending on resume size.</div>
          </div>
        )}

        {/* Empty State before check */}
        {!result && !loading && !error && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Add a resume and a job description above, then select "Check my resume".</p>
          </div>
        )}

        {/* ══════════════════════════════════════
            ANALYSIS RESULTS
        ══════════════════════════════════════ */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Success Banner */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', color: '#10B981', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCheckCircle style={{ fontSize: '1.1rem' }} /> Done — here's how your resume compares.
              </span>
              <button
                onClick={handleDownloadReport}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.44rem', borderRadius: '10px' }}
              >
                <FiDownload /> Download Report (PDF)
              </button>
            </div>

            {/* ── 1. CANDIDATE PROFILE CARD ── */}
            <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 10px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--color-primary)' }} /> What we read from your resume
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    background: 'rgba(79,70,229,0.15)', border: '2px solid rgba(79,70,229,0.3)',
                    borderRadius: '50%', width: '50px', height: '50px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    color: '#818CF8', fontWeight: 700
                  }}>
                    {(result.candidate?.name || 'U').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{result.candidate?.name || 'Candidate'}</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--color-muted)' }}>Candidate Profile</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ borderLeft: '3px solid #6366F1', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiBriefcase /> Experience
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                      {result.candidate?.years_experience ? `${result.candidate.years_experience} yrs` : 'Not found'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiBookOpen /> Highest Education
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                      {result.candidate?.highest_education || 'Not specified'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid #F59E0B', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiMail /> Email
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                      {result.candidate?.email || 'Not found'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid #3B82F6', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiPhone /> Phone
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                      {result.candidate?.phone || 'Not found'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiAlertCircle style={{ color: '#F59E0B' }} /> If any of this looks wrong or missing, an applicant tracking system will likely misread it too — worth fixing before you apply.
            </p>

            {/* ── 2. SECTION BY SECTION TABS ── */}
            <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 6px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiLayers style={{ color: 'var(--color-primary)' }} /> Your resume, section by section
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 1rem' }}>
              This is exactly what the parser pulled out of your file. If a section below looks empty, it likely means that heading wasn't clearly labeled in your resume — worth fixing, since an ATS will have the same trouble.
            </p>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
                {SECTION_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                        background: activeTab === tab.key ? 'rgba(79,70,229,0.2)' : 'transparent',
                        color: activeTab === tab.key ? '#818CF8' : 'var(--color-muted)',
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        fontSize: '0.83rem', cursor: 'pointer', whiteSpace: 'nowrap',
                        borderBottom: activeTab === tab.key ? '2px solid #818CF8' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {result.section_analysis?.[activeTab] && (
                <MatchedMissingBlock
                  matched={result.section_analysis[activeTab].matched}
                  missing={result.section_analysis[activeTab].missing}
                  feedback={result.section_analysis[activeTab].feedback}
                />
              )}
            </div>

            {/* ── 3. KEY SCORES ── */}
            <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 10px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBarChart2 style={{ color: 'var(--color-primary)' }} /> Your scores
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <ScoreCard value={result.job_match_score} label="Job Match Score" color={result.job_match_score >= 75 ? '#10B981' : result.job_match_score >= 55 ? '#F59E0B' : '#EF4444'} />
              <ScoreCard value={result.resume_completeness?.score} label="Resume Completeness" color="#818CF8" />
              <ScoreCard value={result.resume_structure?.score} label="Resume Structure" color="#F59E0B" />
              <ScoreCard value={result.interview_readiness?.level} label="Interview Readiness" color={readinessColor(result.interview_readiness?.level)} />
            </div>

            {result.interview_readiness?.summary && (
              <div style={{ padding: '0.85rem 1.1rem', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#818CF8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiInfo style={{ flexShrink: 0 }} /> {result.interview_readiness.summary}
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 1.5rem' }}>
              Hiring-style read: <strong style={{ color: 'var(--color-text)' }}>{result.hiring_recommendation}</strong>
            </p>

            {/* ── 4. SCORE BREAKDOWN ── */}
            <SectionCard title="Job Match Score breakdown" icon={FiBarChart2} defaultOpen>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                Skills 35% · Experience 20% · Education 10% · Resume↔JD Semantic Similarity 20% · Project Quality 15%
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                <ProgressBar value={result.skills_score} color="#10B981" label="Skills" icon={FiZap} />
                <ProgressBar value={result.experience_score} color="#818CF8" label="Experience" icon={FiBriefcase} />
                <ProgressBar value={result.education_score} color="#F59E0B" label="Education" icon={FiBookOpen} />
                <ProgressBar value={result.semantic_similarity?.score} color="#3B82F6" label="Semantic Match" icon={FiLayers} />
                <ProgressBar value={result.project_analysis?.score} color="#EC4899" label="Project Quality" icon={FiFolder} />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '0.5rem 0 0' }}>
                Semantic similarity method: {result.semantic_similarity?.method}
              </p>
            </SectionCard>

            {/* ── 5. SKILLS COMPARISON ── */}
            <SectionCard title="Skills this job is looking for" icon={FiZap} defaultOpen>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                    Skills your resume already shows for this role
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {(result.skill_match?.matched || []).length > 0
                      ? (result.skill_match.matched).map((m, i) => (
                          <Chip key={i} label={`${matchTypeIcon[m.match_type] || '✓'} ${typeof m === 'object' ? m.skill : m}`} variant="good" />
                        ))
                      : <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>None detected yet</span>
                    }
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                    ✓ exact match · ≈ synonym/abbreviation match · ~ semantic match
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                    Skills to add or highlight
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {(result.skill_match?.missing || []).length > 0
                      ? result.skill_match.missing.map((s, i) => <Chip key={i} label={s} variant="bad" />)
                      : <span style={{ fontSize: '0.82rem', color: '#10B981', fontStyle: 'italic' }}>Nothing missing — nice work</span>
                    }
                  </div>
                </div>
              </div>

              {/* Categorized Skills Expander */}
              {result.resume_skills_by_category && Object.keys(result.resume_skills_by_category).length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiList /> Your skills, categorized
                  </div>
                  {Object.entries(result.resume_skills_by_category).map(([cat, skills]) => (
                    <div key={cat} style={{ marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                      <strong style={{ color: 'var(--color-text)' }}>{cat}:</strong>{' '}
                      <span style={{ color: 'var(--color-muted)' }}>{skills.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ── 6. RESUME COMPLETENESS & STRUCTURE ── */}
            <SectionCard title="Resume completeness & structure" icon={FiLayers}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                    Completeness — {result.resume_completeness?.score}%
                  </div>
                  {(result.resume_completeness?.feedback || []).map((f, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.45rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <FiCheckCircle style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                      <span>{f.replace(/^[✅⚠️❌]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                    Structure — {result.resume_structure?.score}%
                  </div>
                  {(result.resume_structure?.feedback || []).map((f, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.45rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <FiCheckCircle style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                      <span>{f.replace(/^[✅⚠️❌]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── 7. PROJECT ANALYSIS ── */}
            <SectionCard title="Project analysis" icon={FiFolder}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.85rem' }}>
                Estimated projects: <strong style={{ color: 'var(--color-primary)' }}>{result.project_analysis?.project_count_estimate}</strong> · Quantified impact: <strong style={{ color: result.project_analysis?.has_quantified_impact ? '#10B981' : '#F59E0B' }}>{result.project_analysis?.has_quantified_impact ? 'Yes' : 'No'}</strong> · Relevant tech mentioned: <strong style={{ color: '#818CF8' }}>{(result.project_analysis?.relevant_tech_mentioned || []).join(', ') || 'None'}</strong>
              </div>
              {(result.project_analysis?.feedback || []).map((f, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--color-primary)' }}>•</span> {f}
                </div>
              ))}
            </SectionCard>

            {/* ── 8. STRENGTHS & WEAKNESSES ── */}
            <SectionCard title="Strengths & weaknesses" icon={FiAward}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiCheckCircle /> Strengths
                  </div>
                  {(result.strengths_weaknesses?.strengths || []).map((s, i) => (
                    <div key={i} style={{ padding: '0.65rem 0.85rem', marginBottom: '0.4rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiCheckCircle style={{ flexShrink: 0 }} /> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EF4444', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiXCircle /> Weaknesses
                  </div>
                  {(result.strengths_weaknesses?.weaknesses || []).map((w, i) => (
                    <div key={i} style={{ padding: '0.65rem 0.85rem', marginBottom: '0.4rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.82rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiXCircle style={{ flexShrink: 0 }} /> {w}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── 9. SECTION-WISE RECOMMENDATIONS ── */}
            <SectionCard title="Section-wise recommendations" icon={FiList}>
              {(result.recommendations || []).map((rec, i) => (
                <div key={i} style={{ padding: '0.85rem', marginBottom: '0.65rem', background: rec.needs_attention ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', borderRadius: '10px', border: `1px solid ${rec.needs_attention ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  {rec.needs_attention ? <FiAlertCircle style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }} /> : <FiCheckCircle style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} />}
                  <div>
                    <strong style={{ color: rec.needs_attention ? '#EF4444' : '#10B981' }}>{rec.section}</strong> — {rec.recommendation}
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* ── 10. WHY YOU GOT THIS SCORE ── */}
            <SectionCard title="Why you got this score" icon={FiInfo}>
              {Object.entries(result.explanation || {}).map(([key, item]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--color-text)' }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                  <span style={{ color: 'var(--color-muted)', textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                </div>
              ))}
            </SectionCard>

            {/* ── 11. BEFORE YOU WALK INTO THE INTERVIEW ── */}
            <SectionCard title="Before you walk into the interview" icon={FiCheckCircle}>
              {(result.interview_readiness?.talking_points || []).map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.65rem', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  <FiCheckCircle style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                  <span>{point}</span>
                </div>
              ))}
            </SectionCard>

            {/* ── 12. RAW OUTPUT (JSON) ──
            <SectionCard title="Full raw output (JSON) — structured for downstream use" icon={FiCode}>
              <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', fontSize: '0.78rem', color: '#818CF8', overflowX: 'auto', maxHeight: '350px' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </SectionCard> */}

          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentResume;
