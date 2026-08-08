import { supabase, isSupabaseConfigured } from './supabaseClient';
import { tokenStorage } from './api';

const MOCK_USERS = {
  student: {
    id: 'usr_student_101',
    email: 'alex.student@skilltrack.ai',
    name: 'Alex Johnson',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Computer Science Major',
    university: 'Stanford University',
    created_at: new Date().toISOString(),
  },
  recruiter: {
    id: 'usr_recruiter_202',
    email: 'sarah.recruiter@techcorp.com',
    name: 'Sarah Jenkins',
    role: 'recruiter',
    company: 'Nexus Tech Global',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    title: 'Senior Talent Acquisition Lead',
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 'usr_admin_303',
    email: 'admin@skilltrack.ai',
    name: 'David Vance',
    role: 'admin',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Head of Operations & Security',
    created_at: new Date().toISOString(),
  },
};

const getErrorMessage = (error) => {
  return (
    error?.message ||
    error?.details ||
    error?.hint ||
    'Unknown Supabase error.'
  );
};

const logSupabaseError = (label, error, payload = null) => {
  console.error(label, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    payload,
  });
};

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured()) {
      const user = tokenStorage.user;
      return user
        ? {
            user,
            access_token: tokenStorage.access || '',
          }
        : null;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    return data?.session || null;
  },

  async refreshSession() {
    if (!isSupabaseConfigured()) {
      return this.getSession();
    }

    const { data, error } =
      await supabase.auth.refreshSession();

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    return data?.session || null;
  },

  async syncUserProfile(user) {
    if (
      !user?.id ||
      user.role === 'admin' ||
      user.email === 'admin@skilltrack.ai'
    ) {
      return null;
    }

    if (!isSupabaseConfigured()) {
      return user;
    }

    const now = new Date().toISOString();
    const role = user.role || 'student';

    const baseProfile = {
      id: user.id,
      email: user.email,
      name:
        user.name ||
        user.full_name ||
        user.email?.split('@')[0] ||
        'User',
      role,
      avatar_url:
        user.avatar_url ||
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || 'User'
        )}`,
      updated_at: now,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(baseProfile, {
        onConflict: 'id',
      });

    if (profileError) {
      logSupabaseError(
        'profiles upsert failed:',
        profileError,
        baseProfile
      );
    }

    if (role === 'recruiter') {
      const recruiterData = {
        id: user.id,
        company:
          user.company ||
          user.company_name ||
          '',
        linkedin_url:
          user.linkedin_url ||
          user.linkedinUrl ||
          '',
        approval_status:
          user.approval_status ||
          'pending',
        is_approved:
          user.is_approved ?? false,
        website: user.website || '',
        updated_at: now,
      };

      const {
        data,
        error,
      } = await supabase
        .from('recruiter_profiles')
        .upsert(recruiterData, {
          onConflict: 'id',
        })
        .select()
        .maybeSingle();

      if (error) {
        logSupabaseError(
          'recruiter_profiles upsert failed:',
          error,
          recruiterData
        );
        return null;
      }

      return data;
    }

    const candidateData = {
      id: user.id,
      phone: user.phone || '',
      linkedin_url:
        user.linkedin_url ||
        user.linkedinUrl ||
        '',
      website: user.website || '',
      updated_at: now,
    };

    const {
      data,
      error,
    } = await supabase
      .from('candidate_profiles')
      .upsert(candidateData, {
        onConflict: 'id',
      })
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError(
        'candidate_profiles upsert failed:',
        error,
        candidateData
      );
      return null;
    }

    return data;
  },

  async getCurrentUser() {
    const localUser = tokenStorage.user;

    if (
      localUser &&
      (localUser.role === 'admin' ||
        localUser.email === 'admin@skilltrack.ai')
    ) {
      return MOCK_USERS.admin;
    }

    if (!isSupabaseConfigured()) {
      return localUser || null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return localUser || null;
    }

    if (
      user.email === 'admin@skilltrack.ai' ||
      user.user_metadata?.role === 'admin'
    ) {
      return MOCK_USERS.admin;
    }

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      logSupabaseError(
        'profiles select failed:',
        profileError
      );
    }

    const role =
      profileData?.role ||
      user.user_metadata?.role ||
      localUser?.role ||
      'student';

    let roleProfile = null;

    if (role === 'recruiter') {
      const {
        data,
        error: recruiterError,
      } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (recruiterError) {
        logSupabaseError(
          'recruiter_profiles select failed:',
          recruiterError
        );
      }

      roleProfile = data || null;
    } else {
      const {
        data,
        error: candidateError,
      } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (candidateError) {
        logSupabaseError(
          'candidate_profiles select failed:',
          candidateError
        );
      }

      roleProfile = data || null;
    }

    const isPremium = Boolean(
      profileData?.is_premium ||
        roleProfile?.is_premium ||
        user.user_metadata?.is_premium ||
        localUser?.is_premium
    );

    const formattedUser = {
      id: user.id,
      email: user.email,
      name:
        profileData?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User',
      role,
      avatar_url:
        profileData?.avatar_url ||
        user.user_metadata?.avatar_url ||
        '',
      avatar:
        profileData?.avatar_url ||
        user.user_metadata?.avatar_url ||
        '',
      phone: roleProfile?.phone || '',
      linkedin_url: roleProfile?.linkedin_url || '',
      website: roleProfile?.website || '',
      bio: roleProfile?.bio || '',
      location: roleProfile?.location || '',
      is_premium: isPremium,
      membership_type:
        profileData?.membership_type ||
        roleProfile?.membership_type ||
        (isPremium ? 'premium' : 'free'),
      current_plan:
        profileData?.current_plan ||
        roleProfile?.current_plan ||
        (isPremium ? 'Student Premium' : 'Free Plan'),
      subscription_status:
        profileData?.subscription_status ||
        roleProfile?.subscription_status ||
        (isPremium ? 'active' : 'inactive'),
      company:
        roleProfile?.company ||
        user.user_metadata?.company ||
        '',
      approval_status:
        roleProfile?.approval_status ||
        (role === 'recruiter' ? 'pending' : 'approved'),
      is_approved:
        roleProfile?.is_approved ??
        (role !== 'recruiter'),
      created_at:
        profileData?.created_at ||
        user.created_at,
      updated_at:
        profileData?.updated_at ||
        user.updated_at ||
        user.created_at,
    };

    const session = await this.getSession();

    tokenStorage.set({
      user: formattedUser,
      access: session?.access_token || '',
    });

    return formattedUser;
  },

  async signUp({
    name,
    email,
    password,
    role = 'student',
    company = '',
    linkedinUrl = '',
  }) {
    if (
      role === 'admin' ||
      email === 'admin@skilltrack.ai'
    ) {
      throw new Error(
        'Admin signup is disabled. Use direct Admin login.'
      );
    }

    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured.'
      );
    }

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          company,
          linkedin_url: linkedinUrl,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=4F46E5&color=fff`,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error(
        'Supabase did not return a user.'
      );
    }

    if (!data.session) {
      return {
        id: data.user.id,
        email,
        name,
        role,
        company,
        linkedin_url: linkedinUrl,
        approval_status:
          role === 'recruiter'
            ? 'pending'
            : 'approved',
        is_approved: role !== 'recruiter',
        created_at: data.user.created_at,
      };
    }

    const newUser = await this.getCurrentUser();

    if (!newUser) {
      throw new Error(
        'Unable to load the new user profile.'
      );
    }

    return newUser;
  },

  async signup(data) {
    return this.signUp(data);
  },

  async signIn({
    email,
    password,
    role = 'student',
  }) {
    if (
      email === 'admin@skilltrack.ai' &&
      password === 'Admin@123'
    ) {
      const adminUser = MOCK_USERS.admin;

      tokenStorage.set({
        user: adminUser,
        access: '',
      });

      return adminUser;
    }

    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured.'
      );
    }

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.user || !data?.session) {
      throw new Error(
        'Supabase login did not return a valid session.'
      );
    }

    const authMeta = data.user.user_metadata || {};
    const resolvedRole =
      authMeta.role || role;
    const resolvedName =
      authMeta.name ||
      authMeta.full_name ||
      email.split('@')[0];

    tokenStorage.set({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: resolvedName,
        role: resolvedRole,
      },
      access: data.session.access_token,
    });

    const freshUser = await this.getCurrentUser();

    if (!freshUser) {
      throw new Error(
        'Unable to load the authenticated user profile.'
      );
    }

    return freshUser;
  },

  async login(data) {
    return this.signIn(data);
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured.'
      );
    }

    const {
      data,
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async googleLogin() {
    return this.signInWithGoogle();
  },

  async forgotPassword(email) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured.'
      );
    }

    const {
      data,
      error,
    } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async resetPassword(newPassword) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured.'
      );
    }

    const {
      data,
      error,
    } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    }

    tokenStorage.clear();
  },

  async logout() {
    return this.signOut();
  },

  getMockUserByRole(role) {
    return MOCK_USERS[role] || MOCK_USERS.student;
  },
};

export default authService;