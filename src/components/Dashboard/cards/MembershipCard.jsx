import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiZap, FiArrowRight, FiClock, FiCreditCard } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import paymentService from '../../../services/paymentService';
import PremiumBadge from '../../common/PremiumBadge';

export const MembershipCard = ({ user }) => {
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState({
    isPremium: Boolean(user?.is_premium || user?.membership_type === 'premium'),
    currentPlan: user?.current_plan || (user?.is_premium ? 'Student Premium' : 'Free Plan'),
    status: 'active',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadStatus() {
      if (user?.id) {
        const data = await paymentService.getMembershipStatus(user.id);
        if (mounted) {
          setStatusData(data);
          setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    }
    loadStatus();
    return () => { mounted = false; };
  }, [user]);

  const isPremium = statusData.isPremium || user?.is_premium;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        borderRadius: '1.25rem',
        background: isPremium
          ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(88, 28, 135, 0.4) 100%)'
          : 'rgba(255, 255, 255, 0.03)',
        border: isPremium
          ? '1px solid rgba(168, 85, 247, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Glow */}
      {isPremium && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '140px',
            height: '140px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiShield style={{ color: isPremium ? '#c084fc' : 'var(--color-muted)', fontSize: '1.3rem' }} />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Membership Status</h4>
        </div>
        {isPremium ? (
          <PremiumBadge text="👑 Premium User" size="small" />
        ) : (
          <span className="badge-glass" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)' }}>
            Free Tier
          </span>
        )}
      </div>

      {isPremium ? (
        <>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '0.85rem', marginBottom: '1.2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Plan:</span>
              <strong style={{ color: '#fff' }}>{statusData.currentPlan || 'Student Premium'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Status:</span>
              <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiCheckCircle /> Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Access:</span>
              <span style={{ color: '#c084fc', fontWeight: 600 }}>Unlimited AI Drills & ATS</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => navigate('/student/payments')}
              className="btn-glass"
              style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <FiCreditCard /> Payment History
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="btn-glass"
              style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' }}
            >
              Manage Plan
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.2rem', lineHeight: 1.5 }}>
            You are currently on the <strong>Free Plan</strong>. Upgrade to unlock unlimited AI interviews, full voice NLP analysis, and priority recruiter matching.
          </p>

          <button
            onClick={() => navigate('/pricing')}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
            }}
          >
            Upgrade to Premium <FiArrowRight />
          </button>
        </>
      )}
    </div>
  );
};

export default MembershipCard;
