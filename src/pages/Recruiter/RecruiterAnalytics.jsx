import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiBarChart2, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';

export const RecruiterAnalytics = () => {
  return (
    <DashboardLayout title="Hiring Funnel & Time-to-Hire Analytics">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>12 Days</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Avg Time-to-Hire (Industry Avg: 42d)</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-success)' }}>94.2%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Offer Acceptance Rate</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-secondary)' }}>48 Hours</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>AI First-Round Turnaround</div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterAnalytics;
