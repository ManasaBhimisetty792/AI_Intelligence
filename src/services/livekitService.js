import axios from 'axios';
import { supabase } from './supabaseClient';

// ============================================================
// LIVEKIT CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LIVEKIT_TOKEN_ENDPOINT = `${API_BASE_URL}/api/v1/livekit/token`;

console.log('================================================');
console.log('[LiveKit Service] Configuration');
console.log('================================================');
console.log('[LiveKit Service] API Base URL:', API_BASE_URL);
console.log(
  '[LiveKit Service] Token Endpoint:',
  LIVEKIT_TOKEN_ENDPOINT
);
console.log('================================================');

// ============================================================
// HELPER: GET SUPABASE ACCESS TOKEN
// ============================================================

const getAccessToken = async () => {
  console.log('[LiveKit Service] Getting Supabase session...');

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      '[LiveKit Service] Supabase session error:',
      error
    );

    throw new Error(
      'Unable to get authentication session.'
    );
  }

  if (!session?.access_token) {
    console.error(
      '[LiveKit Service] No Supabase access token found.'
    );

    throw new Error(
      'You are not authenticated. Please login again.'
    );
  }

  console.log(
    '[LiveKit Service] Supabase access token found.'
  );

  return session.access_token;
};

// ============================================================
// GET LIVEKIT TOKEN
// ============================================================

const getToken = async (requestId) => {
  console.log('');
  console.log('================================================');
  console.log('[LiveKit Service] GET TOKEN START');
  console.log('================================================');

  console.log(
    '[LiveKit Service] requestId:',
    requestId
  );

  if (!requestId) {
    console.error(
      '[LiveKit Service] ERROR: requestId is missing'
    );

    throw new Error(
      'Interview request ID is missing.'
    );
  }

  try {
    const accessToken = await getAccessToken();

    console.log(
      '[LiveKit Service] Sending token request...'
    );

    console.log(
      '[LiveKit Service] Endpoint:',
      LIVEKIT_TOKEN_ENDPOINT
    );

    console.log(
      '[LiveKit Service] Request body:',
      {
        request_id: requestId,
      }
    );

    const response = await axios.post(
      LIVEKIT_TOKEN_ENDPOINT,
      {
        request_id: requestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(
      '[LiveKit Service] Backend response status:',
      response.status
    );

    console.log(
      '[LiveKit Service] Backend response:',
      {
        ...response.data,
        token: response.data?.token
          ? '[TOKEN RECEIVED]'
          : '[NO TOKEN]',
      }
    );

    const data = response.data;

    if (!data?.token) {
      console.error(
        '[LiveKit Service] Missing token in backend response'
      );

      throw new Error(
        'Backend did not return a LiveKit token.'
      );
    }

    if (!data?.livekit_url) {
      console.error(
        '[LiveKit Service] Missing livekit_url in backend response'
      );

      throw new Error(
        'Backend did not return the LiveKit server URL.'
      );
    }

    if (!data?.room_name) {
      console.error(
        '[LiveKit Service] Missing room_name in backend response'
      );

      throw new Error(
        'Backend did not return the LiveKit room name.'
      );
    }

    if (!data?.identity) {
      console.error(
        '[LiveKit Service] Missing identity in backend response'
      );

      throw new Error(
        'Backend did not return participant identity.'
      );
    }

    console.log('');
    console.log(
      '**************** LIVEKIT TOKEN RECEIVED ****************'
    );

    console.log(
      '[LiveKit Service] Request ID:',
      requestId
    );

    console.log(
      '[LiveKit Service] Room Name:',
      data.room_name
    );

    console.log(
      '[LiveKit Service] Identity:',
      data.identity
    );

    console.log(
      '[LiveKit Service] Participant:',
      data.participant_name
    );

    console.log(
      '[LiveKit Service] Role:',
      data.role
    );

    console.log(
      '[LiveKit Service] LiveKit URL:',
      data.livekit_url
    );

    console.log(
      '[LiveKit Service] Token:',
      '[REDACTED]'
    );

    console.log(
      '*********************************************************'
    );
    console.log('');

    return data;
  } catch (error) {
    console.error('');
    console.error(
      '================================================'
    );
    console.error(
      '[LiveKit Service] TOKEN REQUEST FAILED'
    );
    console.error(
      '================================================'
    );

    if (error?.response) {
      console.error(
        '[LiveKit Service] HTTP Status:',
        error.response.status
      );

      console.error(
        '[LiveKit Service] Backend Error:',
        error.response.data
      );

      const backendMessage =
        error.response.data?.detail ||
        error.response.data?.message;

      throw new Error(
        backendMessage ||
          `LiveKit token request failed with status ${error.response.status}`
      );
    }

    console.error(
      '[LiveKit Service] Error:',
      error
    );

    console.error(
      '[LiveKit Service] Error Message:',
      error?.message
    );

    throw error;
  }
};

// ============================================================
// START SESSION
// ============================================================

const startSession = async (
  requestId,
  roomName,
  role
) => {
  console.log('');
  console.log(
    '================================================'
  );
  console.log(
    '[LiveKit Service] START SESSION'
  );
  console.log(
    '================================================'
  );

  console.log(
    '[LiveKit Service] Request ID:',
    requestId
  );

  console.log(
    '[LiveKit Service] Room:',
    roomName
  );

  console.log(
    '[LiveKit Service] Role:',
    role
  );

  /*
   * This function is intentionally kept as a local
   * session logger.
   *
   * LiveKit itself starts the actual room when
   * LiveKitRoom connects.
   */

  console.log(
    '[LiveKit Service] Session start recorded.'
  );

  return {
    request_id: requestId,
    room: roomName,
    role,
  };
};

// ============================================================
// END SESSION
// ============================================================

const endSession = async (requestId) => {
  console.log('');
  console.log(
    '================================================'
  );
  console.log(
    '[LiveKit Service] END SESSION'
  );
  console.log(
    '================================================'
  );

  console.log(
    '[LiveKit Service] Request ID:',
    requestId
  );

  /*
   * Do NOT call a LiveKit disconnect API here.
   *
   * LiveKitRoom handles disconnecting automatically
   * when the component is unmounted.
   */

  return {
    request_id: requestId,
    ended: true,
  };
};

// ============================================================
// OPTIONAL BACKWARD COMPATIBILITY
// ============================================================

const requestCustomToken = async (params) => {
  console.warn(
    '[LiveKit Service] requestCustomToken() is deprecated.'
  );

  console.warn(
    '[LiveKit Service] Use getToken(requestId) instead.'
  );

  if (!params?.request_id) {
    throw new Error(
      'request_id is required.'
    );
  }

  return getToken(params.request_id);
};

// ============================================================
// EXPORT
// ============================================================

const livekitService = {
  getToken,
  startSession,
  endSession,
  requestCustomToken,
};

export default livekitService;

export {
  getToken,
  startSession,
  endSession,
  requestCustomToken,
};