import React, { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  FiServer, FiMail, FiShield, FiToggleLeft, FiToggleRight,
  FiSave, FiRefreshCw, FiKey, FiGlobe, FiCpu, FiBell,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
      background: value ? '#4F46E5' : 'rgba(255,255,255,0.12)',
      position: 'relative', transition: 'background 0.25s', flexShrink: 0,
    }}
  >
    <div style={{
      width: 20, height: 20, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 3, left: value ? 24 : 4,
      transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    }} />
  </button>
);

// ─── Setting Row ──────────────────────────────────────────────────────────────
const SettingRow = ({ label, sub, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '1rem', flexWrap: 'wrap' }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
    {children}
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ icon, title, accent, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.1rem 1.5rem', background: `${accent}0D`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: accent, fontSize: '1.05rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>{title}</h3>
    </div>
    <div style={{ padding: '0 1.5rem' }}>{children}</div>
  </div>
);

// ─── PlatformSettings ─────────────────────────────────────────────────────────
export const PlatformSettings = () => {
  // AI Config
  const [llmEngine, setLlmEngine] = useState('skilltrack_v3');
  const [aiDrillsEnabled, setAiDrillsEnabled] = useState(true);
  const [aiScoringEnabled, setAiScoringEnabled] = useState(true);

  // Auth & Security
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

  const handleSave = (section) => {
    toast.success(`${section} settings saved.`);
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.85rem', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text)', fontSize: '0.85rem', outline: 'none' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };
  const saveBtn = (label) => (
    <button
      onClick={() => handleSave(label)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.2rem', background: '#4F46E5', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', marginTop: '1.25rem', marginBottom: '1rem', transition: 'opacity 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <FiSave /> Save {label}
    </button>
  );

  return (
    <DashboardLayout title="Platform Settings">
      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 16, padding: '1.5rem 2rem' }}>
          <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiServer style={{ color: '#4F46E5' }} /> Global Platform Configuration
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            Manage AI engine settings, authentication, notifications, and system features.
          </p>
        </div>

        {/* AI Engine */}
        <Section icon={<FiCpu />} title="AI Engine & Features" accent="#4F46E5">
          <SettingRow label="Active LLM Engine" sub="Model powering AI drills and resume scoring">
            <select value={llmEngine} onChange={e => setLlmEngine(e.target.value)} style={{ ...selectStyle, minWidth: 240 }}>
              <option value="skilltrack_v3">SkillTrack Neural Model v3.0 (Recommended)</option>
              <option value="skilltrack_v25">SkillTrack Technical Rubric v2.5</option>
              <option value="gpt4o">GPT-4o (OpenAI)</option>
              <option value="claude">Claude Sonnet (Anthropic)</option>
            </select>
          </SettingRow>
          <SettingRow label="AI Mock Drills" sub="Allow students to practice with AI-powered mock interviews">
            <Toggle value={aiDrillsEnabled} onChange={setAiDrillsEnabled} />
          </SettingRow>
          <SettingRow label="AI Resume Scoring" sub="Automatic ATS-style resume evaluation on upload">
            <Toggle value={aiScoringEnabled} onChange={setAiScoringEnabled} />
          </SettingRow>
          {saveBtn('AI')}
        </Section>

        {/* Auth & Security */}
        <Section icon={<FiShield />} title="Authentication & Security" accent="#7C3AED">
          <SettingRow label="Supabase OAuth Redirect URL" sub="Base URL for OAuth callbacks (e.g. Google Sign-in)">
            <input type="text" value={oauthRedirect} onChange={e => setOauthRedirect(e.target.value)} style={{ ...inputStyle, minWidth: 240 }} />
          </SettingRow>
          <SettingRow label="Email Verification Required" sub="New users must verify email before accessing dashboard">
            <Toggle value={emailVerification} onChange={setEmailVerification} />
          </SettingRow>
          <SettingRow label="Recruiter Admin Approval" sub="Recruiters require admin verification before posting jobs">
            <Toggle value={adminApprovalRequired} onChange={setAdminApprovalRequired} />
          </SettingRow>
          <SettingRow label="Session Timeout (minutes)" sub="Auto-logout inactive users after this period">
            <input type="number" min="15" max="1440" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{ ...inputStyle, width: 100 }} />
          </SettingRow>
          {saveBtn('Security')}
        </Section>

        {/* Notifications */}
        <Section icon={<FiBell />} title="Notification Settings" accent="#F59E0B">
          <SettingRow label="Email Notifications" sub="Send transactional emails for interview events">
            <Toggle value={emailNotifications} onChange={setEmailNotifications} />
          </SettingRow>
          <SettingRow label="Realtime Push Notifications" sub="Browser push notifications via Supabase Realtime">
            <Toggle value={realtimeNotifications} onChange={setRealtimeNotifications} />
          </SettingRow>
          <SettingRow label="Daily Admin Digest" sub="Send daily summary emails to admin">
            <Toggle value={adminDigest} onChange={setAdminDigest} />
          </SettingRow>
          {saveBtn('Notifications')}
        </Section>

        {/* SMTP */}
        <Section icon={<FiMail />} title="SMTP Email Configuration" accent="#10B981">
          <SettingRow label="SMTP Host">
            <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} style={{ ...inputStyle, minWidth: 240 }} />
          </SettingRow>
          <SettingRow label="SMTP Port">
            <input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} style={{ ...inputStyle, width: 100 }} />
          </SettingRow>
          <SettingRow label="SMTP Username / From Email">
            <input type="email" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} style={{ ...inputStyle, minWidth: 240 }} />
          </SettingRow>
          <SettingRow label="SMTP Password" sub="Leave blank to keep existing password">
            <input type="password" placeholder="••••••••" style={{ ...inputStyle, minWidth: 240 }} />
          </SettingRow>
          {saveBtn('SMTP')}
        </Section>

        {/* System */}
        <Section icon={<FiGlobe />} title="System & Maintenance" accent="#EF4444">
          <SettingRow label="User Signups Enabled" sub="Allow new users to register on the platform">
            <Toggle value={signupsEnabled} onChange={setSignupsEnabled} />
          </SettingRow>
          <SettingRow label="Maintenance Mode" sub="⚠️ Shows a maintenance banner to all non-admin users">
            <Toggle value={maintenanceMode} onChange={setMaintenanceMode} />
          </SettingRow>
          {maintenanceMode && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#EF4444', fontWeight: 600, margin: '0.5rem 0' }}>
              ⚠️ Maintenance mode is ON. Non-admin users will see a maintenance page.
            </div>
          )}
          {saveBtn('System')}
        </Section>

      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
