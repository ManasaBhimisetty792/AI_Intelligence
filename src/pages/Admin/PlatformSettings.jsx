import React, { useState } from 'react';
import {
  FiServer, FiMail, FiShield, FiSave, FiCpu, FiBell, FiGlobe, FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';

const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    style={{
      width: 48,
      height: 26,
      borderRadius: 13,
      border: 'none',
      cursor: 'pointer',
      background: value ? 'var(--color-primary)' : 'var(--color-surface-sec)',
      position: 'relative',
      transition: 'background var(--transition-fast)',
      flexShrink: 0,
      outline: 'none',
    }}
  >
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: value ? 24 : 4,
        transition: 'left var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
      }}
    />
  </button>
);

const SettingRow = ({ label, sub, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      padding: '1rem 0',
      borderBottom: '1px solid var(--color-border)',
      gap: '1.25rem',
      flexWrap: 'wrap',
    }}
  >
    <div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
    {children}
  </div>
);

const SectionCard = ({ icon, title, accent = 'var(--color-primary)', children, onSave }) => (
  <div
    style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '1.1rem 1.5rem',
        background: 'var(--color-surface-sec)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ color: accent, fontSize: '1.1rem' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{title}</h3>
      </div>
    </div>
    <div style={{ padding: '0 1.5rem 1.5rem' }}>
      {children}
      {onSave && (
        <button
          onClick={onSave}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.25rem',
            background: accent,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginTop: '1.25rem',
            transition: 'opacity var(--transition-fast)',
          }}
        >
          <FiSave /> Save Configuration
        </button>
      )}
    </div>
  </div>
);

