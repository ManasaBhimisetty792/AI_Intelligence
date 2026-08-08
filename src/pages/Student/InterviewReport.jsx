import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { interviewService } from '../../services/interviewService';
import { FiCheckCircle, FiAward, FiArrowRight, FiBarChart2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const InterviewReport = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await interviewService.generateReport('sess_101');
      setReport(data);
    }
    load();
  }, []);

  if (!report) return <DashboardLayout title="Generating Diagnostic Report..."><div className="route-loading">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="AI Technical Drill Diagnostic Report">
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge-ai mb-2"><HiSparkles /> Verified Drill Diagnostic</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.25rem 0' }}>Full Stack & React Technical Drill</h2>
          <p style={{ color: 'var(--color-muted)', margin: 0 }}>Completed on {report.dateCompleted}</p>
        </div>

        <div style={{ textAlign: 'center', background: 'rgba(79, 70, 229, 0.08)', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{report.overallScore}%</div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-muted)' }}>Overall Technical Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-success)' }}>{report.technicalAccuracy}%</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Technical Accuracy</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)' }}>{report.communicationClarity}%</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Communication Clarity</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{report.problemSolving}%</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Problem Solving</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-accent)' }}>{report.timeManagement}%</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Pacing & Time</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>AI Feedback Digest</h3>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>{report.detailedFeedback}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/student/mock-interviews" className="btn-primary">
          Practice Another Drill <FiArrowRight />
        </Link>
        <Link to="/student/certificates" className="btn-secondary">
          <FiAward /> Claim Verified Skill Badge
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default InterviewReport;
