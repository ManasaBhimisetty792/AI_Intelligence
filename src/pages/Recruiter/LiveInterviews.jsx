import React, {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  FiLoader,
  FiCheckCircle,
  FiVideo,
  FiClock,
  FiShield,
} from 'react-icons/fi';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';

import {
  supabase,
  isSupabaseConfigured,
} from '../../services/supabaseClient';

import toast from 'react-hot-toast';

import './LiveInterview.css';


// ============================================================
// LIVE INTERVIEW PAGE
// ============================================================

const LiveInterview = () => {

  const {
    sessionId: paramSessionId,
  } = useParams();

  const [
    searchParams,
  ] = useSearchParams();

  const navigate = useNavigate();


  // ==========================================================
  // DETERMINE INTERVIEW ID
  // ==========================================================

  const querySession =
    searchParams.get('session') ||
    searchParams.get('id');

  const queryRoom =
    searchParams.get('room');

  const activeSessionId =
    paramSessionId ||
    querySession ||
    queryRoom;


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    sessionData,
    setSessionData,
  ] = useState(null);


  // ==========================================================
  // DEBUG PAGE
  // ==========================================================

  useEffect(() => {

    console.log('');
    console.log(
      '################################################'
    );
    console.log(
      '[LiveInterview] RECRUITER PAGE'
    );
    console.log(
      '################################################'
    );

    console.log(
      '[LiveInterview] URL sessionId:',
      paramSessionId
    );

    console.log(
      '[LiveInterview] Query session:',
      querySession
    );

    console.log(
      '[LiveInterview] Query room:',
      queryRoom
    );

    console.log(
      '[LiveInterview] FINAL INTERVIEW ID:',
      activeSessionId
    );

    console.log(
      '################################################'
    );

  }, [
    paramSessionId,
    querySession,
    queryRoom,
    activeSessionId,
  ]);


  // ==========================================================
  // FETCH INTERVIEW DATA
  // ==========================================================

  useEffect(() => {

    let active = true;

    const fetchInterviewInfo =
      async () => {

        console.log('');
        console.log(
          '================================================'
        );
        console.log(
          '[LiveInterview] FETCHING INTERVIEW'
        );
        console.log(
          '================================================'
        );

        if (!activeSessionId) {

          console.error(
            '[LiveInterview] No interview ID found.'
          );

          if (active) {

            setError(
              'Interview session ID is missing.'
            );

            setLoading(false);
          }

          return;
        }


        // ----------------------------------------------------
        // DEMO MODE
        // ----------------------------------------------------

        if (
          activeSessionId ===
          'demo_live_interview'
        ) {

          console.warn(
            '[LiveInterview] Demo session detected.'
          );

          if (active) {

            setSessionData({
              id: activeSessionId,
              interview_type:
                'Demo Interview',
              status:
                'accepted',
            });

            setLoading(false);
          }

          return;
        }


        // ----------------------------------------------------
        // SUPABASE CONFIGURATION
        // ----------------------------------------------------

        if (!isSupabaseConfigured()) {

          console.warn(
            '[LiveInterview] Supabase is not configured.'
          );

          if (active) {

            setSessionData({
              id: activeSessionId,
              interview_type:
                'Interview',
              status:
                'accepted',
            });

            setLoading(false);
          }

          return;
        }


        // ----------------------------------------------------
        // FETCH INTERVIEW REQUEST
        // ----------------------------------------------------

        try {

          console.log(
            '[LiveInterview] Querying interview_requests...'
          );

          console.log(
            '[LiveInterview] Interview ID:',
            activeSessionId
          );

          const {
            data,
            error: supabaseError,
          } = await supabase
            .from('interview_requests')
            .select('*')
            .eq(
              'id',
              activeSessionId
            )
            .maybeSingle();


          if (supabaseError) {

            console.error(
              '[LiveInterview] Supabase error:',
              supabaseError
            );

            throw supabaseError;
          }


          if (!data) {

            console.error(
              '[LiveInterview] Interview not found.'
            );

            throw new Error(
              'Interview request not found.'
            );
          }


          console.log(
            '[LiveInterview] Interview data:',
            data
          );

          console.log(
            '[LiveInterview] Meeting ID:',
            data.meeting_id
          );

          console.log(
            '[LiveInterview] Meeting Link:',
            data.meeting_link
          );

          console.log(
            '[LiveInterview] Status:',
            data.status
          );

          console.log(
            '[LiveInterview] Student ID:',
            data.student_id
          );

          console.log(
            '[LiveInterview] Recruiter ID:',
            data.recruiter_user_id ||
              data.recruiter_id
          );


          if (active) {

            setSessionData(data);

            setLoading(false);
          }

        } catch (fetchError) {

          console.error(
            '[LiveInterview] Failed to load interview:',
            fetchError
          );

          if (active) {

            setError(
              fetchError?.message ||
                'Unable to load interview.'
            );

            setLoading(false);
          }
        }
      };


    fetchInterviewInfo();


    return () => {
      active = false;
    };

  }, [
    activeSessionId,
  ]);


  // ==========================================================
  // JOIN BUTTON
  // ==========================================================

  const handleJoinClick = () => {

    console.log('');
    console.log(
      '################################################'
    );
    console.log(
      '[LiveInterview] RECRUITER CLICKED JOIN'
    );
    console.log(
      '################################################'
    );

    console.log(
      '[LiveInterview] Interview ID:',
      activeSessionId
    );

    console.log(
      '[LiveInterview] Navigating to shared interview session route...'
    );

    console.log(
      '################################################'
    );

    // Navigate to the shared session route so ZoomMeetingRoom
    // receives the requestId via useParams() correctly.
    toast.success('Entering interview room...');
    navigate(`/interviews/session/${activeSessionId}`);
  };


  // ==========================================================
  // LEAVE
  // ==========================================================

  const handleDisconnected =
    async () => {

      console.log('');
      console.log(
        '================================================'
      );
      console.log(
        '[LiveInterview] RECRUITER LEFT ROOM'
      );
      console.log(
        '================================================'
      );

      console.log(
        '[LiveInterview] Interview ID:',
        activeSessionId
      );

      navigate('/recruiter/live-interviews');
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <DashboardLayout>

        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
          }}
        >

          <FiLoader
            className="spin-animation"
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}
          />

          <div
            style={{
              fontWeight: 600,
            }}
          >
            Loading interview...
          </div>

          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              opacity: 0.7,
            }}
          >
            Interview ID:
            {' '}
            {activeSessionId}
          </div>

        </div>

      </DashboardLayout>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <DashboardLayout>

        <div
          className="glass-card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '2rem auto',
          }}
        >

          <h3
            style={{
              color:
                'var(--color-danger)',
            }}
          >
            Unable to Load Interview
          </h3>

          <p
            style={{
              color:
                'var(--color-muted)',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="btn btn-outline"
          >
            Back
          </button>

        </div>

      </DashboardLayout>
    );
  }


  // ==========================================================
  // ACTIVE LIVEKIT ROOM
  // ==========================================================




  // ==========================================================
  // PRE-JOIN PAGE
  // ==========================================================

  return (
    <DashboardLayout>

      <div
        style={{
          maxWidth: '720px',
          margin: '1.5rem auto',
        }}
      >

        <div
          className="glass-card"
          style={{
            padding: '2.25rem',
            borderRadius:
              'var(--radius-2xl)',
            border:
              '1px solid var(--color-border)',
          }}
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >

            <span
              className="badge-glass"
              style={{
                color:
                  'var(--color-primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >

              <FiShield />

              Recruiter Host Control

            </span>


            <span
              style={{
                fontSize: '0.82rem',
                color:
                  'var(--color-muted)',
              }}
            >

              Interview ID:

              {' '}

              <code>
                {activeSessionId}
              </code>

            </span>

          </div>


          {/* ==================================================
              TITLE
          ================================================== */}

          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color:
                'var(--color-text)',
              marginBottom:
                '0.5rem',
              lineHeight: 1.2,
            }}
          >
            Candidate Interview Ready
          </h2>


          <p
            style={{
              color:
                'var(--color-muted)',
              fontSize: '0.92rem',
              marginBottom:
                '1.75rem',
            }}
          >
            You can launch the live
            interactive video interview
            as host.
          </p>


          {/* ==================================================
              INFORMATION
          ================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1.25rem',
              background:
                'var(--color-surface-sec)',
              borderRadius:
                'var(--radius-xl)',
              border:
                '1px solid var(--color-border)',
            }}
          >

            <div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color:
                    'var(--color-muted)',
                  textTransform:
                    'uppercase',
                  fontWeight: 700,
                }}
              >
                Interview Type
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color:
                    'var(--color-text)',
                  marginTop:
                    '0.2rem',
                }}
              >
                {
                  sessionData?.interview_type ||
                  'Host Screening'
                }
              </div>

            </div>


            <div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color:
                    'var(--color-muted)',
                  textTransform:
                    'uppercase',
                  fontWeight: 700,
                }}
              >
                Status
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color:
                    'var(--color-success)',
                  marginTop:
                    '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >

                <FiCheckCircle />

                {
                  sessionData?.status ||
                  'Ready'
                }

              </div>

            </div>


            <div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color:
                    'var(--color-muted)',
                  textTransform:
                    'uppercase',
                  fontWeight: 700,
                }}
              >
                Participant Engine
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color:
                    'var(--color-primary)',
                  marginTop:
                    '0.2rem',
                }}
              >
                LiveKit HD
              </div>

            </div>

          </div>


          {/* ==================================================
              DEBUG INFORMATION
          ================================================== */}

          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background:
                'rgba(0,0,0,0.04)',
              borderRadius:
                '10px',
              fontSize: '12px',
            }}
          >

            <strong>
              Debug Information
            </strong>

            <br />

            Request ID:
            {' '}
            {activeSessionId}

            <br />

            Meeting ID:
            {' '}
            {sessionData?.meeting_id ||
              'Will be resolved by backend'}

            <br />

            Role:
            {' '}
            recruiter

            <br />

            LiveKit Token:
            {' '}
            Not requested yet

          </div>


          {/* ==================================================
              JOIN BUTTON
          ================================================== */}

          <div
            style={{
              display: 'flex',
              flexDirection:
                'column',
              gap: '0.75rem',
            }}
          >

            <button
              onClick={
                handleJoinClick
              }
              className="btn btn-primary"
              style={{
                width: '100%',
                padding:
                  '1rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                borderRadius:
                  'var(--radius-xl)',
                background:
                  'var(--gradient-primary)',
                boxShadow:
                  'var(--shadow-glow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                gap: '0.6rem',
              }}
            >

              <FiVideo
                style={{
                  fontSize: '1.3rem',
                }}
              />

              Start & Join Meeting
              as Host

            </button>


            <div
              style={{
                textAlign: 'center',
                fontSize: '0.78rem',
                color:
                  'var(--color-muted)',
              }}
            >
              Clicking above will
              connect you to the same
              LiveKit room used by the
              candidate.
            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default LiveInterview;