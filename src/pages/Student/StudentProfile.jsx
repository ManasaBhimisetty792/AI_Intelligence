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
  FiCamera,
  FiActivity,
  FiStar,
  FiShield,
  FiZap,
  FiAward,
  FiCheck,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import MembershipBadge from '../../components/Navbar/MembershipBadge';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import './studentProfile.css';

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
  ) return trimmed;
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
  const editorSectionRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState(getInitialFormData(user));
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileUrl, setResumeFileUrl] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  const handleEditClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTimeout(() => {
        editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setEditMode(false);
    }
  };

  const profileCompletion = useMemo(
    () => getProfileCompletion(formData, skills, resumeFileName),
    [formData, skills, resumeFileName]
  );

  useEffect(() => {
    if (user?.id) fetchProfileData();
    else setLoading(false);
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) { setLoading(false); return; }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (event) => {
    event?.preventDefault();
    const skill = newSkillInput.trim();
    if (!skill) return;
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      toast.error('This skill has already been added'); return;
    }
    setSkills((prev) => [...prev, skill]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Please upload a JPG, PNG, or WEBP image'); return false; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Profile image must be smaller than 5MB'); return false; }
    return true;
  };

  const validateResume = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtension = /\.(pdf|docx)$/i.test(file.name);
    if (!validTypes.includes(file.type) && !validExtension) { toast.error('Please upload a PDF or DOCX resume'); return false; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Resume must be smaller than 10MB'); return false; }
    return true;
  };

  const uploadToStorage = async (bucket, file, prefix) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
    const filePath = `${user.id}/${prefix}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: true, cacheControl: '3600', contentType: file.type,
    });
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !validateImage(file)) return;
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    if (!isSupabaseConfigured() || !user?.id) { toast.success('Photo preview updated'); return; }
    setUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadToStorage('profile_images', file, 'avatar');
      setPhotoPreview(uploadedUrl);
      toast.success('Profile photo uploaded');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Photo upload failed. The preview is still available.');
    } finally { setUploadingAvatar(false); }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !validateResume(file)) return;
    setResumeFileName(file.name);
    if (!isSupabaseConfigured() || !user?.id) { toast.success('Resume selected'); return; }
    setUploadingResume(true);
    try {
      const uploadedUrl = await uploadToStorage('resumes', file, 'resume');
      setResumeFileUrl(uploadedUrl);
      toast.success('Resume uploaded');
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast.error('Resume upload failed. Please try again.');
    } finally { setUploadingResume(false); }
  };

  const handleReset = async () => {
    await fetchProfileData();
    toast.success('Profile form reset');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id) { toast.error('You must be logged in to save your profile'); return; }
    if (!formData.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!formData.email.trim()) { toast.error('Email address is required'); return; }
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
      const result = await userService.updateCandidateProfile(user.id, payload);
      const savedProfile = result?.data || result || payload;
      setFormData({
        fullName: savedProfile.name || payload.name || '',
        username: savedProfile.username || payload.username || '',
        email: savedProfile.email || payload.email || '',
        phone: savedProfile.phone || payload.phone || '',
        location: savedProfile.location || payload.location || '',
        currentStatus: savedProfile.current_status || payload.current_status || '',
        bio: savedProfile.bio || payload.bio || '',
        githubUrl: savedProfile.github_url || payload.github_url || '',
        linkedinUrl: savedProfile.linkedin_url || payload.linkedin_url || '',
        portfolioUrl: savedProfile.portfolio_url || payload.portfolio_url || '',
        website: savedProfile.website || payload.website || '',
      });
      setSkills(Array.isArray(savedProfile.skills) ? savedProfile.skills : payload.skills);
      setPhotoPreview(savedProfile.avatar_url || payload.avatar_url || '');
      setResumeFileName(savedProfile.resume_file_name || payload.resume_file_name || '');
      setResumeFileUrl(savedProfile.resume_file_url || payload.resume_file_url || '');
      setProfileExists(true);
      if (updateUser) updateUser({ ...user, name: payload.name, username: payload.username, email: payload.email, avatar: payload.avatar_url, avatar_url: payload.avatar_url });
      setActiveTab('Overview');
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="sp-loading">
          <div className="sp-loading-spinner"><FiLoader /></div>
          <p>Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user?.id) {
    return (
      <DashboardLayout title="My Profile">
        <div className="sp-empty-state">
          <FiAlertCircle />
          <h2>Authentication required</h2>
          <p>Please sign in to view and edit your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  const completionColor = profileCompletion >= 80 ? '#059669' : profileCompletion >= 50 ? '#d97706' : '#dc2626';

  return (
    <DashboardLayout title="My Profile">
      <main className="student-profile-page">

        {/* =====================================================
            REAL-WORLD DEVELOPER PROFILE LAYOUT
        ====================================================== */}
        <div className="profile-layout-grid">

          {/* ── LEFT SIDEBAR COLUMN ────────────────────────────── */}
          <aside className="profile-sidebar-column">

            {/* MAIN IDENTITY CARD */}
            <div className="profile-card identity-card">
              {/* COVER BANNER */}
              <div className="identity-banner">
                <div className="banner-glow-orb" />
                <span className="banner-badge">STUDENT PORTAL</span>
              </div>

              {/* AVATAR */}
              <div className="identity-avatar-wrapper">
                <div className="identity-avatar-container">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={formData.fullName || 'Profile'}
                      className="identity-avatar-img"
                    />
                  ) : (
                    <div className="identity-avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                  <span className="identity-online-dot" title="Active Account" />

                  {uploadingAvatar && (
                    <div className="avatar-uploading">
                      <FiLoader className="spin-animation" />
                    </div>
                  )}
                </div>
              </div>

              {/* USER INFO */}
              <div className="identity-info-body">
                <div className="identity-name-group">
                  <h2>{formData.fullName || 'Unnamed Student'}</h2>
                  <MembershipBadge />
                </div>

                <p className="identity-handle">
                  {formData.username ? `@${formData.username}` : 'Username not set'}
                </p>

                <div className="identity-tags">
                  <span className="status-chip">
                    <span className="pulse-dot" />
                    {formData.currentStatus || 'Active Candidate'}
                  </span>

                  {formData.location && (
                    <span className="location-chip">
                      <FiMapPin size={13} />
                      {formData.location}
                    </span>
                  )}
                </div>

                {/* EDIT BUTTON */}
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleEditClick}
                >
                  <FiEdit3 size={15} />
                  {editMode ? 'Close Editor' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* CONTACT & SOCIAL LINKS CARD */}
            <div className="profile-card links-card">
              <h3 className="card-section-title">
                <FiBriefcase size={16} /> Contact & Socials
              </h3>

              <div className="links-list">
                {formData.email && (
                  <a href={`mailto:${formData.email}`} className="social-link-item">
                    <div className="link-icon email-icon"><FiMail /></div>
                    <div className="link-text">
                      <small>Email</small>
                      <span>{formData.email}</span>
                    </div>
                  </a>
                )}

                {formData.phone && (
                  <a href={`tel:${formData.phone}`} className="social-link-item">
                    <div className="link-icon phone-icon"><FiPhone /></div>
                    <div className="link-text">
                      <small>Phone</small>
                      <span>{formData.phone}</span>
                    </div>
                  </a>
                )}

                {formData.githubUrl && (
                  <a
                    href={normalizeUrl(formData.githubUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item"
                  >
                    <div className="link-icon github-icon"><FiGithub /></div>
                    <div className="link-text">
                      <small>GitHub</small>
                      <span>{formData.githubUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <FiExternalLink className="external-arrow" />
                  </a>
                )}

                {formData.linkedinUrl && (
                  <a
                    href={normalizeUrl(formData.linkedinUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item"
                  >
                    <div className="link-icon linkedin-icon"><FiLinkedin /></div>
                    <div className="link-text">
                      <small>LinkedIn</small>
                      <span>{formData.linkedinUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <FiExternalLink className="external-arrow" />
                  </a>
                )}

                {formData.portfolioUrl && (
                  <a
                    href={normalizeUrl(formData.portfolioUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item"
                  >
                    <div className="link-icon globe-icon"><FiGlobe /></div>
                    <div className="link-text">
                      <small>Portfolio</small>
                      <span>{formData.portfolioUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <FiExternalLink className="external-arrow" />
                  </a>
                )}

                {!formData.email &&
                  !formData.phone &&
                  !formData.githubUrl &&
                  !formData.linkedinUrl &&
                  !formData.portfolioUrl && (
                    <p className="empty-text">No contact details provided.</p>
                  )}
              </div>
            </div>

            {/* RESUME CARD */}
            <div className="profile-card resume-card">
              <h3 className="card-section-title">
                <FiFileText size={16} /> Attached CV / Resume
              </h3>

              {resumeFileName ? (
                <div className="resume-box">
                  <div className="resume-file-icon">
                    <FiFileText size={24} />
                  </div>
                  <div className="resume-info">
                    <strong className="resume-name">{resumeFileName}</strong>
                    <span className="resume-status-badge">
                      <FiCheckCircle size={12} /> Verified Upload
                    </span>
                  </div>
                  {resumeFileUrl ? (
                    <a
                      href={resumeFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="resume-download-btn"
                      title="Open Resume"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="resume-empty-box">
                  <p>No resume uploaded yet.</p>
                  <button
                    type="button"
                    className="upload-resume-shortcut"
                    onClick={() => {
                      setEditMode(true);
                      setTimeout(() => {
                        resumeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                  >
                    <FiUploadCloud size={14} /> Upload Resume
                  </button>
                </div>
              )}
            </div>

          </aside>


          {/* ── RIGHT MAIN CONTENT COLUMN ─────────────────────── */}
          <main className="profile-main-column">

            {/* PROFILE STRENGTH BANNER */}
            <div className="profile-card strength-card">
              <div className="strength-header">
                <div className="strength-title">
                  <HiSparkles className="sparkle-icon" />
                  <div>
                    <h3>Profile Strength Score</h3>
                    <p>Complete your details to increase visibility to recruiters</p>
                  </div>
                </div>
                <div className="strength-percentage">{profileCompletion}%</div>
              </div>

              <div className="strength-progress-bar">
                <div
                  className="strength-progress-fill"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {/* ABOUT ME SECTION */}
            <div className="profile-card about-card">
              <div className="card-header-bar">
                <h3 className="card-section-title">
                  <FiUser size={18} /> About Me
                </h3>
              </div>

              <div className="bio-container">
                {formData.bio ? (
                  <p className="bio-text">{formData.bio}</p>
                ) : (
                  <div className="empty-placeholder">
                    <p>No professional bio added yet.</p>
                    <button
                      type="button"
                      className="inline-action-btn"
                      onClick={() => setEditMode(true)}
                    >
                      + Add Bio
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SKILLS & TECHNOLOGIES SECTION */}
            <div className="profile-card skills-card">
              <div className="card-header-bar">
                <h3 className="card-section-title">
                  <FiTag size={18} /> Skills & Technical Expertise
                </h3>
                <span className="skill-count-badge">{skills.length} Skills</span>
              </div>

              {skills.length > 0 ? (
                <div className="skills-grid">
                  {skills.map((skill) => (
                    <div className="skill-badge-card" key={skill}>
                      <span className="skill-dot" />
                      <span className="skill-name">{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-placeholder">
                  <p>No skills added to your profile yet.</p>
                  <button
                    type="button"
                    className="inline-action-btn"
                    onClick={() => setEditMode(true)}
                  >
                    + Add Skills
                  </button>
                </div>
              )}
            </div>

            {/* CAREER READINESS CARD */}
            <div className="profile-card readiness-card">
              <div className="card-header-bar">
                <h3 className="card-section-title">
                  <FiCheckCircle size={18} /> Career & Interview Readiness
                </h3>
              </div>

              <div className="readiness-grid">
                <div className="readiness-item">
                  <div className="readiness-icon check-green">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h4>Live Interview Studio</h4>
                    <p>Ready to join recruiter video calls</p>
                  </div>
                </div>

                <div className="readiness-item">
                  <div className="readiness-icon check-indigo">
                    <HiSparkles />
                  </div>
                  <div>
                    <h4>AI Mock Practice</h4>
                    <p>Access AI feedback report generator</p>
                  </div>
                </div>

                <div className="readiness-item">
                  <div className="readiness-icon check-teal">
                    <FiFileText />
                  </div>
                  <div>
                    <h4>ATS Resume Screening</h4>
                    <p>ATS compatible profile structure</p>
                  </div>
                </div>
              </div>
            </div>

          </main>

        </div>

        {editMode && (
          <section ref={editorSectionRef} className="profile-editor-card">
            <div className="editor-header">
              <div>
                <h2>Edit profile details</h2>
                <p>Update your information and save it to your profile.</p>
              </div>

              <button
                type="button"
                className="close-editor-btn"
                onClick={() => setEditMode(false)}
                aria-label="Close editor"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <div className="form-section-heading">
                  <h3>Basic information</h3>
                  <p>Your primary account and public details.</p>
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
                    icon={<FiStar />}
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