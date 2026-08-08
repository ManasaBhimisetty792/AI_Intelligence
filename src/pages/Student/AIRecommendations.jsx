import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiArrowRight, FiCheckCircle, FiBriefcase } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const AIRecommendations = () => {
  const jobs = [
    { title: 'Senior React & Microservices Engineer', company: 'Nexus Tech Global', matchScore: '96% Match', location: 'San Francisco, CA (Hybrid)', salary: '$165k - $190k' },
    { title: 'Full Stack Python & FastAPI Lead', company: 'CloudScale AI', matchScore: '92% Match', location: 'Remote', salary: '$150k - $180k' },
    { title: 'AI Applications Specialist', company: 'Hyperion Analytics', matchScore: '89% Match', location: 'New York, NY', salary: '$140k - $165k' },
  ];

  return (
    <DashboardLayout title="AI Career & Job Match Recommendations">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Personalized Opportunities</h2>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>
          Based on your recent ATS resume parse score (94%) and interview drill diagnostic results.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {jobs.map((job, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                <span className="badge-ai">{job.matchScore}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-muted)' }}>{job.company}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{job.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                {job.location} • <strong style={{ color: 'var(--color-text)' }}>{job.salary}</strong>
              </div>
            </div>

            <button className="btn-primary" style={{ fontSize: '0.875rem' }}>
              One-Click Apply with AI Score Profile <FiArrowRight />
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AIRecommendations;
