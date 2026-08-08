import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { resumeService } from '../../services/resumeService';
import { FiUploadCloud, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF or DOCX file to analyze.');
      return;
    }
    setUploading(true);
    try {
      await resumeService.uploadResume(file);
      toast.success('Resume uploaded & parsed successfully!');
      navigate('/student/resume-analysis');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Upload & Scan Resume">
      <div className="glass-card" style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>
          <FiUploadCloud />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Upload Resume for AI ATS Audit</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Drag and drop your PDF or Word resume. Our neural parser evaluates 50+ ATS parameters in real time.
        </p>

        <form onSubmit={handleUpload}>
          <div
            style={{
              border: '2px dashed rgba(79, 70, 229, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 1.5rem',
              background: 'rgba(79, 70, 229, 0.02)',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" style={{ cursor: 'pointer' }}>
              <FiFileText style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                {file ? file.name : 'Click to browse or drop resume file here'}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-subtle)' }}>PDF, DOCX up to 10MB</span>
            </label>
          </div>

          <button type="submit" disabled={uploading || !file} className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}>
            {uploading ? 'Analyzing Resume...' : 'Start AI Analysis'} <HiSparkles />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ResumeUpload;
