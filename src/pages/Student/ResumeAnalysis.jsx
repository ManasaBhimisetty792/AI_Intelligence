import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { resumeService } from '../../services/resumeService';
import { FiCheckCircle, FiAlertTriangle, FiArrowRight, FiFileText } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const ResumeAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const data = await resumeService.analyzeResume();
      setAnalysis(data);
      setLoading(false);
    }
    load();
  }, []);
  if (loading) {
    return (
      <DashboardLayout title="AI ATS Resume Breakdown">
        <div className="route-loading">Analyzing resume structure & keywords...</div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout title="AI ATS Resume Analysis Report">
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge-ai mb-2"><HiSparkles /> Neural ATS Scan Report</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.25rem 0' }}>{analysis.filename}</h2>
          <p style={{ color: 'var(--color-muted)', margin: 0 }}>Scanned on {analysis.parseDate} • {analysis.fileSize}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.8)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-success)' }}>{analysis.overallScore}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>Overall ATS Match</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(203, 213, 225, 0.6)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{analysis.atsCompatibility}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>Compatibility Tier</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Executive Summary</h3>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
              {analysis.summary}
            </p>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.65rem' }}>Detected Technical Keywords ({analysis.skillsDetected.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {analysis.skillsDetected.map((sk) => (
                <span key={sk} className="badge-glass">
                  <FiCheckCircle style={{ color: 'var(--color-success)' }} /> {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
              Actionable AI Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', background: 'rgba(79, 70, 229, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                  <HiSparkles style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.5 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-warning)' }}>
              Missing Tech Tokens
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
              High-value recruiter search keywords missing from your current resume version:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analysis.missingKeywords.map((kw) => (
                <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-warning)', padding: '0.4rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)' }}>
                  <FiAlertTriangle /> {kw}
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card text-center" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Next Step: Practice Interviews</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
              Test your resume claims with an automated AI technical drill.
            </p>
            <Link to="/student/mock-interviews" className="btn-primary w-full">
              Launch AI Mock Drill <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalysis;
