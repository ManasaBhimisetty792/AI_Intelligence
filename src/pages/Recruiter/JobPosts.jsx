import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

export const JobPosts = () => {
  return (
    <DashboardLayout title="Job Listings & Posts">
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Job Postings Management</h3>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>Post tech jobs, manage requirements, and review candidate applications.</p>
      </div>
    </DashboardLayout>
  );
};


export default JobPosts;
