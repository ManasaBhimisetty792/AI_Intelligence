import React from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';

/**
 * Logo Component — Single source of truth for branding logo.
 * Editing this file updates the logo across Navbar, Footer, Auth pages, etc.
 */
export const Logo = ({ light = false, className = '' }) => (
  <Link to="/" className={`navbar-brand${light ? ' navbar-brand--light' : ''} ${className}`} aria-label="SkillTrack AI Home">
    <div className="brand-icon-wrapper" aria-hidden="true">
      <HiSparkles className="brand-sparkle" />
    </div>
    <span className="brand-text">
      SkillTrack <span className="brand-accent">AI</span>
    </span>
  </Link>
);

export default Logo;
