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
    return localStorage.getItem(
      STORAGE_KEYS.access
    );
  },

  get refresh() {
    return localStorage.getItem(
      STORAGE_KEYS.refresh
    );
  },

  get user() {
    try {
      const rawUser = localStorage.getItem(
        STORAGE_KEYS.user
      );

      return rawUser
        ? JSON.parse(rawUser)
        : null;
    } catch (error) {
      console.warn(
        'Failed to parse stored user:',
        error
      );

      return null;
    }
  },

  set({
    access,
    refresh,
    user,
  } = {}) {
    if (access !== undefined) {
      if (access) {
        localStorage.setItem(
          STORAGE_KEYS.access,
          access
        );
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.access
        );
      }
    }

    if (refresh !== undefined) {
      if (refresh) {
        localStorage.setItem(
          STORAGE_KEYS.refresh,
          refresh
        );
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.refresh
        );
      }
    }

    if (user !== undefined) {
      if (user) {
        localStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(user)
        );
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.user
        );
      }
    }
  },

  clear() {
    localStorage.removeItem(
      STORAGE_KEYS.access
    );

    localStorage.removeItem(
      STORAGE_KEYS.refresh
    );

    localStorage.removeItem(
      STORAGE_KEYS.user
    );
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken =
      tokenStorage.access;

    if (accessToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (
  error,
  token = null
) => {
  pendingQueue.forEach(
    ({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    }
  );

  pendingQueue = [];
};

const isAuthenticationRoute = (
  url = ''
) => {
  return (
    url.includes('/login') ||
    url.includes('/signup') ||
    url.includes('/register') ||
    url.includes('/refresh-token') || 
    url.includes('/refresh')
  );
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    const status =
      error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const skipRefresh =
      status !== 401 ||
      isAuthenticationRoute(
        originalRequest.url
      ) ||
      originalRequest._retry;

    if (skipRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          pendingQueue.push({
            resolve,
            reject,
          });
        }
      ).then((newAccessToken) => {
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
      const refreshToken =
        tokenStorage.refresh;

      if (!refreshToken) {
        throw new Error(
          'No refresh token available.'
        );
      }

      const refreshResponse =
        await axios.post(
  `${API_BASE_URL}/auth/refresh-token`,
  {
    refresh_token: refreshToken,
  }
);

      const responseData =
        refreshResponse.data;

      const tokens = responseData?.tokens || {
  access_token: responseData?.access_token,
  refresh_token: responseData?.refresh_token,
};

      if (!tokens?.access_token) {
        throw new Error(
          'Refresh response did not contain an access token.'
        );
      }

      tokenStorage.set({
        access: tokens.access_token,
        refresh:
          tokens.refresh_token ||
          refreshToken,
        user: responseData.user,
      });

      resolveQueue(
        null,
        tokens.access_token
      );

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${tokens.access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(
        refreshError,
        null
      );

      tokenStorage.clear();

      window.dispatchEvent(
        new Event('st-auth-expired')
      );

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;