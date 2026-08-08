import React from 'react';
import { motion } from 'framer-motion';

export const ProfileCard = ({ user, completion = 85 }) => {
  return (
    <div className="glass-card profile-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={user?.name || 'User Avatar'}
          style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }}
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{user?.name || 'Candidate Name'}</h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{user?.email || 'user@skilltrack.ai'}</span>
          <div style={{ marginTop: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '2px' }}>
              <span>Profile Strength</span>
              <span>{completion}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(226, 232, 240, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
