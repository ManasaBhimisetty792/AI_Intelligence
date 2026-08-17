import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUser, FiFileText, FiUploadCloud, FiBarChart2, FiVideo,
  FiAward, FiSettings, FiBell, FiCreditCard, FiBriefcase, FiUsers,
  FiCalendar, FiShield, FiCheckCircle, FiLogOut, FiX, FiMenu, FiChevronRight, FiPieChart, FiDollarSign, FiSliders, FiLayers, FiClock
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export const STUDENT_NAV = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <FiGrid />, category: 'Main' },
  { label: 'Profile', path: '/student/profile', icon: <FiUser />, category: 'Main' },
  { label: 'Resume', path: '/student/resume', icon: <FiFileText />, category: 'Career Tools' },
  { label: 'Find Recruiters', path: '/student/recruiters', icon: <FiUsers />, category: 'Career Tools' },
  { label: 'Live Interview Room', path: '/student/live-interview', icon: <FiVideo />, category: 'Interviews' },
  { label: 'Interview History', path: '/student/interview-history', icon: <FiCalendar />, category: 'Interviews' },
  { label: 'Reports', path: '/student/reports', icon: <FiBarChart2 />, category: 'Analytics' },
  { label: 'Notifications', path: '/student/notifications', icon: <FiBell />, category: 'Account' },
];

export const RECRUITER_NAV = [
  { label: 'Dashboard', path: '/recruiter/dashboard', icon: <FiGrid /> },
  { label: 'Profile', path: '/recruiter/profile', icon: <FiUser /> },
  { label: 'Interview Requests', path: '/recruiter/candidates', icon: <FiUsers /> },
  // { label: 'Jobs', path: '/recruiter/jobs', icon: <FiBriefcase /> },
  // { label: 'Applications', path: '/recruiter/applications', icon: <FiFileText /> },
   { label: 'Schedule', path: '/recruiter/schedule', icon: <FiClock /> },
  { label: 'Interviews', path: '/recruiter/interviews', icon: <FiCalendar /> },
  { label: 'Revenue', path: '/recruiter/revenue', icon: <FiDollarSign /> },
  { label: 'Notifications', path: '/recruiter/notifications', icon: <FiBell /> },
  { label: 'Settings', path: '/recruiter/settings', icon: <FiSettings /> },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <FiShield />, isFunctional: true },
  { label: 'Users', path: '/admin/users', icon: <FiUsers />, isFunctional: true },
  { label: 'Recruiters', path: '/admin/recruiter-verification', icon: <FiCheckCircle />, isFunctional: true },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: <FiCreditCard />, isFunctional: true },
  { label: 'Notifications', path: '/admin/notifications', icon: <FiBell />, isFunctional: true },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FiFileText />, isFunctional: true },
  { label: 'System Settings', path: '/admin/settings', icon: <FiSliders />, isFunctional: true },
];

export const Sidebar = ({ sidebarOpen, setSidebarOpen, mobileOpen, setMobileOpen }) => {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = role === 'recruiter' ? RECRUITER_NAV : role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const getRoleBadge = () => {
    if (role === 'recruiter') return { text: 'RECRUITER PORTAL', color: 'badge-glass' };
    if (role === 'admin') return { text: 'PLATFORM ADMIN', color: 'badge-ai' };
    return { text: 'STUDENT PORTAL', color: 'badge-glass' };
  };

  const badgeInfo = getRoleBadge();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar glass-panel ${sidebarOpen ? 'open' : 'collapsed'} ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="navbar-brand sidebar-brand" aria-label="SkillTrack AI Home">
            <div className="brand-icon-wrapper" aria-hidden="true">
              <HiSparkles className="brand-sparkle" />
            </div>
            {sidebarOpen && <span className="brand-text">SkillTrack <span className="brand-accent">AI</span></span>}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar-toggle-btn mobile-only"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-role-indicator">
          <span className={badgeInfo.color}>
            {sidebarOpen ? badgeInfo.text : (role && typeof role === 'string' && role.length ? role[0].toUpperCase() : 'S')}
          </span>
        </div>

        <nav className="sidebar-menu" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                title={item.label}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
                {isActive && sidebarOpen && <FiChevronRight className="sidebar-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-item logout-item" title="Logout">
            <FiLogOut className="sidebar-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
