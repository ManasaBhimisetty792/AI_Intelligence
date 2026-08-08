import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { interviewService } from '../../services/interviewService';
import { FiCalendar, FiVideo, FiCheckCircle } from 'react-icons/fi';

export const PracticeHistory = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await interviewService.getMockSessions();
      setSessions(data);
    }
    load();
  }, []);

  return (
    <DashboardLayout title="AI Practice History & Archives">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Completed Interview Drills</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.6)', color: 'var(--color-muted)' }}>
              <th style={{ padding: '0.85rem' }}>Session Title</th>
              <th style={{ padding: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.85rem' }}>Score</th>
              <th style={{ padding: '0.85rem' }}>Date</th>
              <th style={{ padding: '0.85rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>{s.title}</td>
                <td style={{ padding: '0.85rem', color: 'var(--color-muted)' }}>{s.category}</td>
                <td style={{ padding: '0.85rem', color: 'var(--color-success)', fontWeight: 700 }}>{s.score}%</td>
                <td style={{ padding: '0.85rem', color: 'var(--color-muted)' }}>{s.date}</td>
                <td style={{ padding: '0.85rem' }}>
                  <Link to="/student/interview-report" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    View Diagnostics
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default PracticeHistory;
