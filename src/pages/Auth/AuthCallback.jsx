import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthCallback — handles the redirect after Google OAuth.
 *
 * Supabase resolves the access token from the URL hash fragment,
 * which fires onAuthStateChange (SIGNED_IN) in AuthContext.
 * AuthContext will then call getCurrentUser() -> syncUserProfile()
 * to persist the user into Supabase profiles table.
 *
 * This page simply waits for the user state to be populated,
 * then redirects to the correct dashboard by role.
 */
const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const redirected = useRef(false);

  useEffect(() => {
    // Wait until loading is resolved and user is available
    if (!loading && !redirected.current) {
      redirected.current = true;
      if (user) {
        // Business requirement: Always redirect to Landing Page ('/') after authentication
        navigate('/', { replace: true });
      } else {
        // No user found after OAuth — something went wrong, go to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg, #0f0f1a)',
      }}
    >
      <div
        style={{
          padding: '2.5rem 3.5rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="spinner"
          style={{ margin: '0 auto 1.25rem', width: '44px', height: '44px' }}
        />
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary, #6366f1)', fontSize: '1rem' }}>
          Completing Sign-In...
        </p>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-muted, #94a3b8)',
            display: 'block',
            marginTop: '0.4rem',
          }}
        >
          Syncing your profile with SkillTrack AI
        </span>
      </div>
    </div>
  );
};

export default AuthCallback;
