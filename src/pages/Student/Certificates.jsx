import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiAward, FiDownload, FiCheckCircle, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Certificates = () => {
  const badges = [
    { title: 'Full Stack React 19 & Hooks', score: '94%', issueDate: '2026-07-22', id: 'cert_101', tier: 'Top 5% Percentile' },
    { title: 'FastAPI & Microservices Architecture', score: '92%', issueDate: '2026-07-15', id: 'cert_102', tier: 'Advanced Certified' },
    { title: 'System Design & Distributed Scalability', score: '88%', issueDate: '2026-06-28', id: 'cert_103', tier: 'Verified Candidate' },
  ];

  const handleDownload = (certTitle) => {
    toast.success(`Downloading PDF certificate for: ${certTitle}`);
  };

  return (
    <DashboardLayout title="Verified Skill Badges & Certificates">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tamper-Proof Credentials</h2>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>
          Recruiters verify these score badges directly on your candidate profile during candidate screening.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {badges.map((b) => (
          <div key={b.id} className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                <FiAward />
              </div>
              <span className="badge-ai" style={{ fontSize: '0.72rem' }}>{b.tier}</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>{b.title}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
              Verified Score: <strong style={{ color: 'var(--color-success)' }}>{b.score}</strong> • Issued on {b.issueDate}
            </p>

            <button onClick={() => handleDownload(b.title)} className="btn-secondary w-full" style={{ fontSize: '0.875rem' }}>
              <FiDownload /> Download Certificate PDF
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;
