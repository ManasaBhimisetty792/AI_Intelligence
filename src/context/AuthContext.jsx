import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => tokenStorage.user || null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and listen for session changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured()) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSession(data.session);
            // getCurrentUser reads role from public.profiles, not auth metadata
            const currentUser = await authService.getCurrentUser();
            if (isMounted && currentUser) setUser(currentUser);
          }
        } else {
          const localUser = tokenStorage.user;
          if (isMounted) setUser(localUser || null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    let authSubscription = null;
    if (isSupabaseConfigured()) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Always fetch from public.profiles to get the persisted role
          const freshUser = await authService.getCurrentUser();
          if (isMounted && freshUser) {
            setUser(freshUser);
            if (isMounted) setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      });
      authSubscription = listener;
    }

    return () => {
      isMounted = false;
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, []);

  /**
   * Signup — passes role, name, email, password, company, linkedinUrl to authService.
   * The Supabase trigger creates the base profiles row automatically.
   * authService.signUp then syncs the role-specific row.
   */
  const signup = useCallback(async (form) => {
    setLoading(true);
    try {
      const newUser = await authService.signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role || 'student',
        company: form.company || '',
        linkedinUrl: form.linkedinUrl || '',
      });
      setUser(newUser);
      toast.success(`Welcome aboard, ${newUser.name}! Account created successfully.`);
      return newUser;
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login — after auth, role is read from public.profiles so routing is
   * always driven by the database value, not the tab the user clicked.
   */
  const login = useCallback(async (form) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.signIn({
        email: form.email,
        password: form.password,
        role: form.role || 'student',
      });
      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return loggedInUser;
    } catch (err) {
      toast.error(err.message || 'Login failed. Invalid credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async () => {
    try {
      const result = await authService.signInWithGoogle();
      if (result && result.name) {
        setUser(result);
        toast.success(`Signed in as ${result.name}`);
      }
      return result;
    } catch (err) {
      toast.error(err.message || 'Google authentication failed.');
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const res = await authService.forgotPassword(email);
      toast.success('Password reset link sent to your email.');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset email.');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword) => {
    try {
      const res = await authService.resetPassword(newPassword);
      toast.success('Password updated successfully. Please sign in with your new password.');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    setUser(null);
    setSession(null);
    toast.success('Logged out successfully.');
  }, []);

  const switchRole = useCallback((newRole) => {
    const mockUser = authService.getMockUserByRole(newRole);
    setUser(mockUser);
    tokenStorage.set({ user: mockUser, access: 'mock_token_' + newRole });
    toast.success(`Switched active view to: ${newRole.toUpperCase()}`);
  }, []);

  const value = {
    user,
    session,
    // role is always sourced from user.role (which comes from public.profiles)
    role: user?.role || 'student',
    isAuthenticated: Boolean(user),
    loading,
    signup,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
    logout,
    switchRole,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
};

export default AuthContext;
