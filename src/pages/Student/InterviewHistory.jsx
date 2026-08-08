import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiList, FiClock, FiCalendar, FiStar, FiFileText,
  FiDownload, FiVideo, FiSearch, FiFilter, FiCheckCircle, FiChevronRight, FiX
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import interviewService from '../../services/interviewService';
import toast from 'react-hot-toast';
import './interviewHistory.css';

const MOCK_INTERVIEWS = [
  {
    id: 'INT-9012',
    recruiter: 'Sarah Jenkins',
    company: 'Nexus Tech Global',
    date: '2026-07-24',
    duration: '45 mins',
    type: 'Technical Deep Dive',
    techStack: ['React', 'TypeScript', 'FastAPI'],
    difficulty: 'Advanced',
    rating: 4.9,
    overallScore: 92,
    communicationScore: 90,
    technicalScore: 94,
    problemSolvingScore: 91,
    confidenceScore: 93,
    strengths: ['Deep understanding of React 19 concurrent features', 'Clean modular architecture design'],
    weaknesses: ['Could improve GraphQL query optimization examples'],
    feedback: 'Outstanding technical performance. High potential for Lead Engineer roles.',
    aiSummary: 'Candidate demonstrated exceptional clarity in state management and backend FastAPI schema creation.',
    recommendations: ['Practice caching strategies under high load.']
  },
  {
    id: 'INT-8841',
    recruiter: 'Marcus Vance',
    company: 'Quantum Software Labs',
    date: '2026-07-18',
    duration: '60 mins',
    type: 'System Design',
    techStack: ['Distributed Systems', 'Redis', 'Kafka'],
    difficulty: 'Hard',
    rating: 4.8,
    overallScore: 88,
    communicationScore: 85,
    technicalScore: 90,
    problemSolvingScore: 88,
    confidenceScore: 89,
    strengths: ['Solid database partitioning strategy', 'Clear diagramming'],
    weaknesses: ['Slight delay in back-of-the-envelope estimations'],
    feedback: 'Very strong candidate. Recommended for Senior System Architect track.',
    aiSummary: 'Well-structured response to large-scale web socket architecture drill.',
    recommendations: ['Review load balancer failover algorithms.']
  }
];

