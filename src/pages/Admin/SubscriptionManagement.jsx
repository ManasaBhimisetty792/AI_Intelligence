import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

export const SubscriptionManagement = () => {
  return (
    <DashboardLayout title="Subscription & Revenue Management">
      <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Active Recurring Billing Tiers</h3>
        <p style={{ color: 'var(--color-muted)' }}>Pro Candidate Tiers: 1,420 Active Subscriptions ($19/mo)</p>
        <p style={{ color: 'var(--color-muted)' }}>Enterprise Recruiter Tiers: 110 Active Subscriptions ($199/mo)</p>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionManagement;
