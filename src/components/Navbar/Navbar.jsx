import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiUser,
  FiBell,
  FiGrid,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { NAV_LINKS } from '../../constants/routes';
import ThemeToggle from '../common/ThemeToggle';
import './navbar.css';

/* ─────────────────────────────────────────────
   Logo Component
───────────────────────────────────────────── */
export const Logo = ({ light = false }) => (
  <Link to="/" className={`navbar-brand${light ? ' navbar-brand--light' : ''}`} aria-label="SkillTrack AI Home">
    <div className="brand-icon-wrapper" aria-hidden="true">
      <HiSparkles className="brand-sparkle" />
    </div>
    <span className="brand-text">
      SkillTrack <span className="brand-accent">AI</span>
    </span>
  </Link>
);

/* ─────────────────────────────────────────────
   Main Navbar Component
───────────────────────────────────────────── */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, role, logout } = useAuth();

  /* Scroll listener */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const getDashboardPath = () => {
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header
        className={`navbar-header${isScrolled ? ' scrolled' : ' transparent'}`}
        role="banner"
      >
        <div className="container navbar-container">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-item${isActive(link.path) ? ' active' : ''}`}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            <ThemeToggle size="small" />
            {isAuthenticated ? (
              /* ── Authenticated: Topbar-style avatar + name + chevron ── */
              <div className="profile-dropdown-container" ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="topbar-user-btn"
                  aria-label="User Profile Menu"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(user?.name || 'User') +
                        '&background=4F46E5&color=fff&size=80'
                    }
                    alt={user?.name || 'User'}
                    className="avatar-img"
                  />
                  <div className="user-details-sm">
                    <span className="user-name-sm">{user?.name || 'User'}</span>
                    <span className="user-role-sm">{role?.toUpperCase()}</span>
                  </div>
                  <FiChevronDown style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="profile-dropdown-menu glass-card"
                      role="menu"
                    >
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">{user?.name || 'User'}</p>
                        <p className="dropdown-user-email">{user?.email}</p>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <span className="badge-glass" style={{ fontSize: '0.68rem' }}>
                            {role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="dropdown-item"
                        role="menuitem"
                      >
                        <FiGrid aria-hidden="true" /> Dashboard
                      </Link>
                      <Link
                        to={`/${role}/profile`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="dropdown-item"
                        role="menuitem"
                      >
                        <FiUser aria-hidden="true" /> Profile Settings
                      </Link>
                      <div className="dropdown-divider" />
                      <button
                        onClick={handleLogout}
                        className="dropdown-item dropdown-logout"
                        role="menuitem"
                      >
                        <FiLogOut aria-hidden="true" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Guest auth buttons */
              <div className="auth-btns">
                <Link
                  to="/login"
                  className="btn-secondary nav-btn-sm"
                  aria-label="Sign in to your account"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mobile-backdrop"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <motion.div
                id="mobile-nav"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mobile-nav-drawer glass-panel"
                role="dialog"
                aria-label="Mobile navigation"
              >
                <div className="mobile-nav-links">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`mobile-link${isActive(link.path) ? ' active' : ''}`}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="mobile-divider" role="separator" />

                  {isAuthenticated ? (
                    <>
                      <Link to={getDashboardPath()} className="mobile-link mobile-link--icon">
                        <FiGrid aria-hidden="true" />
                        Dashboard ({role === 'recruiter' ? 'Recruiter' : role === 'admin' ? 'Admin' : 'Student'})
                      </Link>
                      <button onClick={handleLogout} className="mobile-link mobile-link--logout">
                        <FiLogOut aria-hidden="true" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="mobile-auth-actions">
                      <Link to="/login" className="btn-secondary w-full">
                        Login
                      </Link>
                      <Link to="/signup" className="btn-primary w-full">
                        Sign Up Free
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
