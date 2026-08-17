import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { resumeService } from '../../services/resumeService';
import CandidateProfileCard from '../../components/Resume/CandidateProfileCard';
import MatchMissingTab from '../../components/Resume/MatchMissingTab';
import TabPanel from '../../components/Resume/TabPanel';
import ScoreSection, { ExplainabilitySection } from '../../components/Resume/ScoreSection';
import OverallScoreChart from '../../components/Resume/OverallScoreChart';
import {
  FiCompass, FiUpload, FiFileText, FiXCircle, FiArrowRight,
  FiDownload, FiRefreshCw, FiBookOpen, FiCode, FiUsers,
  FiBriefcase, FiFolder, FiAward, FiLayers, FiSliders
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import '../../components/Resume/resumeAnalysis.css';

export const StudentResume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdMode, setJdMode] = useState('text');
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [jdPreview, setJdPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const resumeInputRef = useRef();
  const jdInputRef = useRef();

  const sectionAnalysis = result?.section_analysis || {};

  const handleJdFileSelected = (file) => {
    setJdFile(file);
    setResult(null);
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setJdPreview(e.target.result || '');
        reader.readAsText(file);
      } else {
        setJdPreview(`[File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
      }
    } else {
      setJdPreview('');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile && (!jdText.trim() && !jdFile)) {
      setError('Add both your resume and a job description to run the check.');
      return;
    }
    if (!resumeFile) {
      setError('Please upload your resume (PDF or DOCX).');
      return;
    }
    if (jdMode === 'text' && !jdText.trim()) {
      setError('Please paste the job description.');
      return;
    }
    if (jdMode === 'file' && !jdFile) {
      setError('Please upload the job description file.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await resumeService.analyzeResume({
        resumeFile,
        jdText: jdMode === 'text' ? jdText : '',
        jdFile: jdMode === 'file' ? jdFile : null,
      });
      setResult(data);
      toast.success("Done — here's how your resume compares.");
    } catch (err) {
      const errMsg = err.message || 'Analysis failed. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const name = result.candidate?.name || 'Candidate';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export the report.');
      return;
    }

    const overall = result.overall_resume_score || {};
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${name} - Resume Readiness Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #059669; font-size: 22px; }
          .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
          .scores { display: flex; gap: 12px; margin: 20px 0; }
          .metric { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .metric .val { font-size: 22px; font-weight: 700; color: #0f172a; }
          .metric .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 15px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Resume Readiness Check Report</h1>
          <p><strong>Candidate:</strong> ${name} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="scores">
          <div class="metric"><div class="val">${result.resume_completeness?.score || 0}%</div><div class="lbl">Completeness</div></div>
          <div class="metric"><div class="val">${result.job_match_score || 0}%</div><div class="lbl">Job Match</div></div>
          <div class="metric"><div class="val">${result.resume_structure?.score || 0}%</div><div class="lbl">Structure</div></div>
          <div class="metric"><div class="val">${overall.score || 0}%</div><div class="lbl">Overall Score</div></div>
          <div class="metric"><div class="val" style="font-size:16px;">${result.interview_readiness?.level || 'Ready'}</div><div class="lbl">Readiness</div></div>
        </div>

        <div class="section">
          <div class="section-title">Interview Readiness Assessment</div>
          <div class="box">${result.interview_readiness?.summary || ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Candidate Profile</div>
          <div class="box">
            <strong>Experience:</strong> ${result.candidate?.years_experience != null ? `${result.candidate.years_experience} yrs` : 'Not specified'} &nbsp;|&nbsp;
            <strong>Highest Education:</strong> ${result.candidate?.highest_education || 'Not specified'} &nbsp;|&nbsp;
            <strong>Email:</strong> ${result.candidate?.email || 'Not found'} &nbsp;|&nbsp;
            <strong>Phone:</strong> ${result.candidate?.phone || 'Not found'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Before You Walk Into the Interview</div>
          <ul>
            ${(result.interview_readiness?.talking_points || []).map((tp) => `<li>${tp}</li>`).join('')}
          </ul>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const comparisonTabs = [
    {
      label: 'Education',
      icon: FiBookOpen,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.education?.matched}
          missing={sectionAnalysis.education?.missing}
          feedback={sectionAnalysis.education?.feedback}
        />
      ),
    },
    {
      label: 'Technical Skills',
      icon: FiCode,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.technical_skills?.matched}
          missing={sectionAnalysis.technical_skills?.missing}
          feedback={sectionAnalysis.technical_skills?.feedback}
        />
      ),
    },
    {
      label: 'Soft Skills',
      icon: FiUsers,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.soft_skills?.matched}
          missing={sectionAnalysis.soft_skills?.missing}
          feedback={sectionAnalysis.soft_skills?.feedback}
        />
      ),
    },
    {
      label: 'Experience',
      icon: FiBriefcase,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.experience?.matched}
          missing={sectionAnalysis.experience?.missing}
          feedback={sectionAnalysis.experience?.feedback}
        />
      ),
    },
    {
      label: 'Projects',
      icon: FiFolder,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.projects?.matched}
          missing={sectionAnalysis.projects?.missing}
          feedback={sectionAnalysis.projects?.feedback}
        />
      ),
    },
    {
      label: 'Certifications',
      icon: FiAward,
      content: (
        <MatchMissingTab
          matched={sectionAnalysis.certifications?.matched}
          missing={sectionAnalysis.certifications?.missing}
          feedback={sectionAnalysis.certifications?.feedback}
        />
      ),
    },
  ];

  return (
    <DashboardLayout title="Resume Readiness Check">
      <div className="resume-analysis-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header card with theme styling */}
        <div className="page-header-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <FiCompass />
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              Resume Readiness Check
            </h2>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            See how your resume stacks up against a job description before your interview — the same
            checks an applicant tracking system would run, so there are no surprises later.
          </p>
        </div>

        {/* Inputs */}
        <div className="content-card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Resume upload */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text)' }}>
                Your resume
              </div>
              <div
                role="button"
                tabIndex={0}
                className={`dropzone-box ${resumeFile ? 'active' : ''}`}
                onClick={() => resumeInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && resumeInputRef.current?.click()}
              >
                <FiUpload style={{ fontSize: '1.75rem', color: resumeFile ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: resumeFile ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  {resumeFile ? resumeFile.name : 'Upload your resume (PDF or DOCX)'}
                </div>
                {resumeFile && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    {(resumeFile.size / 1024).toFixed(0)} KB
                  </div>
                )}
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setResumeFile(e.target.files?.[0] || null);
                  setResult(null);
                }}
              />
            </div>

            {/* JD input */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--color-text)' }}>
                Job description
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[
                  { mode: 'text', label: 'Paste text' },
                  { mode: 'file', label: 'Upload file' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setJdMode(mode);
                      setResult(null);
                    }}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-full, 999px)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: jdMode === mode ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: jdMode === mode ? '#FFFFFF' : 'var(--color-muted)',
                      fontFamily: 'inherit',
                      transition: 'all var(--transition-fast, 120ms ease)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {jdMode === 'text' ? (
                <textarea
                  value={jdText}
                  onChange={(e) => {
                    setJdText(e.target.value);
                    setResult(null);
                  }}
                  placeholder="Paste the full job posting you're applying to…"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xl, 12px)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-sec)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`dropzone-box ${jdFile ? 'active' : ''}`}
                    onClick={() => jdInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && jdInputRef.current?.click()}
                  >
                    <FiFileText style={{ fontSize: '1.75rem', color: jdFile ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: jdFile ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {jdFile ? jdFile.name : 'Upload the job description (PDF or DOCX)'}
                    </div>
                  </div>
                  <input
                    ref={jdInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => handleJdFileSelected(e.target.files?.[0] || null)}
                  />
                  {jdPreview && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '4px' }}>Preview</div>
                      <textarea
                        readOnly
                        disabled
                        value={jdPreview}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface-sec)',
                          color: 'var(--color-muted)',
                          fontSize: '0.78rem',
                          resize: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: '1rem',
                background: 'var(--color-danger-light)',
                borderLeft: '4px solid var(--color-danger)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: 'var(--color-danger)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <FiXCircle style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Action Button outside container */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '1.25rem 0 1.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-lg, 8px)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                Comparing resume to job description…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiSparkles /> Check my resume
              </span>
            )}
          </button>
        </div>

        {result && (
          <>
            {/* ── SECTION 1: Overall Score & Candidate Information ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                <FiSliders style={{ color: 'var(--color-primary)' }} /> Overall Score & Candidate Information
              </div>
              <button
                onClick={handleDownloadPDF}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg, 8px)',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast, 120ms ease)',
                }}
              >
                <FiDownload /> Export PDF
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
              <OverallScoreChart score={result.overall_resume_score?.score} />
              <CandidateProfileCard result={result} />
            </div>

            {/* ── SECTION 2: KPI Cards, Job Match Score Breakdown & Why You Got This Score ── */}
            <div className="section-title">
              <HiSparkles style={{ color: 'var(--color-primary)' }} /> Score Breakdown & Analysis
            </div>
            <div className="content-card">
              <ScoreSection result={result} />
            </div>

            {/* ── SECTION 3: Section by Section Comparison then Walkthrough ── */}
            <div className="section-title">
              <FiLayers style={{ color: 'var(--color-primary)' }} /> Section by Section Comparison
            </div>
            <div className="content-card" style={{ marginBottom: '1.5rem' }}>
              <TabPanel tabs={comparisonTabs} />
            </div>

            <div className="content-card">
              <ExplainabilitySection result={result} />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                alignItems: 'center',
                margin: '2rem 0 2.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setResumeFile(null);
                  setJdText('');
                  setJdFile(null);
                  setJdPreview('');
                  setError(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg, 8px)',
                  padding: '9px 18px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast, 120ms ease)',
                }}
              >
                <FiRefreshCw /> Start Over
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/student/recruiters')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 22px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-lg, 8px)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Find Recruiters <FiArrowRight />
              </button>
            </div>
          </>
        )}

        {!result && !loading && (
          <p className="small-note" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            Add a resume and a job description above, then select &quot;Check my resume&quot;.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResume;
