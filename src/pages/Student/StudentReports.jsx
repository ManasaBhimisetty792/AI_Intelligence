import React from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiTrendingUp, FiDownload, FiCheckCircle,
  FiAward, FiPieChart, FiArrowUpRight, FiSliders
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import './studentReports.css';

export const StudentReports = () => {
  const handleExportPDF = () => {
    toast.success(' Generating AI Career Growth Report PDF...');
  };

  return (
    <DashboardLayout title="AI Career Growth Reports">
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Banner */}
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.12) 100%)', border: '1px solid rgba(79,70,229,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge-ai"><HiSparkles /> AI Analytics Engine</span>
                <span className="badge-glass" style={{ fontSize: '0.72rem' }}>Growth Delta: +14%</span>
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '0.2rem 0' }}>AI Career Growth & Performance Analytics</h2>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
                Track your longitudinal progress across mock drills, ATS resume compatibility, and technical readiness.
              </p>
            </div>

            <button onClick={handleExportPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiDownload /> Export PDF Report
            </button>
          </div>
        </div>

        {/* Growth Comparison: Current vs Previous */}
        <div className="reports-comparison-grid">

          {/* Current AI Report Card */}
          <div className="report-card-comparison">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="badge-glass" style={{ color: '#10B981', fontWeight: 700 }}>CURRENT AI REPORT</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.2rem 0' }}>July 2026 Assessment</h3>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10B981' }}>92%</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Technical System Design</span>
                  <strong>94%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '94%', background: '#10B981', borderRadius: '9999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Communication & Behavioral</span>
                  <strong>90%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '90%', background: '#818CF8', borderRadius: '9999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>ATS Resume Optimization</span>
                  <strong>94%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '94%', background: '#10B981', borderRadius: '9999px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Previous AI Report Card */}
          <div className="report-card-comparison" style={{ opacity: 0.85 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="badge-glass" style={{ color: 'var(--color-muted)', fontWeight: 700 }}>PREVIOUS AI REPORT</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.2rem 0' }}>June 2026 Assessment</h3>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#F59E0B' }}>78%</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Technical System Design</span>
                  <strong>80%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '80%', background: '#F59E0B', borderRadius: '9999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Communication & Behavioral</span>
                  <strong>75%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '75%', background: '#F59E0B', borderRadius: '9999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>ATS Resume Optimization</span>
                  <strong>79%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '79%', background: '#F59E0B', borderRadius: '9999px' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Visualizations Placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Radar Chart Placeholder */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 1rem', textTransform: 'uppercase' }}>
              SKILL COMPETENCY RADAR
            </h4>
            <div className="chart-placeholder-box">
              <FiPieChart size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>Skill Competency Radar Chart</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Compares technical vs behavioral vectors</div>
            </div>
          </div>

          {/* Growth Graph Placeholder */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 1rem', textTransform: 'uppercase' }}>
              PROGRESSION TREND
            </h4>
            <div className="chart-placeholder-box">
              <FiTrendingUp size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>Growth Velocity Curve</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Tracks monthly percentile increase</div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentReports;
