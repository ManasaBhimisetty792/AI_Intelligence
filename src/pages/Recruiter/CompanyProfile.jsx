import React, { useEffect, useState } from 'react';
import {
  FiUser,
  FiBriefcase,
  FiSave,
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiShield,
  FiAward,
  FiMapPin,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import { supabase } from '../../services/supabaseClient';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    designation: '',
    avatar_url: '',
    company_name: '',
    company_logo: '',
    company_website: '',
    industry: '',
    company_size: '',
    location: '',
    experience_years: 0,
    specialization: '',
    bio: '',
    verification_status: 'Verified',
    tax_id: '',
  });

  const [availabilityText, setAvailabilityText] = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getProfile();
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || '',
          avatar_url: data.avatar_url || '',
          company_name: data.company_name || '',
          company_logo: data.company_logo || '',
          company_website: data.company_website || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          location: data.location || '',
          experience_years: Number(data.experience_years || 0),
          specialization: data.specialization || '',
          bio: data.bio || '',
          verification_status: data.verification_status || 'Verified',
          tax_id: data.tax_id || '',
        });
        setAvailabilityText(String(data.availability || ''));
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load recruiter profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid email is required';
    }
    if (!formData.company_name.trim()) errs.company_name = 'Company name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === 'experience_years' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Please upload a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData?.user;
      if (!user) {
        showToast('error', 'Please login again.');
        return;
      }
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      const avatarUrl = publicUrlData?.publicUrl || '';
      if (!avatarUrl) throw new Error('Could not generate public URL for uploaded image.');
      setFormData((previous) => ({
        ...previous,
        avatar_url: avatarUrl,
      }));
      showToast('success', 'Photo uploaded. Click Save Profile to store changes.');
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to upload profile image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      showToast('error', 'Please correct validation errors before saving.');
      return;
    }
    setSaving(true);
    try {
      await recruiterService.updateProfile({
        ...formData,
        availability: availabilityText,
      });
      showToast('success', 'Profile and availability updated successfully.');
      await loadProfile();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await loadProfile();
    setErrors({});
    showToast('success', 'Changes reset.');
  };

  return (
    <DashboardLayout title="Recruiter Profile">
      {toast && (
        <div
          className={`profile-toast ${
            toast.type === 'success'
              ? 'profile-toast-success'
              : 'profile-toast-error'
          }`}
        >
          {toast.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {toast.message}
        </div>
      )}

      <div className="glass-card profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img
              src={formData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={formData.full_name || 'Recruiter'}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
              }}
              className="profile-avatar"
            />

            <button
              type="button"
              className="profile-camera-button"
              title="Change Photo"
              onClick={() => document.getElementById('avatarUpload')?.click()}
            >
              <FiCamera size={14} />
            </button>

            <input
              id="avatarUpload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden-file-input"
              onChange={handleImageUpload}
            />
          </div>

          <div className="profile-summary">
            <div className="profile-name-row">
              <h2 className="profile-name">
                {formData.full_name || 'Recruiter'}
              </h2>

              <span className="profile-verification-badge">
                <FiCheckCircle />
                {formData.verification_status}
              </span>
            </div>

            <p className="profile-designation">
              {formData.designation || 'Senior Talent Acquisition'} at{' '}
              <strong>{formData.company_name || 'TechCorp'}</strong>
            </p>

            <div className="profile-meta">
              <span>
                <FiMapPin style={{ marginRight: '4px' }} />
                {formData.location || 'Location not set'}
              </span>
              <span>
                <FiAward style={{ marginRight: '4px' }} />
                {formData.experience_years} Years Exp.
              </span>
              <span>
                <FiMail style={{ marginRight: '4px' }} />
                {formData.email || 'Email not set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {[
          { key: 'personal', label: 'Personal Details', icon: FiUser },
          { key: 'company', label: 'Company Details', icon: FiBriefcase },
          { key: 'professional', label: 'Professional Details', icon: FiAward },
          { key: 'verification', label: 'Verification & Availability', icon: FiShield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`profile-tab ${activeTab === tab.key ? 'profile-tab-active' : ''}`}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="glass-card profile-form-card">
        {activeTab === 'personal' && (
          <div className="grid-responsive grid-col-2 profile-fields-grid">
            <div className="profile-field">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                className={`input-field ${errors.full_name ? 'input-error' : ''}`}
              />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </div>

            <div className="profile-field">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@company.com"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="profile-field">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="profile-field">
              <label>Current Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Lead Technical Recruiter"
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="grid-responsive grid-col-2 profile-fields-grid">
            <div className="profile-field">
              <label>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Acme Innovations Inc."
                className={`input-field ${errors.company_name ? 'input-error' : ''}`}
              />
              {errors.company_name && <span className="field-error">{errors.company_name}</span>}
            </div>

            <div className="profile-field">
              <label>Company Website</label>
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="https://acme.example.com"
                className="input-field"
              />
            </div>

            <div className="profile-field">
              <label>Industry Domain</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Artificial Intelligence / SaaS"
                className="input-field"
              />
            </div>

            <div className="profile-field">
              <label>Company Size</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select company size</option>
                <option value="1-10 Employees">1-10 Employees</option>
                <option value="11-50 Employees">11-50 Employees</option>
                <option value="50-200 Employees">50-200 Employees</option>
                <option value="250-500 Employees">250-500 Employees</option>
                <option value="500+ Employees">500+ Employees</option>
              </select>
            </div>

            <div className="profile-field full-width-field">
              <label>Headquarters / Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA / Remote"
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="profile-column">
            <div className="grid-responsive grid-col-2 profile-fields-grid">
              <div className="profile-field">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="profile-field">
                <label>Hiring Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Full-Stack Developers, ML Engineers"
                  className="input-field"
                />
              </div>
            </div>

            <div className="profile-field">
              <label>Recruiter Bio &amp; Overview</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell candidates about your recruiting focus and company culture..."
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="profile-column">
            <div className="grid-responsive grid-col-2 profile-fields-grid">
              <div className="profile-field">
                <label>Verification Status</label>
                <input
                  type="text"
                  disabled
                  value={formData.verification_status}
                  className="input-field verification-input"
                />
              </div>

              <div className="profile-field">
                <label>Corporate Tax ID / Registration</label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  placeholder="TAX-987654321"
                  className="input-field"
                />
              </div>
            </div>

            <div className="availability-section">
              <div className="availability-heading">
                <div>
                  <h3>
                    <FiAward />
                    Recruiter Available Timings
                  </h3>
                  <p>Enter one line per day in plain text.</p>
                </div>
              </div>

              {errors.availability && (
                <div className="availability-error">
                  <FiAlertCircle />
                  {errors.availability}
                </div>
              )}

              <div className="profile-field">
                <label>Availability</label>
                <textarea
                  value={availabilityText}
                  onChange={(e) => setAvailabilityText(e.target.value)}
                  rows={5}
                  className="input-field"
                  placeholder={`Monday: 09:00 - 18:00
Tuesday: 09:00 - 18:00
Wednesday: 09:00 - 18:00`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save and Reset Actions for all tabs */}
        <div className="profile-actions">
          <button type="button" onClick={handleReset} className="btn btn-outline" disabled={saving || loading}>
            <FiRefreshCw />
            Reset Changes
          </button>

          <button type="submit" disabled={saving || loading} className="btn btn-primary">
            <FiSave />
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CompanyProfile;