export const StudentInterviewHistory = () => {
  const [viewMode, setViewMode] = useState('card'); // 'table' | 'card' | 'timeline'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [liveRequests, setLiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    interviewService.getStudentInterviewRequests().then(data => {
      if (isMounted) {
        setLiveRequests(data || []);
        setLoading(false);
      }
    }).catch(err => {
      console.warn('Error loading live interview requests:', err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const formattedLiveRequests = liveRequests.map(r => ({
    id: r.id ? `REQ-${r.id.slice(0, 6)}` : 'REQ-LIVE',
    recruiter: r.recruiter || 'Recruiter',
    company: r.company || 'Tech Partner',
    date: r.date || new Date().toLocaleDateString(),
    duration: r.duration || '60 mins',
    type: r.type || 'Mock Interview',
    techStack: [r.type || 'Mock Drill'],
    difficulty: 'Intermediate',
    rating: 5.0,
    overallScore: r.status === 'accepted' ? 'ACCEPTED' : r.status === 'pending' ? 'PENDING' : 'DECLINED',
    isLiveRequest: true,
    status: r.status,
    message: r.message || '',
    avatar: r.recruiter_avatar,
    technicalScore: r.status === 'accepted' ? 95 : 0,
    communicationScore: r.status === 'accepted' ? 90 : 0,
    problemSolvingScore: r.status === 'accepted' ? 92 : 0,
    confidenceScore: r.status === 'accepted' ? 94 : 0,
    strengths: r.status === 'accepted'
      ? ['Interview request confirmed by recruiter', 'Scheduled for 1-on-1 session']
      : ['Awaiting recruiter review and schedule confirmation'],
    weaknesses: [],
    feedback: r.status === 'accepted'
      ? 'Accepted by recruiter! Please arrive 5 minutes early in the live interview room.'
      : 'Interview request pending recruiter response.',
    aiSummary: `Requested ${r.type || 'Interview'} with ${r.recruiter || 'Recruiter'}. Status: ${r.status || 'pending'}.`,
    recommendations: ['Prepare your portfolio and key technical questions.']
  }));

  const allInterviews = [...formattedLiveRequests, ...MOCK_INTERVIEWS];

  const filteredInterviews = allInterviews.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.recruiter || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Interview History & Scorecards">
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Top Control Bar */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search history by recruiter or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div className="history-view-toggle">
            <button onClick={() => setViewMode('card')} className={`history-view-btn ${viewMode === 'card' ? 'active' : ''}`}>
              <FiGrid /> Card View
            </button>
            <button onClick={() => setViewMode('table')} className={`history-view-btn ${viewMode === 'table' ? 'active' : ''}`}>
              <FiList /> Table View
            </button>
            <button onClick={() => setViewMode('timeline')} className={`history-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}>
              <FiClock /> Timeline View
            </button>
          </div>
        </div>

        {/* ── CARD VIEW ── */}
        {viewMode === 'card' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filteredInterviews.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <span className="badge-glass" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>{item.id} • {item.type}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.3rem 0 0' }}>{item.recruiter}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>{item.company}</div>
                    </div>

                    <div
                      className="score-badge-circle"
                      style={{
                        background: typeof item.overallScore === 'number'
                          ? (item.overallScore >= 90 ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F59E0B, #D97706)')
                          : (item.status === 'accepted' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #6366F1, #4F46E5)'),
                        fontSize: typeof item.overallScore === 'number' ? '1.1rem' : '0.65rem',
                        padding: '0.2rem',
                        textAlign: 'center',
                      }}
                    >
                      {typeof item.overallScore === 'number' ? `${item.overallScore}%` : item.overallScore}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <span>📅 {item.date}</span>
                    <span>⏱️ {item.duration}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(item.techStack || []).map((tech, idx) => (
                      <span key={idx} className="badge-glass" style={{ fontSize: '0.72rem' }}>{tech}</span>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setSelectedInterview(item)} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}>
                    View Detailed Scorecard
                  </button>
                  <button onClick={() => toast.success('PDF download started')} className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                    <FiDownload />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>ID & Recruiter</th>
                  <th style={{ padding: '0.75rem' }}>Company</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Overall Status / Score</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{item.recruiter} <br/><span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{item.id}</span></td>
                    <td style={{ padding: '0.75rem' }}>{item.company}</td>
                    <td style={{ padding: '0.75rem' }}>{item.type}</td>
                    <td style={{ padding: '0.75rem' }}>{item.date}</td>
                    <td style={{ padding: '0.75rem', color: '#10B981', fontWeight: 900 }}>
                      {typeof item.overallScore === 'number' ? `${item.overallScore}%` : item.overallScore}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button onClick={() => setSelectedInterview(item)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {viewMode === 'timeline' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredInterviews.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', fontSize: '0.82rem', color: 'var(--color-muted)', fontWeight: 700 }}>{item.date}</div>
                  <div style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{item.type} with {item.recruiter} ({item.company})</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '0.3rem 0' }}>{item.aiSummary || item.feedback}</div>
                    <div style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>
                      Status / Score: {typeof item.overallScore === 'number' ? `${item.overallScore}%` : item.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scorecard Modal */}
        {selectedInterview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '650px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span className="badge-glass" style={{ fontSize: '0.72rem' }}>{selectedInterview.id}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0' }}>Scorecard: {selectedInterview.type}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Recruiter: {selectedInterview.recruiter} ({selectedInterview.company})</div>
                </div>
                <button onClick={() => setSelectedInterview(null)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', margin: '1rem 0 1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Technical</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>{selectedInterview.technicalScore || 90}%</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Communication</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818CF8' }}>{selectedInterview.communicationScore || 90}%</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Problem Solving</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>{selectedInterview.problemSolvingScore || 90}%</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Confidence</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EC4899' }}>{selectedInterview.confidenceScore || 90}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#10B981' }}>Strengths</h4>
                  <ul>{(selectedInterview.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#F59E0B' }}>Recruiter Feedback</h4>
                  <p style={{ margin: 0, color: 'var(--color-muted)', lineHeight: 1.5 }}>{selectedInterview.feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentInterviewHistory;
