import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { subscriptionService } from '../../services/subscriptionService';
import { FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const StudentSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await subscriptionService.getPlans();
      const current = await subscriptionService.getCurrentSubscription();
      setPlans(data);
      setSub(current);
    }
    load();
  }, []);

  const handleUpgrade = (planName) => {
    toast.success(`Redirecting to secure payment checkout for: ${planName}`);
  };

  return (
    <DashboardLayout title="Plans & Subscription Tiers">
      {sub && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-ai mb-1"><FiCreditCard /> Active Plan</span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>{sub.planName} Tier</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: 0 }}>Next auto-renewal on {sub.nextBillingDate} ({sub.amount})</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.85rem' }}>Manage Billing Info</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {plans.map((p) => (
          <div key={p.id} className={`glass-card ${p.isPopular ? 'border-primary' : ''}`} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {p.isPopular && <span className="badge-ai" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.72rem' }}>{p.badge}</span>}
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>{p.name}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
              {p.price} <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 400 }}>/{p.period}</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <FiCheckCircle style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>

            <button onClick={() => handleUpgrade(p.name)} className={p.isPopular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
              {sub?.planId === p.id ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentSubscriptions;
