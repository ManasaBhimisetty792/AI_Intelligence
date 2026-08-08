import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEFAULT_RESUME_BUCKET = 'resumes';
const DEFAULT_SIGNED_URL_DURATION = 60 * 60;

const isHttpUrl = (value = '') => {
  return /^https?:\/\//i.test(value);
};

const firstValue = (...values) => {
  return values.find((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    return true;
  });
};

const getResumeValue = (profile = {}, request = {}) => {
  return firstValue(
    profile.resume_url,
    profile.resume_link,
    profile.cv_url,
    profile.resume_path,
    profile.resume_file_path,
    profile.resume,
    profile.cv,
    request.resume_url,
    request.resume_link,
    request.cv_url,
    request.resume_path
  );
};

const getProfileByUserId = async (userId) => {
  if (!userId) {
    throw new Error('Candidate user ID is missing.');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const { data: candidateProfile, error: candidateProfileError } =
    await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

  if (candidateProfileError) {
    throw candidateProfileError;
  }

  if (candidateProfile) {
    return candidateProfile;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  return profile;
};

const resolveResumeUrl = async ({
  resumeValue,
  bucketName = DEFAULT_RESUME_BUCKET,
  expiresIn = DEFAULT_SIGNED_URL_DURATION,
} = {}) => {
  if (!resumeValue) {
    return '';
  }

  if (isHttpUrl(resumeValue)) {
    return resumeValue;
  }

  if (!isSupabaseConfigured()) {
    return '';
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(resumeValue, expiresIn);

  if (error) {
    throw error;
  }

  return data?.signedUrl || '';
};

const getCandidateDetails = async ({
  studentId,
  request = {},
  bucketName = DEFAULT_RESUME_BUCKET,
  expiresIn = DEFAULT_SIGNED_URL_DURATION,
} = {}) => {
  if (!studentId) {
    throw new Error('Candidate student ID is missing.');
  }

  const profile = await getProfileByUserId(studentId);
  const resumeValue = getResumeValue(profile || {}, request);

  let resumeUrl = '';

  if (resumeValue) {
    resumeUrl = await resolveResumeUrl({
      resumeValue,
      bucketName,
      expiresIn,
    });
  }

  return {
    candidate: {
      ...request,
      ...(profile || {}),
      user_id: studentId,
      student_id: studentId,
    },
    profile: profile || null,
    resumePath: resumeValue || '',
    resumeUrl,
  };
};

const candidateService = {
  getProfileByUserId,
  resolveResumeUrl,
  getCandidateDetails,
};

export default candidateService;

export {
  getProfileByUserId,
  resolveResumeUrl,
  getCandidateDetails,
};