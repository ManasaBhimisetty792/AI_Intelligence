import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { FiUploadCloud, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const ResumeScreening = () => {
  const handleBatchScreen = () => {
    toast.success('Batch of 25 candidate resumes processed. Rank order updated!');
  };

  return (
    <DashboardLayout title="Batch AI Resume Screening Engine">
      <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <FiUploadCloud style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Batch Upload Resumes for Automated Ranking</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Upload zip or multiple PDF candidate resumes to automatically rank candidates against your job parameters.
        </p>
        <button onClick={handleBatchScreen} className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}>
          <HiSparkles /> Start Batch AI Screening Process
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ResumeScreening;
