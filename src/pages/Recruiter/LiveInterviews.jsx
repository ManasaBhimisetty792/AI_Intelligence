import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import {
  FiArrowLeft, FiLoader, FiCheckCircle, FiVideo, FiUsers, FiClock, FiShield, FiCalendar
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import ZoomMeetingRoom from '../../components/Meeting/ZoomMeetingRoom';
import { livekitService } from '../../services/livekitService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import './LiveInterview.css';

const LiveInterview = () => {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const querySession = searchParams.get('session') || searchParams.get('id');
  const queryRoom = searchParams.get('room');
  
  // Guarantee both student & recruiter default to the EXACT SAME room name in demo mode
  const activeSessionId = paramSessionId || querySession || queryRoom || 'demo_live_interview';

  const [conn, setConn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // 1. Fetch Request & Meeting Metadata
  useEffect(() => {
    const fetchInterviewInfo = async () => {
      if (isSupabaseConfigured() && activeSessionId && activeSessionId !== 'demo_live_interview') {
        try {
          const { data } = await supabase
            .from('interview_requests')
            .select('*')
            .eq('id', activeSessionId)
            .maybeSingle();

          if (data) {
            setSessionData(data);
          }
        } catch (e) {
          console.warn('Could not fetch request info:', e);
        }
      }
    };
    fetchInterviewInfo();
  }, [activeSessionId]);

  // 2. Obtain LiveKit Room Token as Recruiter Host
  useEffect(() => {
    const loadToken = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await livekitService.getToken(activeSessionId, 'recruiter');
        setConn(data);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to initialize recruiter meeting room');
      } finally {
        setLoading(false);
      }
    };

    if (activeSessionId) loadToken();
  }, [activeSessionId]);

  const handleJoinClick = () => {
    if (!conn) {
      toast.error('Meeting credentials loading...');
      return;
    }
    setHasJoined(true);
    livekitService.startSession(activeSessionId, conn.room, 'recruiter');
    toast.success('Entering Live Zoom Host Control Room...');
  };

  const handleDisconnected = async () => {
    await livekitService.endSession(activeSessionId);
    navigate('/recruiter/schedule');
  };

  if (loading) {
    return (
      <DashboardLayout title="Recruiter Live Room">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          <FiLoader className="spin-animation" style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <div style={{ fontWeight: 600 }}>Initializing host video room credentials...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Recruiter Live Room">
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <h3 style={{ color: 'var(--color-danger)', marginTop: 0 }}>Unable to Join Session</h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            <FiArrowLeft /> Back to Schedule
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── ACTIVE FULL-SCREEN ZOOM-STYLE LIVEKIT MEETING ROOM FOR RECRUITER ─────
  if (hasJoined && conn) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0f19' }}>
        <LiveKitRoom
          serverUrl={conn.url}
          token={conn.token}
          connect={true}
          audio={true}
          video={true}
          onDisconnected={handleDisconnected}
          style={{ height: '100vh', width: '100vw' }}
        >
          <ZoomMeetingRoom onLeave={handleDisconnected} userRole="recruiter" />
        </LiveKitRoom>
      </div>
    );
  }

  // ── PRE-JOIN RECRUITER INTERVIEW SCHEDULED PAGE WITH THEME CSS ───────────
  return (
    <DashboardLayout title="Recruiter Live Room">
      <div style={{ maxWidth: '720px', margin: '1.5rem auto' }}>
        <div className="glass-card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span className="badge-glass" style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiShield /> Recruiter Host Control
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiClock /> Room ID: <code style={{ background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', fontWeight: 700 }}>{conn?.room || activeSessionId}</code>
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Candidate Interview Ready
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
            You can launch the live interactive video interview as host. Both candidate and recruiter streams will be synchronized in real time inside the Zoom-style multi-video interface.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', background: 'var(--color-surface-sec)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Role / Session</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {sessionData?.interview_type || 'Host Screening'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Host Room Status</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiCheckCircle /> Active & Ready
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Participant Engine</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                Zoom / LiveKit HD
              </div>
            </div>
          </div>

          {/* THEME CSS STYLED HOST JOIN BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleJoinClick}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              <FiVideo style={{ fontSize: '1.3rem' }} /> Start & Join Meeting as Host
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Clicking above launches the host video room. Allow camera & microphone access when requested.
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveInterview;