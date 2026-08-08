import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UpgradeModal from '../common/UpgradeModal';

export const PremiumRoute = ({ children, featureName = 'Premium Feature' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);

  if (loading) {
    return (
      <div className="route-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isPremium = user?.is_premium || user?.membership_type === 'premium';

  if (!isPremium) {
    return (
      <>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName={featureName}
        />
        {/* Render base page blurred or prompt fallback */}
        <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
      </>
    );
  }

  return children;
};

export default PremiumRoute;
