import { supabase, isSupabaseConfigured } from './supabaseClient';
import { tokenStorage } from './api';

const EMPTY_PROFILE = {
  id: null,
  email: '',
  name: '',
  username: '',
  role: 'student',
  avatar: '',
  avatar_url: '',
  phone: '',
  location: '',
  bio: '',
  current_status: '',
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
  website: '',
  resume_file_name: '',
  resume_file_url: '',
  profile_completion_pct: 0,
  skills: [],
  created_at: null,
  updated_at: null,
};

const removeUndefined = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined
    )
  );

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) => String(skill).trim())
    .filter(Boolean);
};

const formatCandidateProfile = (
  profileData,
  candidateData
) => {
  return {
    ...EMPTY_PROFILE,

    id:
      profileData?.id ||
      candidateData?.id ||
      null,

    email: profileData?.email || '',
    name: profileData?.name || '',
    role: 'student',

    avatar_url: profileData?.avatar_url || '',
    avatar: profileData?.avatar_url || '',

    username: candidateData?.username || '',
    phone: candidateData?.phone || '',
    location: candidateData?.location || '',
    bio: candidateData?.bio || '',
    current_status:
      candidateData?.current_status || '',

    github_url: candidateData?.github_url || '',
    linkedin_url: candidateData?.linkedin_url || '',
    portfolio_url:
      candidateData?.portfolio_url || '',
    website: candidateData?.website || '',

    resume_file_name:
      candidateData?.resume_file_name || '',
    resume_file_url:
      candidateData?.resume_file_url || '',

    profile_completion_pct: Number(
      candidateData?.profile_completion_pct || 0
    ),

    skills: normalizeSkills(candidateData?.skills),

    created_at:
      candidateData?.created_at ||
      profileData?.created_at ||
      null,

    updated_at:
      candidateData?.updated_at ||
      profileData?.updated_at ||
      null,
  };
};

const formatRecruiterProfile = (
  profileData,
  recruiterData
) => {
  return {
    ...EMPTY_PROFILE,

    id:
      profileData?.id ||
      recruiterData?.id ||
      null,

    email: profileData?.email || '',
    name: profileData?.name || '',
    role: 'recruiter',

    avatar_url: profileData?.avatar_url || '',
    avatar: profileData?.avatar_url || '',

    username: recruiterData?.username || '',
    phone: recruiterData?.phone || '',
    location: recruiterData?.location || '',
    bio: recruiterData?.bio || '',
    company: recruiterData?.company || '',

    approval_status:
      recruiterData?.approval_status || 'pending',

    is_approved:
      recruiterData?.is_approved ?? false,

    linkedin_url:
      recruiterData?.linkedin_url || '',

    website: recruiterData?.website || '',

    created_at:
      recruiterData?.created_at ||
      profileData?.created_at ||
      null,

    updated_at:
      recruiterData?.updated_at ||
      profileData?.updated_at ||
      null,
  };
};

