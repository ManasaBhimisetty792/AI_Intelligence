/**
 * Central Axios instance.
 *
 * Features:
 * - Attaches the access token to every request.
 * - Refreshes the access token after a 401 response.
 * - Replays the original request once.
 * - Queues other failed requests while refreshing.
 * - Clears authentication storage when refresh fails.
 */

import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const STORAGE_KEYS = {
  access: 'st_access_token',
  refresh: 'st_refresh_token',
  user: 'st_user',
};

export const tokenStorage = {
  get access() {
    return localStorage.getItem(STORAGE_KEYS.access);
  },

  get refresh() {
    return localStorage.getItem(STORAGE_KEYS.refresh);
  },

  get user() {
    try {
      const rawUser = localStorage.getItem(
        STORAGE_KEYS.user
      );

      return rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
      console.warn(
        'Failed to parse st_user from localStorage:',
        error
      );

      return null;
    }
  },

  set({ access, refresh, user } = {}) {
    /*
     * Save or remove the access token.
     */
    if (access !== undefined) {
      if (access) {
        localStorage.setItem(
          STORAGE_KEYS.access,
          access
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.access);
      }
    }

    /*
     * Save or remove the refresh token.
     */
    if (refresh !== undefined) {
      if (refresh) {
        localStorage.setItem(
          STORAGE_KEYS.refresh,
          refresh
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.refresh);
      }
    }

    /*
     * Save or remove the user.
     */
    if (user !== undefined) {
      if (user) {
        localStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(user)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach the current access token to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.access;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue = [];

/**
 * Resolve or reject requests waiting for token refresh.
 */
const resolveQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  pendingQueue = [];
};

/**
 * Check whether a request should skip token refresh.
 */
const isAuthenticationRoute = (url = '') => {
  return (
    url.includes('/login') ||
    url.includes('/signup') ||
    url.includes('/register') ||
    url.includes('/refresh-token')
  );
};

/**
 * Refresh the access token after a 401.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const shouldSkipRefresh =
      status !== 401 ||
      isAuthenticationRoute(originalRequest.url) ||
      originalRequest._retry;

    if (shouldSkipRefresh) {
      return Promise.reject(error);
    }

    /*
     * If another request is refreshing the token, wait for it.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve,
          reject,
        });
      }).then((newAccessToken) => {
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.refresh;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      /*
       * Use plain axios here rather than api to prevent the
       * refresh request from entering the same interceptor.
       */
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/refresh-token`,
        {
          refresh_token: refreshToken,
        }
      );

      const responseData = refreshResponse.data;
      const tokens = responseData?.tokens;

      if (!tokens?.access_token) {
        throw new Error(
          'Refresh response did not contain an access token'
        );
      }

      tokenStorage.set({
        access: tokens.access_token,
        refresh:
          tokens.refresh_token || refreshToken,
        user: responseData.user,
      });

      resolveQueue(null, tokens.access_token);

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${tokens.access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);

      tokenStorage.clear();

      window.dispatchEvent(
        new Event('st-auth-expired')
      );

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;