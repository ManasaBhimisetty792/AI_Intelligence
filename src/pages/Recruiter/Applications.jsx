import React, { useEffect, useState } from 'react';
import {
  FiFileText, FiSearch, FiFilter, FiCheckCircle, FiClock, FiXCircle, FiArrowRight
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const Applications = () => {
  const [apps, setApps] = useState([]);
  const [stageFilter, setStageFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    recruiterService.getApplications().then((data) => setApps(data));
  }, []);

  const stages = ['All', 'Screening', 'Interviewing', 'Offered', 'Rejected'];

  const filteredApps = apps.filter((a) => {
    const matchesStage = stageFilter === 'All' ? true : a.status === stageFilter;
    const matchesSearch =
      a.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offered':
        return { bg: '#e6f9f4', color: '#149174', label: 'Offer Extended' };
      case 'Interviewing':
        return { bg: '#e0f2fe', color: '#0284c7', label: 'Interview Scheduled' };
      case 'Screening':
        return { bg: '#fef3e0', color: '#b8860b', label: 'AI Screening' };
      case 'Rejected':
        return { bg: '#fef2f2', color: '#ef4444', label: 'Rejected' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status };
    }
  };

  return (
    <DashboardLayout title="Applications Pipeline">
      {/* Header & Filter Controls */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {stages.map((stg) => (
              <button
                key={stg}
                onClick={() => setStageFilter(stg)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: stageFilter === stg ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                  background: stageFilter === stg ? '#1abc9c' : '#fff',
                  color: stageFilter === stg ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                {stg}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Applications List Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Active Candidate Applications ({filteredApps.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredApps.map((a) => {
            const badge = getStatusBadge(a.status);
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  background: '#fff',
                  border: '1px solid #eef1f5',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{a.candidate_name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{a.role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Job: {a.job_title}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ATS Match</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: a.ats_score >= 85 ? '#149174' : '#d97706' }}>
                    {a.ats_score}%
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: badge.bg,
                      color: badge.color,
                      fontWeight: 700,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Applied on {a.date}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => alert(`Status updated for ${a.candidate_name}`)}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Advance <FiArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
