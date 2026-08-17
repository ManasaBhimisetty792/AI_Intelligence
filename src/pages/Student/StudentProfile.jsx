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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

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
      <div className="sp-root">

        {/* ── HERO BANNER ── */}
        <div className="sp-banner">
          <div className="sp-banner-bg">
            <div className="sp-banner-orb sp-banner-orb-a" />
            <div className="sp-banner-orb sp-banner-orb-b" />
            <div className="sp-banner-orb sp-banner-orb-c" />
            <HiSparkles className="sp-banner-sparkle" />
          </div>
          <div className="sp-avatar-wrap">
            <div className="sp-avatar-ring">
              {photoPreview ? (
                <img src={photoPreview} alt={formData.fullName || 'Avatar'} className="sp-avatar-img" />
              ) : (
                <div className="sp-avatar-fallback"><FiUser /></div>
              )}
              {uploadingAvatar && <div className="sp-avatar-overlay"><FiLoader className="sp-spin" /></div>}
            </div>
            <button
              type="button" className="sp-avatar-cam"
              onClick={() => { setActiveTab('Edit Profile'); setTimeout(() => photoInputRef.current?.click(), 200); }}
              title="Change photo"
            >
              <FiCamera />
            </button>
          </div>
          <div className="sp-banner-identity">
            <div className="sp-name-row">
              <h1 className="sp-name">{formData.fullName || 'Unnamed Student'}</h1>
             
            </div>
            {formData.username && <p className="sp-handle">@{formData.username}</p>}
            <div className="sp-banner-meta">
              {formData.currentStatus ? (
                <span className="sp-status-pill"><FiCheckCircle />{formData.currentStatus}</span>
              ) : (
                <span className="sp-status-pill sp-status-default"><FiUser /> Candidate</span>
              )}
              {formData.location ? (
                <span className="sp-location"><FiMapPin />{formData.location}</span>
              ) : (
                <span className="sp-location sp-location-empty"><FiMapPin /> Location not set</span>
              )}
            </div>
          </div>
          <div className="sp-completion-ring-wrap">
            <svg className="sp-ring-svg" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border, #d1e0d9)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={completionColor} strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - profileCompletion / 100)}`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="sp-ring-label">
              <strong style={{ color: completionColor }}>{profileCompletion}%</strong>
              <span>complete</span>
            </div>
          </div>
        </div>

        {/* ── QUICK STATS BAR ── */}
        {/* <div className="sp-stats-bar">
          <div className="sp-stat-item">
            <div className="sp-stat-icon"><FiZap /></div>
            <div><strong>{skills.length}</strong><span>Skills Listed</span></div>
          </div>
          <div className="sp-stat-divider" />
          <div className="sp-stat-item">
            <div className="sp-stat-icon"><FiFileText /></div>
            <div><strong>{resumeFileName ? 'Attached' : 'Missing'}</strong><span>Resume Doc</span></div>
          </div>
          <div className="sp-stat-divider" />
          <div className="sp-stat-item">
            <div className="sp-stat-icon"><FiActivity /></div>
            <div><strong>{profileExists ? 'Active' : 'Draft'}</strong><span>Profile Status</span></div>
          </div>
          <div className="sp-stat-divider" />
          <div className="sp-stat-item sp-stat-progress">
            <div className="sp-progress-bar-wrap">
              <div className="sp-progress-bar-label">
                <span>Profile Readiness</span>
                <strong style={{ color: completionColor }}>{profileCompletion}%</strong>
              </div>
              <div className="sp-progress-track">
                <div className="sp-progress-fill" style={{ width: `${profileCompletion}%`, background: completionColor }} />
              </div>
            </div>
          </div>
          <button type="button" className="sp-edit-btn" onClick={() => setActiveTab(activeTab === 'Edit Profile' ? 'Overview' : 'Edit Profile')}>
            <FiEdit3 />
            {activeTab === 'Edit Profile' ? 'View Overview' : 'Edit Profile'}
          </button>
        </div> */}

        {/* ── TABS NAVIGATION ── */}
        <div className="sp-tabs-nav">
          <button
            type="button"
            className={`sp-tab-btn ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            <FiUser className="sp-tab-btn-icon" /> Overview
          </button>
          <button
            type="button"
            className={`sp-tab-btn ${activeTab === 'Edit Profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('Edit Profile')}
          >
            <FiEdit3 className="sp-tab-btn-icon" /> Edit Profile
          </button>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div className="sp-overview-container">
            {/* Top 2-Column Grid */}
            <div className="sp-overview-grid">
              <div className="sp-col-main">

                {/* 1. Professional Bio / About Me */}
                <div className="sp-card sp-overview-card">
                  <div className="sp-card-head">
                    <div className="sp-card-icon"><FiUser /></div>
                    <div className="sp-card-head-info">
                      <h2>About Me &amp; Summary</h2>
                      <p>Candidate background and career focus</p>
                    </div>
                    {formData.currentStatus && (
                      <span className="sp-head-badge">
                        <FiCheckCircle /> {formData.currentStatus}
                      </span>
                    )}
                  </div>

                  <div className="sp-bio-box">
                    {formData.bio ? (
                      <p className="sp-bio-text">{formData.bio}</p>
                    ) : (
                      <div className="sp-overview-empty">
                        <FiFileText size={22} className="sp-empty-icon" />
                        <p>No professional bio written yet.</p>
                        <span>Share your background and career goals with recruiters.</span>
                        <button
                          type="button"
                          className="sp-btn-inline-action"
                          onClick={() => setActiveTab('Edit Profile')}
                        >
                          <FiPlus /> Add Bio
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Skills & Technologies */}
                <div className="sp-card sp-overview-card">
                  <div className="sp-card-head">
                    <div className="sp-card-icon sp-card-icon-teal"><FiTag /></div>
                    <div className="sp-card-head-info">
                      <h2>Technical Skills &amp; Stack</h2>
                      <p>{skills.length} verified skill{skills.length !== 1 ? 's' : ''} listed</p>
                    </div>
                    <button
                      type="button"
                      className="sp-head-action-btn"
                      onClick={() => setActiveTab('Edit Profile')}
                    >
                      <FiPlus /> Manage
                    </button>
                  </div>

                  {skills.length > 0 ? (
                    <div className="sp-skill-cloud">
                      {skills.map((skill) => (
                        <span key={skill} className="sp-skill-tag">
                          <FiZap className="sp-skill-icon" /> {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="sp-overview-empty">
                      <FiTag size={22} className="sp-empty-icon" />
                      <p>No skills added to your profile yet.</p>
                      <span>Highlight your top tools, languages, and frameworks.</span>
                      <button
                        type="button"
                        className="sp-btn-inline-action"
                        onClick={() => setActiveTab('Edit Profile')}
                      >
                        <FiPlus /> Add Skills
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Resume & Uploaded Documents */}
                <div className="sp-card sp-overview-card">
                  <div className="sp-card-head">
                    <div className="sp-card-icon sp-card-icon-emerald"><FiFileText /></div>
                    <div className="sp-card-head-info">
                      <h2>Resume &amp; Application Documents</h2>
                      <p>Official resume available for recruiter technical screening</p>
                    </div>
                  </div>

                  {resumeFileName ? (
                    <div className="sp-resume-highlight">
                      <div className="sp-resume-doc-badge">
                        <FiFileText size={24} />
                      </div>
                      <div className="sp-resume-doc-meta">
                        <strong>{resumeFileName}</strong>
                        <span className="sp-resume-status-tag">
                          <FiCheckCircle /> Ready for screening &amp; ATS evaluation
                        </span>
                      </div>
                      <div className="sp-resume-actions">
                        {resumeFileUrl && (
                          <a
                            href={resumeFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="sp-resume-btn sp-resume-btn-primary"
                          >
                            <FiExternalLink /> Open Resume
                          </a>
                        )}
                        <button
                          type="button"
                          className="sp-resume-btn sp-resume-btn-secondary"
                          onClick={() => { setActiveTab('Edit Profile'); setTimeout(() => resumeInputRef.current?.click(), 200); }}
                        >
                          <FiUploadCloud /> Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="sp-overview-empty">
                      <FiUploadCloud size={22} className="sp-empty-icon" />
                      <p>No resume document attached.</p>
                      <span>Upload your PDF or DOCX resume to get ATS matched with top recruiters.</span>
                      <button
                        type="button"
                        className="sp-btn-inline-action"
                        onClick={() => { setActiveTab('Edit Profile'); setTimeout(() => resumeInputRef.current?.click(), 200); }}
                      >
                        <FiUploadCloud /> Upload Resume
                      </button>
                    </div>
                  )}
                </div>

              </div>

              <div className="sp-col-side">

                {/* 4. Direct Contact Information */}
                <div className="sp-card sp-overview-card">
                  <div className="sp-card-head">
                    <div className="sp-card-icon sp-card-icon-blue"><FiBriefcase /></div>
                    <div className="sp-card-head-info">
                      <h2>Contact Details</h2>
                      <p>Direct contact info</p>
                    </div>
                  </div>

                  <div className="sp-contact-list">
                    <div className="sp-contact-row">
                      <div className="sp-contact-dot sp-dot-mail"><FiMail /></div>
                      <div className="sp-contact-text">
                        <strong>Email Address</strong>
                        <span>{formData.email || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="sp-contact-row">
                      <div className="sp-contact-dot sp-dot-phone"><FiPhone /></div>
                      <div className="sp-contact-text">
                        <strong>Phone Number</strong>
                        <span>{formData.phone || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="sp-contact-row">
                      <div className="sp-contact-dot sp-dot-loc"><FiMapPin /></div>
                      <div className="sp-contact-text">
                        <strong>Location</strong>
                        <span>{formData.location || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Online Presence & Portfolios */}
                <div className="sp-card sp-overview-card">
                  <div className="sp-card-head">
                    <div className="sp-card-icon sp-card-icon-purple"><FiGlobe /></div>
                    <div className="sp-card-head-info">
                      <h2>Online Presence</h2>
                      <p>Socials &amp; portfolios</p>
                    </div>
                  </div>

                  <div className="sp-links-list">
                    {formData.githubUrl ? (
                      <a
                        href={normalizeUrl(formData.githubUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="sp-link-row sp-link-active"
                      >
                        <div className="sp-link-left">
                          <FiGithub className="sp-link-icon" />
                          <span>GitHub Profile</span>
                        </div>
                        <FiExternalLink className="sp-link-arrow" />
                      </a>
                    ) : (
                      <div className="sp-link-row sp-link-inactive">
                        <div className="sp-link-left">
                          <FiGithub className="sp-link-icon" />
                          <span>GitHub</span>
                        </div>
                        <span className="sp-link-missing">Not linked</span>
                      </div>
                    )}

                    {formData.linkedinUrl ? (
                      <a
                        href={normalizeUrl(formData.linkedinUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="sp-link-row sp-link-active"
                      >
                        <div className="sp-link-left">
                          <FiLinkedin className="sp-link-icon" />
                          <span>LinkedIn Profile</span>
                        </div>
                        <FiExternalLink className="sp-link-arrow" />
                      </a>
                    ) : (
                      <div className="sp-link-row sp-link-inactive">
                        <div className="sp-link-left">
                          <FiLinkedin className="sp-link-icon" />
                          <span>LinkedIn</span>
                        </div>
                        <span className="sp-link-missing">Not linked</span>
                      </div>
                    )}

                    {formData.portfolioUrl ? (
                      <a
                        href={normalizeUrl(formData.portfolioUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="sp-link-row sp-link-active"
                      >
                        <div className="sp-link-left">
                          <FiStar className="sp-link-icon" />
                          <span>Portfolio Website</span>
                        </div>
                        <FiExternalLink className="sp-link-arrow" />
                      </a>
                    ) : (
                      <div className="sp-link-row sp-link-inactive">
                        <div className="sp-link-left">
                          <FiStar className="sp-link-icon" />
                          <span>Portfolio</span>
                        </div>
                        <span className="sp-link-missing">Not linked</span>
                      </div>
                    )}

                    {formData.website ? (
                      <a
                        href={normalizeUrl(formData.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="sp-link-row sp-link-active"
                      >
                        <div className="sp-link-left">
                          <FiGlobe className="sp-link-icon" />
                          <span>Personal Website</span>
                        </div>
                        <FiExternalLink className="sp-link-arrow" />
                      </a>
                    ) : (
                      <div className="sp-link-row sp-link-inactive">
                        <div className="sp-link-left">
                          <FiGlobe className="sp-link-icon" />
                          <span>Website</span>
                        </div>
                        <span className="sp-link-missing">Not linked</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 6. Profile Strength & Verification (100% FULL WIDTH CARD) */}
            <div className="sp-card sp-strength-fullwidth">
              <div className="sp-card-head">
                <div className="sp-card-icon sp-card-icon-gold"><FiShield /></div>
                <div className="sp-card-head-info">
                  <h2>Profile Strength &amp; Verification Milestones</h2>
                  <p>Complete your profile milestones to maximize recruiter visibility and interview invites</p>
                </div>
                <div className="sp-strength-score-pill" style={{ color: completionColor, borderColor: completionColor }}>
                  <FiAward /> <strong>{profileCompletion}%</strong> {profileCompletion >= 80 ? 'Excellent' : profileCompletion >= 50 ? 'Moderate' : 'Incomplete'}
                </div>
              </div>

              <div className="sp-checklist-grid">
                {[
                  { label: 'Full Name', done: Boolean(formData.fullName) },
                  { label: 'Email Address', done: Boolean(formData.email) },
                  { label: 'Phone Number', done: Boolean(formData.phone) },
                  { label: 'Location', done: Boolean(formData.location) },
                  { label: 'Current Status', done: Boolean(formData.currentStatus) },
                  { label: 'Professional Bio', done: Boolean(formData.bio) },
                  { label: 'Skills Listed', done: skills.length > 0 },
                  { label: 'Resume Uploaded', done: Boolean(resumeFileName) },
                  { label: 'GitHub Profile', done: Boolean(formData.githubUrl) },
                  { label: 'LinkedIn Profile', done: Boolean(formData.linkedinUrl) },
                  { label: 'Portfolio Link', done: Boolean(formData.portfolioUrl) },
                  { label: 'Personal Site', done: Boolean(formData.website) },
                ].map(({ label, done }) => (
                  <div key={label} className={`sp-check-grid-item ${done ? 'sp-check-grid-done' : 'sp-check-grid-pending'}`}>
                    <div className="sp-check-grid-icon">
                      {done ? <FiCheckCircle /> : <FiAlertCircle />}
                    </div>
                    <div className="sp-check-grid-info">
                      <strong>{label}</strong>
                      <span>{done ? 'Completed' : 'Action Needed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── EDIT PROFILE TAB ── */}
        {activeTab === 'Edit Profile' && (
          <div className="sp-editor-wrap">
            <form className="sp-editor-form" onSubmit={handleSubmit}>
              <div className="sp-editor-section">
                <div className="sp-editor-section-head"><FiUploadCloud /><h3>Media &amp; Documents</h3></div>
                <div className="sp-upload-grid">
                  <div className="sp-upload-card">
                    <div className="sp-upload-preview">
                      {photoPreview ? <img src={photoPreview} alt="Avatar" /> : <FiUser />}
                      {uploadingAvatar && <div className="sp-upload-overlay"><FiLoader className="sp-spin" /></div>}
                    </div>
                    <div className="sp-upload-info">
                      <strong>Profile Photo</strong><span>JPG, PNG, WEBP · Max 5MB</span>
                    </div>
                    <button type="button" className="sp-upload-btn" onClick={() => photoInputRef.current?.click()} disabled={uploadingAvatar}>
                      {uploadingAvatar ? 'Uploading…' : 'Choose Photo'}
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} hidden />
                  </div>
                  <div className="sp-upload-card sp-upload-card-alt">
                    <div className="sp-upload-preview sp-upload-preview-doc"><FiFileText />
                      {uploadingResume && <div className="sp-upload-overlay"><FiLoader className="sp-spin" /></div>}
                    </div>
                    <div className="sp-upload-info">
                      <strong>Resume</strong><span>PDF or DOCX · Max 10MB</span>
                      {resumeFileName && <em>{resumeFileName}</em>}
                    </div>
                    <button type="button" className="sp-upload-btn sp-upload-btn-alt" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
                      {uploadingResume ? 'Uploading…' : 'Choose Resume'}
                    </button>
                    <input ref={resumeInputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeUpload} hidden />
                  </div>
                </div>
              </div>
              <div className="sp-editor-section">
                <div className="sp-editor-section-head"><FiUser /><h3>Basic Information</h3></div>
                <div className="sp-form-grid">
                  <FormField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" icon={<FiUser />} required />
                  <FormField label="Username" name="username" value={formData.username} onChange={handleInputChange} placeholder="your_username" icon={<FiUser />} />
                  <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" icon={<FiMail />} required />
                  <FormField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" icon={<FiPhone />} />
                  <FormField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Hyderabad, Telangana" icon={<FiMapPin />} />
                  <div className="sp-field">
                    <label htmlFor="currentStatus">Current Status</label>
                    <div className="sp-input-wrap">
                      <FiBriefcase />
                      <select id="currentStatus" name="currentStatus" value={formData.currentStatus} onChange={handleInputChange}>
                        <option value="">Select status</option>
                        <option value="Student">Student</option>
                        <option value="Job Seeker">Job Seeker</option>
                        <option value="Working Professional">Working Professional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sp-editor-section">
                <div className="sp-editor-section-head"><FiTag /><h3>Skills &amp; Technologies</h3></div>
                <div className="sp-skill-input-row">
                  <div className="sp-input-wrap sp-skill-input">
                    <FiTag />
                    <input
                      type="text" value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                      placeholder="React, Python, PostgreSQL…"
                    />
                  </div>
                  <button type="button" className="sp-add-skill-btn" onClick={handleAddSkill}><FiPlus /> Add</button>
                </div>
                <div className="sp-editable-skills">
                  {skills.length > 0 ? skills.map((skill) => (
                    <span key={skill} className="sp-editable-tag">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} aria-label={`Remove ${skill}`}><FiX /></button>
                    </span>
                  )) : <p className="sp-hint">No skills added yet.</p>}
                </div>
              </div>
              <div className="sp-editor-section">
                <div className="sp-editor-section-head">
                  <FiActivity />
                  <div><h3>Professional Bio</h3><span className="sp-bio-count">{formData.bio.length}/500</span></div>
                </div>
                <textarea
                  className="sp-bio-textarea" name="bio" value={formData.bio}
                  onChange={handleInputChange} maxLength={500} rows={5}
                  placeholder="Write a short professional summary that highlights your skills, interests, and career goals…"
                />
              </div>
              <div className="sp-editor-section">
                <div className="sp-editor-section-head"><FiGlobe /><h3>Online Presence</h3></div>
                <div className="sp-form-grid">
                  <FormField label="GitHub URL" name="githubUrl" type="url" value={formData.githubUrl} onChange={handleInputChange} placeholder="github.com/yourname" icon={<FiGithub />} />
                  <FormField label="LinkedIn URL" name="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="linkedin.com/in/yourname" icon={<FiLinkedin />} />
                  <FormField label="Portfolio URL" name="portfolioUrl" type="url" value={formData.portfolioUrl} onChange={handleInputChange} placeholder="yourportfolio.com" icon={<FiStar />} />
                  <FormField label="Website URL" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="yourwebsite.com" icon={<FiGlobe />} />
                </div>
              </div>
              <div className="sp-form-actions">
                <button type="button" className="sp-action-secondary" onClick={handleReset} disabled={saving}>
                  <FiRefreshCw /> Reset
                </button>
                <button type="submit" className="sp-action-primary" disabled={saving || uploadingAvatar || uploadingResume}>
                  {saving ? <><FiLoader className="sp-spin" /> Saving…</> : <><FiSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const FormField = ({ label, name, type = 'text', value, onChange, placeholder, icon, required = false }) => (
  <div className="sp-field">
    <label htmlFor={name}>{label}{required && <span className="sp-required">*</span>}</label>
    <div className="sp-input-wrap">
      {icon}
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete="off" />
    </div>
  </div>
);

export default StudentProfile;