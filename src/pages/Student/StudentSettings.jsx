import React, { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiSettings, FiBell, FiShield, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const StudentSettings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [recruiterVisibility, setRecruiterVisibility] = useState(true);
  const [strictness, setStrictness] = useState('High');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Account & security preferences updated.');
  };

  return (
    <DashboardLayout title="Account Settings & Security">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Preferences & Controls</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Recruiter Profile Discovery</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Allow verified recruiters to discover your ATS score and invite you to interviews.</div>
            </div>
            <input type="checkbox" checked={recruiterVisibility} onChange={(e) => setRecruiterVisibility(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Email Notifications</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Receive AI assessment reports and recruiter message alerts.</div>
            </div>
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </div>

          <div>
            <label className="form-label">AI Evaluation Rigor</label>
            <select value={strictness} onChange={(e) => setStrictness(e.target.value)} className="input-glass">
              <option value="Standard">Standard (General Feedback)</option>
              <option value="High">High (Strict Staff Engineer Rubric)</option>
              <option value="FAANG Level">FAANG Level (Zero-Tolerance Code Accuracy)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
            <FiSave /> Save Settings
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
