import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './Dashboard/cards/LoadingSkeleton';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 3.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div className="spinner" style={{ margin: '0 auto 1.25rem', width: '42px', height: '42px' }} />
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
            Verifying Secure Session...
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', display: 'block', marginTop: '0.35rem' }}>
            SkillTrack AI Security Engine
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default ProtectedRoute;
