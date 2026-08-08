import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiCreditCard, FiCheckCircle } from 'react-icons/fi';

export const RecruiterBilling = () => {
  return (
    <DashboardLayout title="Enterprise Recruiter Billing & Seats">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <span className="badge-ai mb-2">Enterprise Plan</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>$199 / month</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          Includes unlimited candidate resume screening, automated AI video drills, and 5 team member seats.
        </p>
        <button className="btn-secondary">Manage Payment Method & Invoices</button>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterBilling;
