import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google's official GSI button and wires its credential response
 * straight into AuthContext.googleLogin -> POST /google-login on the backend.
 *
 * Requires <script src="https://accounts.google.com/gsi/client" async defer>
 * in index.html, and VITE_GOOGLE_CLIENT_ID set in the frontend .env.
 */
const GoogleButton = ({ label = 'Continue with Google' }) => {
  const buttonRef = useRef(null);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(check);
      }
    }, 150);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          await googleLogin(response.credential);
          toast.success('Signed in with Google.');
          navigate('/');
        } catch (err) {
          toast.error(err?.response?.data?.detail || 'Google sign-in failed.');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    });
  }, [scriptReady, googleLogin, navigate]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" className="google-btn google-btn--disabled" disabled title="Set VITE_GOOGLE_CLIENT_ID to enable">
        {label} (not configured)
      </button>
    );
  }

  return <div ref={buttonRef} className="google-btn-mount" />;
};

export default GoogleButton;
