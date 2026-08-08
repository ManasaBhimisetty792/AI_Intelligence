import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiUploadCloud,
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiFileText,
  FiPlus,
  FiTag,
  FiLoader,
  FiX,
  FiExternalLink,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import MembershipBadge from '../../components/Navbar/MembershipBadge';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import './studentProfile.css';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

const EMPTY_FORM = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  location: '',
  currentStatus: '',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  website: '',
};

const normalizeUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const getInitialFormData = (user) => ({
  ...EMPTY_FORM,
  fullName: user?.name || '',
  username: user?.username || '',
  email: user?.email || '',
});

const getProfileCompletion = (formData, skills, resumeFileName) => {
  const fields = [
    formData.fullName,
    formData.username,
    formData.email,
    formData.phone,
    formData.location,
    formData.currentStatus,
    formData.bio,
    formData.githubUrl,
    formData.linkedinUrl,
    formData.portfolioUrl,
    skills.length > 0,
    resumeFileName,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState(getInitialFormData(user));
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileUrl, setResumeFileUrl] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  const profileCompletion = useMemo(
    () => getProfileCompletion(formData, skills, resumeFileName),
    [formData, skills, resumeFileName]
  );

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await userService.getCandidateProfile(user.id);

      if (!data) {
        setProfileExists(false);
        setFormData(getInitialFormData(user));
        setSkills([]);
        setPhotoPreview(user?.avatar_url || user?.avatar || '');
        setResumeFileName('');
        setResumeFileUrl('');
        return;
      }

      setProfileExists(true);

      setFormData({
        fullName: data.name || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        currentStatus: data.current_status || '',
        bio: data.bio || '',
        githubUrl: data.github_url || '',
        linkedinUrl: data.linkedin_url || '',
        portfolioUrl: data.portfolio_url || '',
        website: data.website || '',
      });

      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setPhotoPreview(data.avatar_url || data.avatar || '');
      setResumeFileName(data.resume_file_name || '');
      setResumeFileUrl(data.resume_file_url || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error(error?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddSkill = (event) => {
    event?.preventDefault();

    const skill = newSkillInput.trim();

    if (!skill) return;

    const alreadyExists = skills.some(
      (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      toast.error('This skill has already been added');
      return;
    }

    setSkills((previous) => [...previous, skill]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Profile image must be smaller than 5MB');
      return false;
    }

    return true;
  };

  const validateResume = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024;

    const validExtension = /\.(pdf|docx)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !validExtension) {
      toast.error('Please upload a PDF or DOCX resume');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Resume must be smaller than 10MB');
      return false;
    }

    return true;
  };

  const uploadToStorage = async (bucket, file, prefix) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
    const filePath = `${user.id}/${prefix}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || '';
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!validateImage(file)) return;

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    if (!isSupabaseConfigured() || !user?.id) {
      toast.success('Photo preview updated');
      return;
    }

    setUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadToStorage(
        'profile_images',
        file,
        'avatar'
      );

      setPhotoPreview(uploadedUrl);
      toast.success('Profile photo uploaded');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Photo upload failed. The preview is still available.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!validateResume(file)) return;

    setResumeFileName(file.name);

    if (!isSupabaseConfigured() || !user?.id) {
      toast.success('Resume selected');
      return;
    }

    setUploadingResume(true);

    try {
      const uploadedUrl = await uploadToStorage('resumes', file, 'resume');

      setResumeFileUrl(uploadedUrl);
      toast.success('Resume uploaded');
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast.error('Resume upload failed. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleReset = async () => {
    await fetchProfileData();
    toast.success('Profile form reset');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      toast.error('You must be logged in to save your profile');
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        current_status: formData.currentStatus,
        bio: formData.bio.trim(),
        github_url: normalizeUrl(formData.githubUrl),
        linkedin_url: normalizeUrl(formData.linkedinUrl),
        portfolio_url: normalizeUrl(formData.portfolioUrl),
        website: normalizeUrl(formData.website),
        avatar_url: photoPreview || null,
        resume_file_name: resumeFileName || null,
        resume_file_url: resumeFileUrl || null,
        profile_completion_pct: profileCompletion,
        skills,
        role: 'student',
      };

      const result = await userService.updateCandidateProfile(
        user.id,
        payload
      );

      const savedProfile = result?.data || result || payload;

      setFormData({
        fullName: savedProfile.name || payload.name || '',
        username: savedProfile.username || payload.username || '',
        email: savedProfile.email || payload.email || '',
        phone: savedProfile.phone || payload.phone || '',
        location: savedProfile.location || payload.location || '',
        currentStatus:
          savedProfile.current_status || payload.current_status || '',
        bio: savedProfile.bio || payload.bio || '',
        githubUrl: savedProfile.github_url || payload.github_url || '',
        linkedinUrl:
          savedProfile.linkedin_url || payload.linkedin_url || '',
        portfolioUrl:
          savedProfile.portfolio_url || payload.portfolio_url || '',
        website: savedProfile.website || payload.website || '',
      });

      setSkills(
        Array.isArray(savedProfile.skills)
          ? savedProfile.skills
          : payload.skills
      );
      setPhotoPreview(
        savedProfile.avatar_url || payload.avatar_url || ''
      );
      setResumeFileName(
        savedProfile.resume_file_name || payload.resume_file_name || ''
      );
      setResumeFileUrl(
        savedProfile.resume_file_url || payload.resume_file_url || ''
      );
      setProfileExists(true);

      if (updateUser) {
        updateUser({
          ...user,
          name: payload.name,
          username: payload.username,
          email: payload.email,
          avatar: payload.avatar_url,
          avatar_url: payload.avatar_url,
        });
      }

      setEditMode(false);
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="profile-loading">
          <FiLoader className="spin-animation" />
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user?.id) {
    return (
      <DashboardLayout title="My Profile">
        <div className="profile-empty-state">
          <FiAlertCircle />
          <h2>Authentication required</h2>
          <p>Please sign in to view and edit your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <main className="student-profile-page">
        <section className="profile-hero-card">
          <div className="profile-hero-background">
            <div className="hero-orb hero-orb-one" />
            <div className="hero-orb hero-orb-two" />
            <HiSparkles className="hero-sparkle" />
          </div>

          <div className="profile-hero-content">
            <div className="profile-identity">
              <div className="profile-avatar-container">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={formData.fullName || 'Profile'}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <FiUser />
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="avatar-uploading">
                    <FiLoader className="spin-animation" />
                  </div>
                )}
              </div>

              <div className="profile-heading">
                <div className="profile-name-row">
                  <h1>{formData.fullName || 'Unnamed profile'}</h1>
                  <MembershipBadge />
                </div>

                <p className="profile-username">
                  {formData.username ? `@${formData.username}` : 'Username not set'}
                </p>

                <div className="profile-status-row">
                  <span className="status-pill">
                    <FiCheckCircle />
                    {formData.currentStatus || 'Status not set'}
                  </span>

                  {formData.location && (
                    <span className="location-text">
                      <FiMapPin />
                      {formData.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-button"
              onClick={() => setEditMode((previous) => !previous)}
            >
              <FiEdit3 />
              {editMode ? 'Close editor' : 'Edit profile'}
            </button>
          </div>

          <div className="profile-hero-footer">
            <div className="profile-stat">
              <strong>{skills.length}</strong>
              <span>Skills</span>
            </div>

            <div className="profile-stat">
              <strong>{resumeFileName ? '1' : '0'}</strong>
              <span>Resume</span>
            </div>

            <div className="profile-stat">
              <strong>{profileCompletion}%</strong>
              <span>Complete</span>
            </div>

            <div className="profile-progress">
              <div className="progress-label">
                <span>Profile completion</span>
                <strong>{profileCompletion}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="profile-content-grid">
          <div className="profile-card summary-card">
            <div className="card-heading">
              <div className="heading-icon">
                <FiUser />
              </div>
              <div>
                <h2>About me</h2>
                <p>Professional profile summary</p>
              </div>
            </div>

            <p className="profile-bio">
              {formData.bio || 'No professional bio added yet.'}
            </p>

            <div className="skills-section">
              <div className="section-label">
                <FiTag />
                Skills and technologies
              </div>

              {skills.length > 0 ? (
                <div className="skills-list">
                  {skills.map((skill) => (
                    <span className="display-skill" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-text">No skills added yet.</p>
              )}
            </div>
          </div>

          <div className="profile-card contact-card">
            <div className="card-heading">
              <div className="heading-icon">
                <FiBriefcase />
              </div>
              <div>
                <h2>Contact and links</h2>
                <p>Information saved in your profile</p>
              </div>
            </div>

            <div className="contact-list">
              {formData.email && (
                <a
                  href={`mailto:${formData.email}`}
                  className="contact-item"
                >
                  <FiMail />
                  <span>{formData.email}</span>
                </a>
              )}

              {formData.phone && (
                <a href={`tel:${formData.phone}`} className="contact-item">
                  <FiPhone />
                  <span>{formData.phone}</span>
                </a>
              )}

              {formData.githubUrl && (
                <a
                  href={normalizeUrl(formData.githubUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-item"
                >
                  <FiGithub />
                  <span>GitHub</span>
                  <FiExternalLink className="link-arrow" />
                </a>
              )}

              {formData.linkedinUrl && (
                <a
                  href={normalizeUrl(formData.linkedinUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-item"
                >
                  <FiLinkedin />
                  <span>LinkedIn</span>
                  <FiExternalLink className="link-arrow" />
                </a>
              )}

              {formData.portfolioUrl && (
                <a
                  href={normalizeUrl(formData.portfolioUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-item"
                >
                  <FiGlobe />
                  <span>Portfolio</span>
                  <FiExternalLink className="link-arrow" />
                </a>
              )}

              {formData.website && (
                <a
                  href={normalizeUrl(formData.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-item"
                >
                  <FiGlobe />
                  <span>Website</span>
                  <FiExternalLink className="link-arrow" />
                </a>
              )}

              {!formData.email &&
                !formData.phone &&
                !formData.githubUrl &&
                !formData.linkedinUrl &&
                !formData.portfolioUrl &&
                !formData.website && (
                  <p className="muted-text">
                    No contact information added yet.
                  </p>
                )}
            </div>

            {resumeFileName && (
              <a
                href={resumeFileUrl || '#'}
                target={resumeFileUrl ? '_blank' : undefined}
                rel={resumeFileUrl ? 'noreferrer' : undefined}
                className={`resume-display ${
                  !resumeFileUrl ? 'disabled-link' : ''
                }`}
              >
                <FiFileText />
                <span>
                  <strong>{resumeFileName}</strong>
                  <small>
                    {resumeFileUrl
                      ? 'Open uploaded resume'
                      : 'Resume URL unavailable'}
                  </small>
                </span>
                <FiExternalLink />
              </a>
            )}
          </div>
        </section>

        {editMode && (
          <section className="profile-editor-card">
            <div className="editor-header">
              <div>
                <h2>Edit profile details</h2>
                <p>Update your information and save it to your profile.</p>
              </div>

              <span className="sync-badge">
                <span />
                Supabase profile sync
              </span>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="upload-grid">
                <div className="upload-card">
                  <div className="upload-icon">
                    <FiUploadCloud />
                  </div>
                  <div>
                    <h3>Profile photo</h3>
                    <p>JPG, PNG, or WEBP. Maximum 5MB.</p>
                  </div>
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Choose photo'}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    hidden
                  />
                </div>

                <div className="upload-card">
                  <div className="upload-icon resume-icon">
                    <FiFileText />
                  </div>
                  <div>
                    <h3>Primary resume</h3>
                    <p>PDF or DOCX. Maximum 10MB.</p>
                  </div>
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? 'Uploading...' : 'Choose resume'}
                  </button>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeUpload}
                    hidden
                  />
                  {resumeFileName && (
                    <span className="selected-file">{resumeFileName}</span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-heading">
                  <h3>Basic information</h3>
                  <p>Keep your personal information accurate.</p>
                </div>

                <div className="form-grid">
                  <FormField
                    label="Full name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    icon={<FiUser />}
                    required
                  />

                  <FormField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="your_username"
                    icon={<FiUser />}
                  />

                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    icon={<FiMail />}
                    required
                  />

                  <FormField
                    label="Phone number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    icon={<FiPhone />}
                  />

                  <FormField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Hyderabad, Telangana"
                    icon={<FiMapPin />}
                  />

                  <div className="field-group">
                    <label htmlFor="currentStatus">Current status</label>
                    <div className="input-wrapper">
                      <FiBriefcase />
                      <select
                        id="currentStatus"
                        name="currentStatus"
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select status</option>
                        <option value="Student">Student</option>
                        <option value="Job Seeker">Job Seeker</option>
                        <option value="Working Professional">
                          Working Professional
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-heading">
                  <h3>Skills and technologies</h3>
                  <p>Add technologies that represent your experience.</p>
                </div>

                <div className="skill-input-row">
                  <div className="input-wrapper">
                    <FiTag />
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(event) =>
                        setNewSkillInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleAddSkill(event);
                        }
                      }}
                      placeholder="React, Python, PostgreSQL"
                    />
                  </div>

                  <button
                    type="button"
                    className="add-skill-button"
                    onClick={handleAddSkill}
                  >
                    <FiPlus />
                    Add skill
                  </button>
                </div>

                <div className="editable-skills">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <span className="editable-skill" key={skill}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          <FiX />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="muted-text">No skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-heading bio-heading">
                  <div>
                    <h3>Professional bio</h3>
                    <p>Introduce yourself in up to 500 characters.</p>
                  </div>
                  <span>{formData.bio.length}/500</span>
                </div>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={5}
                  placeholder="Write a short professional summary..."
                />
              </div>

              <div className="form-section">
                <div className="form-section-heading">
                  <h3>Online presence</h3>
                  <p>Add links where recruiters can learn more about you.</p>
                </div>

                <div className="form-grid">
                  <FormField
                    label="GitHub URL"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="github.com/yourname"
                    icon={<FiGithub />}
                  />

                  <FormField
                    label="LinkedIn URL"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/yourname"
                    icon={<FiLinkedin />}
                  />

                  <FormField
                    label="Portfolio URL"
                    name="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="yourportfolio.com"
                    icon={<FiGlobe />}
                  />

                  <FormField
                    label="Website URL"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="yourwebsite.com"
                    icon={<FiGlobe />}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={handleReset}
                  disabled={saving}
                >
                  <FiRefreshCw />
                  Reset
                </button>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving || uploadingAvatar || uploadingResume}
                >
                  {saving ? (
                    <>
                      <FiLoader className="spin-animation" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </DashboardLayout>
  );
};

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  required = false,
}) => (
  <div className="field-group">
    <label htmlFor={name}>
      {label}
      {required && <span className="required-mark">*</span>}
    </label>

    <div className="input-wrapper">
      {icon}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
    </div>
  </div>
);

export default StudentProfile;