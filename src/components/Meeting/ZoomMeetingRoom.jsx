import React, { useEffect, useState } from 'react';

import {
  FiAlertCircle,
  FiArrowLeft,
  FiLoader,
} from 'react-icons/fi';

import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackLoop,
  useParticipants,
  useTracks,
} from '@livekit/components-react';

import { Track } from 'livekit-client';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import { supabase } from "../../services/supabaseClient";

import '@livekit/components-styles';
import './zoommeeting.css';

const getApiBaseUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000'
  );
};

const RoomContent = ({
  requestId,
  participantRole,
}) => {
  const participants = useParticipants();

  const tracks = useTracks(
    [
      {
        source: Track.Source.Camera,
        withPlaceholder: true,
      },
      {
        source: Track.Source.ScreenShare,
        withPlaceholder: false,
      },
    ],
    {
      onlySubscribed: false,
    }
  );

  return (
    <div className="zoom-meeting-room">
      <div className="zoom-meeting-header">
        <div>
          <h1>Live Interview</h1>

          <p>
            Interview ID: {requestId}
            {' · '}
            Role: {participantRole || 'participant'}
          </p>
        </div>

        <div className="zoom-participant-count">
          {participants.length} participant
          {participants.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="zoom-meeting-grid">
        <TrackLoop tracks={tracks}>
          <ParticipantTile />
        </TrackLoop>
      </div>

      <RoomAudioRenderer />

      <ControlBar
        controls={{
          microphone: true,
          camera: true,
          screenShare: true,
          chat: true,
          leave: true,
        }}
      />
    </div>
  );
};

const ZoomMeetingRoom = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [participantRole, setParticipantRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchLiveKitToken = async () => {
      if (!requestId) {
        setError('Interview request ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const {
          data: {
            session,
          },
          error: sessionError,
        } = await supabase.auth.refreshSession();

        if (sessionError) {
          throw new Error(
            `Unable to retrieve Supabase session: ${sessionError.message}`
          );
        }

        const accessToken = session?.access_token;

        if (!accessToken) {
          throw new Error(
            'No active Supabase session. Please log in again.'
          );
        }

        const response = await fetch(
          `${getApiBaseUrl()}/api/v1/livekit/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              request_id: requestId,
            }),
          }
        );

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          data = {
            message: responseText,
          };
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.message ||
              `LiveKit request failed with status ${response.status}.`
          );
        }

        if (!data.token || !data.livekit_url) {
          throw new Error(
            'Backend returned incomplete LiveKit connection details.'
          );
        }

        if (active) {
          setToken(data.token);
          setServerUrl(data.livekit_url);
          setParticipantRole(
            data.role || 'participant'
          );
        }
      } catch (tokenError) {
        console.error(
          'LiveKit token error:',
          tokenError
        );

        if (active) {
          setError(
            tokenError?.message ||
              'Unable to join interview room.'
          );

          toast.error(
            tokenError?.message ||
              'Unable to join interview.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchLiveKitToken();

    return () => {
      active = false;
    };
  }, [requestId]);

  if (loading) {
    return (
      <div className="zoom-meeting-state">
        <FiLoader className="spin-animation" />
        <p>Preparing interview room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zoom-meeting-state zoom-meeting-error">
        <FiAlertCircle />

        <h2>Unable to join interview</h2>

        <p>{error}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="zoom-meeting-page">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
        onDisconnected={() => {
          toast('You left the interview room.');
          navigate(-1);
        }}
        onError={(roomError) => {
          console.error(
            'LiveKit room error:',
            roomError
          );

          toast.error(
            roomError?.message ||
              'LiveKit room error.'
          );
        }}
      >
        <RoomContent
          requestId={requestId}
          participantRole={participantRole}
        />
      </LiveKitRoom>
    </div>
  );
};

export default ZoomMeetingRoom;