export const userService = {
  /**
   * Return the authenticated user's ID.
   */
  async getActiveAuthUserId(providedId) {
    if (providedId) {
      return providedId;
    }

    if (isSupabaseConfigured() && supabase) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user?.id) {
        return user.id;
      }
    }

    return tokenStorage.user?.id || null;
  },

  /**
   * Get the candidate profile.
   *
   * The following tables use the same ID:
   * - auth.users.id
   * - profiles.id
   * - candidate_profiles.id
   */
  async getCandidateProfile(userId) {
    const activeUserId =
      await this.getActiveAuthUserId(userId);

    if (!activeUserId) {
      return null;
    }

    /*
     * Local-storage fallback.
     */
    if (!isSupabaseConfigured() || !supabase) {
      const localUser = tokenStorage.user || {};

      return {
        ...EMPTY_PROFILE,

        id: activeUserId,
        email: localUser.email || '',
        name: localUser.name || '',
        username: localUser.username || '',
        role: 'student',

        avatar:
          localUser.avatar ||
          localUser.avatar_url ||
          '',

        avatar_url:
          localUser.avatar_url ||
          localUser.avatar ||
          '',

        phone: localUser.phone || '',
        location: localUser.location || '',
        bio: localUser.bio || '',

        current_status:
          localUser.current_status || '',

        github_url: localUser.github_url || '',
        linkedin_url:
          localUser.linkedin_url || '',

        portfolio_url:
          localUser.portfolio_url || '',

        website: localUser.website || '',

        resume_file_name:
          localUser.resume_file_name || '',

        resume_file_url:
          localUser.resume_file_url || '',

        profile_completion_pct: Number(
          localUser.profile_completion_pct || 0
        ),

        skills: normalizeSkills(localUser.skills),

        created_at: localUser.created_at || null,
        updated_at: localUser.updated_at || null,
      };
    }

    const [
      profileResult,
      candidateResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle(),

      supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle(),
    ]);

    const {
      data: profileData,
      error: profileError,
    } = profileResult;

    const {
      data: candidateData,
      error: candidateError,
    } = candidateResult;

    if (profileError) {
      throw new Error(
        `Failed to load base profile: ${profileError.message}`
      );
    }

    if (candidateError) {
      throw new Error(
        `Failed to load candidate profile: ${candidateError.message}`
      );
    }

    if (!profileData && !candidateData) {
      return null;
    }

    return formatCandidateProfile(
      profileData,
      candidateData
    );
  },

  /**
   * Get the recruiter profile.
   */
  async getRecruiterProfile(userId) {
    const activeUserId =
      await this.getActiveAuthUserId(userId);

    if (!activeUserId) {
      return null;
    }

    /*
     * Local-storage fallback.
     */
    if (!isSupabaseConfigured() || !supabase) {
      const localUser = tokenStorage.user || {};

      return {
        ...EMPTY_PROFILE,

        id: activeUserId,
        email: localUser.email || '',
        name: localUser.name || '',
        role: 'recruiter',

        avatar_url:
          localUser.avatar_url ||
          localUser.avatar ||
          '',

        avatar:
          localUser.avatar ||
          localUser.avatar_url ||
          '',

        username: localUser.username || '',
        phone: localUser.phone || '',
        location: localUser.location || '',
        bio: localUser.bio || '',
        company: localUser.company || '',

        approval_status:
          localUser.approval_status || 'pending',

        is_approved:
          localUser.is_approved ?? false,

        linkedin_url:
          localUser.linkedin_url || '',

        website: localUser.website || '',

        created_at: localUser.created_at || null,
        updated_at: localUser.updated_at || null,
      };
    }

    const [
      profileResult,
      recruiterResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle(),

      supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('id', activeUserId)
        .maybeSingle(),
    ]);

    const {
      data: profileData,
      error: profileError,
    } = profileResult;

    const {
      data: recruiterData,
      error: recruiterError,
    } = recruiterResult;

    if (profileError) {
      throw new Error(
        `Failed to load base profile: ${profileError.message}`
      );
    }

    if (recruiterError) {
      throw new Error(
        `Failed to load recruiter profile: ${recruiterError.message}`
      );
    }

    if (!profileData && !recruiterData) {
      return null;
    }

    return formatRecruiterProfile(
      profileData,
      recruiterData
    );
  },

  /**
   * Load a profile based on the role.
   */
  async getProfile(userId, role) {
    const userRole =
      role ||
      tokenStorage.user?.role ||
      'student';

    if (userRole === 'recruiter') {
      return this.getRecruiterProfile(userId);
    }

    return this.getCandidateProfile(userId);
  },

  /**
   * Update the base profiles table.
   */
  async updateBaseProfile(userId, profileData) {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    const basePayload = removeUndefined({
      name: profileData.name,
      email: profileData.email,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (!Object.keys(basePayload).length) {
      return null;
    }

    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          ...basePayload,
        },
        {
          onConflict: 'id',
        }
      )
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to update profiles table: ${error.message}`
      );
    }

    return data;
  },

  /**
   * Update a candidate profile.
   */
  async updateCandidateProfile(userId, profileData) {
    const activeUserId =
      await this.getActiveAuthUserId(userId);

    if (!activeUserId) {
      throw new Error(
        'Authenticated user ID was not found'
      );
    }

    const now = new Date().toISOString();

    const candidatePayload = removeUndefined({
      id: activeUserId,

      username: profileData.username ?? '',
      phone: profileData.phone ?? '',
      location: profileData.location ?? '',
      bio: profileData.bio ?? '',

      current_status:
        profileData.current_status ?? '',

      github_url:
        profileData.github_url ?? '',

      linkedin_url:
        profileData.linkedin_url ?? '',

      portfolio_url:
        profileData.portfolio_url ?? '',

      website: profileData.website ?? '',

      resume_file_name:
        profileData.resume_file_name ?? '',

      resume_file_url:
        profileData.resume_file_url ??
        profileData.resume_url ??
        '',

      profile_completion_pct: Number(
        profileData.profile_completion_pct || 0
      ),

      skills: normalizeSkills(profileData.skills),
      updated_at: now,
    });

    /*
     * Local-storage mode.
     */
    if (!isSupabaseConfigured() || !supabase) {
      const currentUser = tokenStorage.user || {};

      const updatedUser = {
        ...currentUser,
        ...candidatePayload,

        id: activeUserId,
        name:
          profileData.name ??
          currentUser.name ??
          '',

        email:
          profileData.email ??
          currentUser.email ??
          '',

        avatar_url:
          profileData.avatar_url ??
          currentUser.avatar_url ??
          '',

        avatar:
          profileData.avatar_url ??
          currentUser.avatar ??
          currentUser.avatar_url ??
          '',

        role: 'student',
      };

      tokenStorage.set({
        user: updatedUser,
        access: tokenStorage.access,
      });

      return updatedUser;
    }

    /*
     * Save the base profile.
     */
    await this.updateBaseProfile(
      activeUserId,
      profileData
    );

    /*
     * Save candidate-specific fields.
     *
     * `id` is the conflict key and must equal auth.users.id.
     */
    const {
      data: candidateData,
      error: candidateError,
    } = await supabase
      .from('candidate_profiles')
      .upsert(candidatePayload, {
        onConflict: 'id',
      })
      .select('*')
      .maybeSingle();

    if (candidateError) {
      throw new Error(
        `Failed to update candidate profile: ${candidateError.message}`
      );
    }

    if (!candidateData) {
      throw new Error(
        'Candidate profile was not returned after saving'
      );
    }

    /*
     * Reload both tables so the returned object is normalized.
     */
    const savedProfile =
      await this.getCandidateProfile(activeUserId);

    if (!savedProfile) {
      throw new Error(
        'Profile saved but could not be loaded'
      );
    }

    const currentUser = tokenStorage.user || {};

    tokenStorage.set({
      user: {
        ...currentUser,
        ...savedProfile,
      },
      access: tokenStorage.access,
    });

    return savedProfile;
  },

  /**
   * Update a recruiter profile.
   */
  async updateRecruiterProfile(userId, profileData) {
    const activeUserId =
      await this.getActiveAuthUserId(userId);

    if (!activeUserId) {
      throw new Error(
        'Authenticated user ID was not found'
      );
    }

    const now = new Date().toISOString();

    const recruiterPayload = removeUndefined({
      id: activeUserId,

      username: profileData.username ?? '',
      phone: profileData.phone ?? '',
      location: profileData.location ?? '',
      bio: profileData.bio ?? '',

      company:
        profileData.company ??
        profileData.company_name ??
        '',

      linkedin_url:
        profileData.linkedin_url ??
        profileData.linkedin ??
        '',

      website: profileData.website ?? '',

      approval_status:
        profileData.approval_status,

      is_approved:
        profileData.is_approved,

      updated_at: now,
    });

    /*
     * Local-storage mode.
     */
    if (!isSupabaseConfigured() || !supabase) {
      const currentUser = tokenStorage.user || {};

      const updatedUser = {
        ...currentUser,
        ...recruiterPayload,

        id: activeUserId,
        name:
          profileData.name ??
          currentUser.name ??
          '',

        email:
          profileData.email ??
          currentUser.email ??
          '',

        avatar_url:
          profileData.avatar_url ??
          currentUser.avatar_url ??
          '',

        avatar:
          profileData.avatar_url ??
          currentUser.avatar ??
          currentUser.avatar_url ??
          '',

        role: 'recruiter',
      };

      tokenStorage.set({
        user: updatedUser,
        access: tokenStorage.access,
      });

      return updatedUser;
    }

    /*
     * Save the base profile.
     */
    await this.updateBaseProfile(
      activeUserId,
      profileData
    );

    /*
     * Save recruiter-specific fields.
     */
    const {
      data: recruiterData,
      error: recruiterError,
    } = await supabase
      .from('recruiter_profiles')
      .upsert(recruiterPayload, {
        onConflict: 'id',
      })
      .select('*')
      .maybeSingle();

    if (recruiterError) {
      throw new Error(
        `Failed to update recruiter profile: ${recruiterError.message}`
      );
    }

    if (!recruiterData) {
      throw new Error(
        'Recruiter profile was not returned after saving'
      );
    }

    const savedProfile =
      await this.getRecruiterProfile(activeUserId);

    if (!savedProfile) {
      throw new Error(
        'Recruiter profile saved but could not be loaded'
      );
    }

    const currentUser = tokenStorage.user || {};

    tokenStorage.set({
      user: {
        ...currentUser,
        ...savedProfile,
      },
      access: tokenStorage.access,
    });

    return savedProfile;
  },

  /**
   * Generic profile update function.
   */
  async updateProfile(userId, profileData) {
    if (
      typeof userId === 'object' &&
      !profileData
    ) {
      profileData = userId;
      userId = profileData.id;
    }

    const userRole =
      profileData?.role ||
      tokenStorage.user?.role ||
      'student';

    if (userRole === 'recruiter') {
      return this.updateRecruiterProfile(
        userId,
        profileData
      );
    }

    return this.updateCandidateProfile(
      userId,
      profileData
    );
  },

  /**
   * Get all recruiters.
   */
  async getAllRecruiters() {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    const {
      data,
      error,
    } = await supabase
      .from('recruiter_profiles')
      .select(`
        *,
        profiles!inner(
          name,
          email,
          avatar_url
        )
      `)
      .order('updated_at', {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load recruiters: ${error.message}`
      );
    }

    return (data || []).map((recruiter) => ({
      id: recruiter.id,

      name:
        recruiter.profiles?.name ||
        recruiter.username ||
        'Recruiter',

      email:
        recruiter.profiles?.email || '',

      company:
        recruiter.company || '',

      companyLogo:
        recruiter.profiles?.avatar_url || '',

      avatar:
        recruiter.profiles?.avatar_url || '',

      designation: 'Recruiter',
      experience: '',
      industry: '',

      location:
        recruiter.location || '',

      companySize: '',

      linkedin:
        recruiter.linkedin_url || '',

      website:
        recruiter.website || '',

      techStack: [],
      interviewTypes: [],

      rating: null,
      reviewsCount: 0,
      completedInterviews: 0,

      isVerified:
        recruiter.is_approved ?? false,

      isPremiumRecruiter: false,
      hourlyFee: null,
    }));
  },
};

export default userService;