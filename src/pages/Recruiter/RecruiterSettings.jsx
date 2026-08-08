import React, { useState } from 'react';
import {
  FiSettings, FiBell, FiShield, FiSliders, FiCheckCircle, FiSave, FiLock
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

export const RecruiterSettings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoScreening, setAutoScreening] = useState(true);
  const [interviewLength, setInterviewLength] = useState('60');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="Recruiter Account Settings">
      {saved && (
        <div className="glass-card mb-4" style={{ padding: '1rem', background: '#149174', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCheckCircle /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Screening & Interview Defaults */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiSliders style={{ color: 'var(--color-primary)' }} /> Automated Screening & Interview Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable AI Automated Resume Screening</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Automatically rank candidates using AI match thresholds when applications arrive.</div>
              </div>
              <input
                type="checkbox"
                checked={autoScreening}
                onChange={(e) => setAutoScreening(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Default Interview Slot Duration</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Default duration assigned when scheduling new candidate interviews.</div>
              </div>
              <select
                value={interviewLength}
                onChange={(e) => setInterviewLength(e.target.value)}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBell style={{ color: 'var(--color-primary)' }} /> Notification Preferences
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Notifications for New Applicants</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Receive instant email alerts when high-match candidates apply.</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiSave /> Save Settings
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default RecruiterSettings;
