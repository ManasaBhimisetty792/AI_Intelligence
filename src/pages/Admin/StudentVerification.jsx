import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiCheckCircle } from 'react-icons/fi';

export const StudentVerification = () => {
  return (
    <DashboardLayout title="Student University Credential Verification">
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>University Email Verifications</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          All candidate university credentials from Stanford, MIT, and Carnegie Mellon are automatically verified via Supabase Auth email domain match rules.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default StudentVerification;