export const PlatformSettings = () => {
  // AI Config
  const [llmEngine, setLlmEngine] = useState('skilltrack_v3');
  const [aiDrillsEnabled, setAiDrillsEnabled] = useState(true);
  const [aiScoringEnabled, setAiScoringEnabled] = useState(true);

  // Security
  const [oauthRedirect, setOauthRedirect] = useState('http://localhost:5173');
  const [emailVerification, setEmailVerification] = useState(true);
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [realtimeNotifications, setRealtimeNotifications] = useState(true);
  const [adminDigest, setAdminDigest] = useState(false);

  // SMTP
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('skilltrack792@gmail.com');

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState(true);

  const handleSaveSection = (sectionName) => {
    toast.success(`${sectionName} configuration saved successfully.`);
  };

  const inputStyle = {
    padding: '0.55rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface-sec)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '0.85rem',
    outline: 'none',
  };

  return (
    <AdminLayout
      title="Platform Settings & Configuration"
      subtitle="Configure global AI engines, security policies, SMTP credentials, and platform maintenance status."
    >
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Maintenance Banner Warning */}
        {maintenanceMode && (
          <div
            style={{
              background: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-danger)',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <FiAlertTriangle style={{ fontSize: '1.4rem', flexShrink: 0 }} />
            <div>
              <strong>Maintenance Mode Active!</strong> Non-administrator users will see a scheduled maintenance notice when logging in.
            </div>
          </div>
        )}

        {/* AI Engine Settings */}
        <SectionCard icon={<FiCpu />} title="AI Engine & Feature Controls" accent="var(--color-primary)" onSave={() => handleSaveSection('AI Engine')}>
          <SettingRow label="Active Neural LLM Model" sub="Model driving AI mock interviews and ATS resume parsing">
            <select
              value={llmEngine}
              onChange={(e) => setLlmEngine(e.target.value)}
              style={{ ...inputStyle, minWidth: 260, cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="skilltrack_v3">SkillTrack Neural Model v3.0 (Recommended)</option>
              <option value="skilltrack_v25">SkillTrack Technical Rubric v2.5</option>
              <option value="gpt4o">GPT-4o (OpenAI Integration)</option>
              <option value="claude">Claude 3.5 Sonnet (Anthropic Integration)</option>
            </select>
          </SettingRow>

          <SettingRow label="AI Mock Interview Drills" sub="Enable interactive real-time technical drills for students">
            <Toggle value={aiDrillsEnabled} onChange={setAiDrillsEnabled} />
          </SettingRow>

          <SettingRow label="ATS Resume Optimization" sub="Automatic resume scoring and keyword extraction on upload">
            <Toggle value={aiScoringEnabled} onChange={setAiScoringEnabled} />
          </SettingRow>
        </SectionCard>

        {/* Security & Access Controls */}
        <SectionCard icon={<FiShield />} title="Authentication & Security Policy" accent="var(--color-secondary)" onSave={() => handleSaveSection('Security Policy')}>
          <SettingRow label="OAuth Redirect Base URI" sub="Base URL for Supabase authentication callbacks">
            <input type="text" value={oauthRedirect} onChange={(e) => setOauthRedirect(e.target.value)} style={{ ...inputStyle, minWidth: 260 }} />
          </SettingRow>

          <SettingRow label="Email Verification Requirement" sub="Require email confirmation before user dashboard access">
            <Toggle value={emailVerification} onChange={setEmailVerification} />
          </SettingRow>

          <SettingRow label="Recruiter Manual Approval" sub="Require admin verification before recruiters can post jobs">
            <Toggle value={adminApprovalRequired} onChange={setAdminApprovalRequired} />
          </SettingRow>

          <SettingRow label="Inactivity Session Timeout (minutes)" sub="Automatically log out inactive users">
            <input type="number" min="15" max="1440" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} style={{ ...inputStyle, width: 110 }} />
          </SettingRow>
        </SectionCard>

        {/* Notification Settings */}
        <SectionCard icon={<FiBell />} title="Notification Dispatch Rules" accent="var(--color-warning)" onSave={() => handleSaveSection('Notification Rules')}>
          <SettingRow label="Transactional Email Dispatch" sub="Send transactional emails for interview schedules and decisions">
            <Toggle value={emailNotifications} onChange={setEmailNotifications} />
          </SettingRow>

          <SettingRow label="Real-Time Browser Push" sub="Broadcast instant push alerts via Supabase Realtime">
            <Toggle value={realtimeNotifications} onChange={setRealtimeNotifications} />
          </SettingRow>

          <SettingRow label="Daily Admin Digest" sub="Send daily platform summary emails to administrative staff">
            <Toggle value={adminDigest} onChange={setAdminDigest} />
          </SettingRow>
        </SectionCard>

        {/* SMTP Configuration */}
        <SectionCard icon={<FiMail />} title="SMTP Credentials & Gateway" accent="var(--color-accent)" onSave={() => handleSaveSection('SMTP Email')}>
          <SettingRow label="SMTP Server Host">
            <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} style={{ ...inputStyle, minWidth: 260 }} />
          </SettingRow>

          <SettingRow label="SMTP Server Port">
            <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} style={{ ...inputStyle, width: 110 }} />
          </SettingRow>

          <SettingRow label="SMTP Sender Username">
            <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} style={{ ...inputStyle, minWidth: 260 }} />
          </SettingRow>

          <SettingRow label="SMTP Password" sub="Leave unchanged to preserve active credential">
            <input type="password" placeholder="••••••••••••" style={{ ...inputStyle, minWidth: 260 }} />
          </SettingRow>
        </SectionCard>

        {/* System & Maintenance */}
        <SectionCard icon={<FiGlobe />} title="System Operations & Health" accent="var(--color-danger)" onSave={() => handleSaveSection('System Operations')}>
          <SettingRow label="Platform User Registration" sub="Allow new candidates and recruiters to create accounts">
            <Toggle value={signupsEnabled} onChange={setSignupsEnabled} />
          </SettingRow>

          <SettingRow label="Platform Maintenance Mode" sub="⚠️ Display maintenance banner for non-administrative users">
            <Toggle value={maintenanceMode} onChange={setMaintenanceMode} />
          </SettingRow>
        </SectionCard>
      </div>
    </AdminLayout>
  );
};

export default PlatformSettings;
