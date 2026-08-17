import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiUser, FiLogOut, FiShield, FiBriefcase, FiChevronDown, FiAward, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from './cards/Breadcrumb';
import ThemeToggle from '../common/ThemeToggle';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

export const Topbar = ({
  title,
  onMenuToggle,
  onToggleSidebar,
  sidebarOpen = true,
  mobileOpen = false,
}) => {
  const { user, role: rawRole, logout } = useAuth();
  const role = typeof rawRole === 'string' ? rawRole : 'student';
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const handleSidebarToggle = onToggleSidebar || onMenuToggle;

  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch (err) {
      console.warn('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useRealtime(['notifications', 'interview_requests'], fetchUnread);

  const handleNotificationClick = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (e) {}
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isPremium = Boolean(
    user?.is_premium ||
    user?.membership_type === 'premium' ||
    user?.current_plan === 'Student Premium' ||
    user?.current_plan === 'premium'
  );

  return (
    <header className="dashboard-topbar glass-panel">
      <div className="topbar-left">
        <button
          onClick={handleSidebarToggle}
          className="topbar-sidebar-toggle-btn"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FiMenu />
        </button>
        <div>
          <Breadcrumb />
          <h1 className="topbar-page-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Student Membership Status Tag (Free User / Premium User) */}
        {role === 'student' && (
          <div className="topbar-membership-tag">
            {isPremium ? (
              <span className="membership-pill premium" title="Premium Membership Active">
                <FiAward className="pill-icon" /> Premium User
              </span>
            ) : (
              <span className="membership-pill free" title="Free Account Plan">
                <FiZap className="pill-icon" /> Free User
              </span>
            )}
          </div>
        )}

        {/* Notifications Icon with Dynamic Unread Badge */}
        <Link
          to={`/${role}/notifications`}
          onClick={handleNotificationClick}
          className="icon-btn-glass"
          aria-label="View notifications"
          title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          style={{ position: 'relative' }}
        >
          <FiBell style={{ fontSize: '1.1rem' }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                minWidth: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                border: '2px solid var(--color-surface)',
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Dark Mode Toggle */}
        <ThemeToggle size="small" />

        {/* Profile Dropdown Container */}
        <div className="profile-dropdown-container" style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="topbar-user-btn"
            aria-expanded={profileDropdownOpen}
            aria-label="User Profile Menu"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="avatar-img"
            />
            <div className="user-details-sm">
              <span className="user-name-sm">{user?.name || 'Alex Johnson'}</span>
              {role === 'student' && (
                <span className="user-role-sm">
                  {isPremium ? '★ Premium' : 'Free Plan'}
                </span>
              )}
            </div>
            <FiChevronDown style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }} />
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu glass-card">
              <div className="dropdown-header">
                <p className="dropdown-user-name">{user?.name || 'Alex Johnson'}</p>
                <p className="dropdown-user-email">{user?.email || 'alex@skilltrack.ai'}</p>
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span className="badge-glass" style={{ fontSize: '0.68rem' }}>
                    {role?.toUpperCase()}
                  </span>
                  <span className={`membership-pill ${isPremium ? 'premium' : 'free'}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                    {isPremium ? '👑 Premium' : '⚡ Free'}
                  </span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link
                to={`/${role}/profile`}
                onClick={() => setProfileDropdownOpen(false)}
                className="dropdown-item"
              >
                <FiUser /> Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item dropdown-logout"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
 