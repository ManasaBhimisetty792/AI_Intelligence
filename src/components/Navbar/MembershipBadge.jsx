import React from 'react';
import { FaCrown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './membershipBadge.css';

export const MembershipBadge = () => {
  const { user } = useAuth();
  
  // Determine if user has premium subscription
  const isPremium = user?.membership_tier === 'premium' || 
                    user?.user_metadata?.subscription_tier === 'premium' ||
                    user?.is_premium === true;

  if (isPremium) {
    return (
      <div className="membership-badge premium" title="Premium Membership Active">
        <span className="membership-badge-shine" />
        <FaCrown className="crown-icon" />
        <span>PREMIUM USER</span>
      </div>
    );
  }

  return (
    <div className="membership-badge free" title="Free Membership">
      <span>FREE USER</span>
    </div>
  );
};

export default MembershipBadge;
