import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useParticipants,
  useTracks,
  useChat,
} from '@livekit/components-react';

import {
  RoomEvent,
  ConnectionState,
  Track,
} from 'livekit-client';

import {
  FiArrowLeft,
  FiLoader,
  FiPhoneOff,
  FiUsers,
  FiLock,
  FiMessageSquare,
  FiSend,
  FiX,
} from 'react-icons/fi';

import { useNavigate, useParams } from 'react-router-dom';

import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

import livekitService from '../../services/livekitService';

import '@livekit/components-styles';

import './zoommeeting.css';


// ============================================================
// CUSTOM CHAT PANEL
// ============================================================

// ChatPanel receives all chat data from parent (useChat is in RoomInner)
const ChatPanel = ({ identity, onClose, chatMessages, send, isSending }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;
    try {
      await send(text);
      setInputText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(
      typeof timestamp === 'number' ? timestamp : timestamp
    );
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="zoom-chat-panel">

      {/* HEADER */}
      <div className="zoom-chat-header">
        <div className="zoom-chat-title">
          <FiMessageSquare size={16} />
          Live Chat
        </div>
        <button
          onClick={onClose}
          className="zoom-chat-close"
          title="Close chat"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="zoom-chat-messages">
        {chatMessages.length === 0 ? (
          <div className="zoom-chat-empty">
            <FiMessageSquare size={32} style={{ opacity: 0.3 }} />
            <p>No messages yet.</p>
            <p>Say hello! 👋</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMe = msg.from?.identity === identity;
            return (
              <div
                key={msg.id ?? idx}
                className={`zoom-chat-bubble ${
                  isMe ? 'zoom-chat-bubble-me' : 'zoom-chat-bubble-them'
                }`}
              >
                {!isMe && (
                  <div className="zoom-chat-sender">
                    {msg.from?.name || msg.from?.identity || 'Participant'}
                  </div>
                )}
                <div className="zoom-chat-text">{msg.message}</div>
                <div className="zoom-chat-time">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="zoom-chat-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="zoom-chat-input"
          maxLength={500}
          disabled={isSending}
        />
        <button
          type="submit"
          className="zoom-chat-send"
          disabled={!inputText.trim() || isSending}
          title="Send"
        >
          <FiSend size={16} />
        </button>
      </form>

    </div>
  );
};



// ============================================================
// ROOM CONTENT
// ============================================================

// Inner component that reads participants/tracks from parent hooks
const RoomInner = ({
  requestId,
  participantRole,
  identity,
  participants,
  tracks,
  onLeaveClick,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ── SINGLE useChat instance — always mounted, never destroyed ──
  const { chatMessages, send, isSending } = useChat();
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMsgCount = useRef(0);

  // Count messages that arrive while chat panel is closed
  useEffect(() => {
    const newMsgs = chatMessages.length - prevMsgCount.current;
    if (newMsgs > 0 && !isChatOpen) {
      setUnreadCount((c) => c + newMsgs);
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages.length, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };

  return (
    <div className="zoom-meeting-container">

      {/* =====================================================
          HEADER NAVBAR
      ====================================================== */}

      <div className="zoom-meeting-header">

        <div className="zoom-brand-group">

          <div className="zoom-live-badge">
            <span className="zoom-live-dot" />
            LIVE
          </div>

          <div>
            <h1 className="zoom-header-title">
              Live Interview Studio
            </h1>

            <div className="zoom-interview-info">
              <span>ID: {requestId ? `${requestId.slice(0, 8)}...` : 'Session'}</span>
              <span>·</span>
              <span className="zoom-chip zoom-chip-role">
                {participantRole || 'Participant'}
              </span>
              <span>·</span>
              <span className="zoom-chip">
                <FiLock style={{ fontSize: '0.72rem' }} /> Encrypted
              </span>
            </div>
          </div>

        </div>

        {/* ACTIONS & LEAVE */}

        <div className="zoom-header-actions">
          <div className="zoom-participant-count">
            <FiUsers style={{ fontSize: '0.9rem' }} />
            {participants.length} Active {participants.length === 1 ? 'User' : 'Users'}
          </div>

          {/* CHAT TOGGLE BUTTON */}
          <button
            onClick={isChatOpen ? () => setIsChatOpen(false) : handleOpenChat}
            className={`zoom-chat-toggle ${
              isChatOpen ? 'zoom-chat-toggle-active' : ''
            }`}
            title={isChatOpen ? 'Close chat' : 'Open chat'}
          >
            <FiMessageSquare size={17} />
            Chat
            {unreadCount > 0 && !isChatOpen && (
              <span className="zoom-unread-badge">{unreadCount}</span>
            )}
          </button>

          <button
            onClick={onLeaveClick}
            className="btn-leave-room"
            title="Leave Interview Room"
          >
            <FiPhoneOff style={{ fontSize: '1rem' }} />
            End Call
          </button>
        </div>

      </div>


      {/* =====================================================
          MAIN WORKSPACE: VIDEO + CHAT SIDE PANEL
      ====================================================== */}

      <div className="zoom-workspace">

        {/* VIDEO GRID */}
        <div className="zoom-meeting-grid">
          <GridLayout
            tracks={tracks}
            style={{ height: '100%', width: '100%' }}
          >
            <ParticipantTile />
          </GridLayout>
        </div>

        {/* CUSTOM CHAT PANEL — always receives props from the single useChat instance */}
        {isChatOpen && (
          <ChatPanel
            identity={identity}
            onClose={() => setIsChatOpen(false)}
            chatMessages={chatMessages}
            send={send}
            isSending={isSending}
          />
        )}

      </div>


      {/* =====================================================
          AUDIO RENDERER & FLOATING DOCK
      ====================================================== */}

      <RoomAudioRenderer />

      <ControlBar
        controls={{
          microphone: true,
          camera: true,
          screenShare: true,
          chat: false,
          leave: false,
        }}
      />

    </div>
  );
};

const RoomContent = ({
  requestId,
  participantRole,
  roomName,
  identity,
  onLeaveClick,
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
    { onlySubscribed: false }
  );

  return (
    <LayoutContextProvider>
      <RoomInner
        requestId={requestId}
        participantRole={participantRole}
        identity={identity}
        participants={participants}
        tracks={tracks}
        onLeaveClick={onLeaveClick}
      />
    </LayoutContextProvider>
  );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const ZoomMeetingRoom = ({
  userRole: propUserRole,
  onLeave,
}) => {

  const navigate = useNavigate();

  const { requestId } = useParams();

  const {
    user,
    role: contextRole,
    loading: authLoading,
  } = useAuth();

  const role =
    propUserRole ||
    contextRole;


  // ==========================================================
  // STATE
  // ==========================================================

  const [token, setToken] =
    useState('');

  const [serverUrl, setServerUrl] =
    useState('');

  const [roomName, setRoomName] =
    useState('');

  const [identity, setIdentity] =
    useState('');

  const [participantName, setParticipantName] =
    useState('');

  const [participantRole, setParticipantRole] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [connectionState, setConnectionState] =
    useState('disconnected');


  // ==========================================================
  // REFS & STABLE MEMO
  // ==========================================================

  // Prevent duplicate token requests (StrictMode double-invoke guard)
  const tokenRequestRef = useRef(false);

  // Track whether we have ever successfully connected
  const hasConnectedRef = useRef(false);

  // Track whether the user explicitly clicked Leave
  const isUserLeavingRef = useRef(false);

  // Track whether the component is mounted
  const isMountedRef = useRef(true);

  // Stable LiveKit room options reference so LiveKitRoom does not reconnect on state re-renders
  const livekitOptions = useMemo(
    () => ({
      adaptiveStream: true,
      dynacast: true,
    }),
    []
  );

  // Register unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleUserLeave = () => {
    console.log('[ZoomMeetingRoom] User clicked Leave Interview');
    isUserLeavingRef.current = true;
    toast('You left the interview room.');

    if (onLeave) {
      onLeave();
    } else {
      navigate(-1);
    }
  };


  // ==========================================================
  // DEBUG: COMPONENT MOUNT
  // ==========================================================

  useEffect(() => {
    console.log('');
    console.log(
      '################################################'
    );
    console.log(
      '[ZoomMeetingRoom] COMPONENT MOUNTED'
    );
    console.log(
      '################################################'
    );

    console.log(
      '[ZoomMeetingRoom] Request ID:',
      requestId
    );

    console.log(
      '[ZoomMeetingRoom] User:',
      user
    );

    console.log(
      '[ZoomMeetingRoom] Context Role:',
      contextRole
    );

    console.log(
      '[ZoomMeetingRoom] Prop Role:',
      propUserRole
    );

    console.log(
      '[ZoomMeetingRoom] Final Role:',
      role
    );

    return () => {
      console.log(
        '[ZoomMeetingRoom] COMPONENT UNMOUNTED'
      );
    };
  }, []);


  // ==========================================================
  // FETCH TOKEN
  // ==========================================================

  useEffect(() => {

    let active = true;

    const fetchLiveKitToken =
      async () => {

        console.log('');
        console.log(
          '================================================'
        );
        console.log(
          '[ZoomMeetingRoom] TOKEN FETCH START'
        );
        console.log(
          '================================================'
        );

        if (authLoading) {
          console.log(
            '[ZoomMeetingRoom] Auth still loading.'
          );

          return;
        }

        if (!requestId) {

          console.error(
            '[ZoomMeetingRoom] requestId is missing.'
          );

          if (active) {
            setError(
              'Interview request ID is missing.'
            );

            setLoading(false);
          }

          return;
        }

        if (!user) {

          console.error(
            '[ZoomMeetingRoom] User is not authenticated.'
          );

          if (active) {
            setError(
              'You must be signed in to join the interview room.'
            );

            setLoading(false);
          }

          return;
        }

        if (tokenRequestRef.current) {

          console.warn(
            '[ZoomMeetingRoom] Token request already running.'
          );

          return;
        }

        tokenRequestRef.current = true;

        try {

          setLoading(true);

          setError('');

          console.log(
            '[ZoomMeetingRoom] Request ID:',
            requestId
          );

          console.log(
            '[ZoomMeetingRoom] User ID:',
            user.id
          );

          console.log(
            '[ZoomMeetingRoom] Role:',
            role
          );

          console.log(
            '[ZoomMeetingRoom] Calling livekitService.getToken()...'
          );


          // ==================================================
          // IMPORTANT:
          // ONLY SEND requestId
          // Backend determines identity and role.
          // ==================================================

          const data =
            await livekitService.getToken(
              requestId
            );


          // ==================================================
          // DEBUG RESPONSE
          // ==================================================

          console.log('');
          console.log(
            '************************************************'
          );
          console.log(
            '[ZoomMeetingRoom] LIVEKIT TOKEN RESPONSE'
          );
          console.log(
            '************************************************'
          );

          console.log(
            '[ZoomMeetingRoom] Token:',
            data?.token
              ? '[TOKEN RECEIVED]'
              : '[NO TOKEN]'
          );

          console.log(
            '[ZoomMeetingRoom] LiveKit URL:',
            data?.livekit_url
          );

          console.log(
            '[ZoomMeetingRoom] Room:',
            data?.room_name
          );

          console.log(
            '[ZoomMeetingRoom] Identity:',
            data?.identity
          );

          console.log(
            '[ZoomMeetingRoom] Participant:',
            data?.participant_name
          );

          console.log(
            '[ZoomMeetingRoom] Backend Role:',
            data?.role
          );

          console.log(
            '[ZoomMeetingRoom] Expires:',
            data?.expires_at
          );

          console.log(
            '************************************************'
          );


          // ==================================================
          // VALIDATION
          // ==================================================

          if (!data?.token) {
            throw new Error(
              'Backend returned no LiveKit token.'
            );
          }

          if (!data?.livekit_url) {
            throw new Error(
              'Backend returned no LiveKit URL.'
            );
          }

          if (!data?.room_name) {
            throw new Error(
              'Backend returned no LiveKit room name.'
            );
          }

          if (!data?.identity) {
            throw new Error(
              'Backend returned no participant identity.'
            );
          }


          // ==================================================
          // SET STATE
          // ==================================================

          if (active && isMountedRef.current) {

            setToken(
              data.token
            );

            setServerUrl(
              data.livekit_url
            );

            setRoomName(
              data.room_name
            );

            setIdentity(
              data.identity
            );

            setParticipantName(
              data.participant_name ||
                'Participant'
            );

            setParticipantRole(
              data.role ||
                role ||
                'participant'
            );

            console.log(
              '[ZoomMeetingRoom] LiveKit connection state prepared.'
            );
          }

        } catch (tokenError) {

          console.error('');
          console.error(
            '================================================'
          );
          console.error(
            '[ZoomMeetingRoom] LIVEKIT TOKEN ERROR'
          );
          console.error(
            '================================================'
          );

          console.error(
            '[ZoomMeetingRoom] Error:',
            tokenError
          );

          console.error(
            '[ZoomMeetingRoom] Message:',
            tokenError?.message
          );

          if (active && isMountedRef.current) {

            const message =
              tokenError?.message ||
              'Unable to join interview room.';

            setError(message);

            toast.error(message);
          }

        } finally {

          tokenRequestRef.current =
            false;

          if (active && isMountedRef.current) {
            setLoading(false);
          }

          console.log(
            '[ZoomMeetingRoom] TOKEN FETCH FINISHED'
          );
        }
      };


    fetchLiveKitToken();


    return () => {
      active = false;

      // Reset the guard so a remount (e.g. React StrictMode
      // double-invoke in development) can fetch a fresh token.
      tokenRequestRef.current = false;

      console.log(
        '[ZoomMeetingRoom] Token fetch cleanup.'
      );
    };

  }, [
    requestId,
    user?.id,
    role,
    authLoading,
  ]);


  // ==========================================================
  // LIVEKIT ROOM EVENTS
  // ==========================================================

  const handleRoomConnected =
    (room) => {

      if (!isMountedRef.current) {
        return;
      }

      hasConnectedRef.current = true;

      console.log('');
      console.log(
        '################################################'
      );
      console.log(
        '[LiveKit] ROOM CONNECTED SUCCESSFULLY'
      );
      console.log(
        '################################################'
      );

      console.log(
        '[LiveKit] Room name:',
        room?.name
      );

      console.log(
        '[LiveKit] Local identity:',
        room?.localParticipant?.identity
      );

      console.log(
        '[LiveKit] Local participant:',
        room?.localParticipant
      );

      console.log(
        '[LiveKit] Connection state:',
        room?.state
      );

      console.log(
        '[LiveKit] Remote participants:',
        room?.remoteParticipants?.size
      );

      console.log(
        '################################################'
      );

      setConnectionState('connected');

      toast.success('Connected to interview room.');
    };


  // ==========================================================
  // DISCONNECTED
  // ==========================================================

  const handleDisconnected =
    () => {

      console.log('');
      console.log(
        '################################################'
      );
      console.log(
        '[LiveKit] ROOM DISCONNECTED'
      );
      console.log(
        '################################################'
      );

      setConnectionState('disconnected');

      // Only navigate away if the user explicitly initiated the leave action.
      // Transient reconnects or React StrictMode unmounts will NOT kick the user out.
      if (isUserLeavingRef.current) {
        toast('You left the interview room.');

        if (onLeave) {
          onLeave();
        } else {
          navigate(-1);
        }
      } else {
        console.log('[LiveKit] Disconnected from room (transient or cleanup).');
      }
    };


  // ==========================================================
  // LIVEKIT ERROR
  // ==========================================================

  const handleRoomError =
    (roomError) => {

      // Code 1 = "Client initiated disconnect" — this is fired by
      // React 18 StrictMode when it unmounts the component during
      // its double-invoke dev cycle. It is NOT a real error.
      const isClientDisconnect =
        roomError?.code === 1 ||
        roomError?.message === 'Client initiated disconnect';

      if (isClientDisconnect || !isMountedRef.current) {
        console.warn(
          '[LiveKit] Suppressing client-initiated disconnect:',
          roomError?.message
        );
        return;
      }

      console.error('');
      console.error(
        '################################################'
      );
      console.error(
        '[LiveKit] ROOM ERROR'
      );
      console.error(
        '################################################'
      );

      console.error(
        '[LiveKit] Error:',
        roomError
      );

      console.error(
        '[LiveKit] Message:',
        roomError?.message
      );

      console.error(
        '[LiveKit] Code:',
        roomError?.code
      );

      console.error(
        '################################################'
      );

      toast.error(
        roomError?.message ||
          'LiveKit room error.'
      );
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >

        <FiLoader
          className="spin-animation"
          style={{
            fontSize: '2rem',
          }}
        />

        <h3>
          Preparing interview room...
        </h3>

        <p>
          Request ID: {requestId}
        </p>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >

        <div
          className="glass-card"
          style={{
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
          }}
        >

          <h2>
            Unable to join interview
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate(-1)
            }
          >
            <FiArrowLeft />
            Go Back
          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MISSING CONNECTION DETAILS
  // ==========================================================

  if (
    !token ||
    !serverUrl ||
    !roomName
  ) {

    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
        }}
      >

        <h2>
          Missing LiveKit connection details
        </h2>

        <p>
          The backend did not return valid
          LiveKit connection information.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate(-1)
          }
        >
          Go Back
        </button>

      </div>
    );
  }


  // ==========================================================
  // FINAL LIVEKIT ROOM
  // ==========================================================

  console.log('');
  console.log(
    '================================================'
  );
  console.log(
    '[ZoomMeetingRoom] RENDERING LIVEKIT ROOM'
  );
  console.log(
    '================================================'
  );

  console.log(
    '[ZoomMeetingRoom] Request ID:',
    requestId
  );

  console.log(
    '[ZoomMeetingRoom] Room:',
    roomName
  );

  console.log(
    '[ZoomMeetingRoom] Identity:',
    identity
  );

  console.log(
    '[ZoomMeetingRoom] Participant:',
    participantName
  );

  console.log(
    '[ZoomMeetingRoom] Role:',
    participantRole
  );

  console.log(
    '[ZoomMeetingRoom] Server:',
    serverUrl
  );

  console.log(
    '[ZoomMeetingRoom] Connection state:',
    connectionState
  );

  console.log(
    '================================================'
  );


  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#0b0f19',
        overflow: 'hidden',
      }}
    >

      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={true}
        options={livekitOptions}
        onConnected={handleRoomConnected}
        onDisconnected={handleDisconnected}
        onError={handleRoomError}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <RoomContent
          requestId={requestId}
          participantRole={participantRole}
          roomName={roomName}
          identity={identity}
          onLeaveClick={handleUserLeave}
        />

      </LiveKitRoom>

    </div>
  );
};

export default ZoomMeetingRoom;