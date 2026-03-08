import axios from 'axios';

const DEFAULT_API_HOST =
  typeof window !== 'undefined' && window.location?.hostname
    ? window.location.hostname
    : '127.0.0.1';
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api/' : `http://${DEFAULT_API_HOST}:8000/api/`);
const API_BASE_URL = RAW_API_BASE.endsWith('/') ? RAW_API_BASE : `${RAW_API_BASE}/`;

const ACCESS_TOKEN_KEY = 'polychat_access_token';
const REFRESH_TOKEN_KEY = 'polychat_refresh_token';

export const tokenStore = {
  getAccess() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    window.dispatchEvent(new Event('auth-change'));
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccess();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      tokenStore.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function normalizeApiError(error) {
  if (!error?.response) {
    return 'Unable to reach server. Check API URL, backend status, and CORS settings.';
  }

  if (error?.response?.data) {
    const payload = error.response.data;
    if (typeof payload === 'string') return payload;
    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.non_field_errors?.[0]) return payload.non_field_errors[0];
    const firstKey = Object.keys(payload)[0];
    if (firstKey) {
      const value = payload[firstKey];
      if (Array.isArray(value)) return value[0];
      if (typeof value === 'string') return value;
    }
  }
  return `Request failed (${error.response?.status || 'unknown error'}).`;
}

export const authApi = {
  register(payload) {
    return api.post('auth/register/', payload);
  },
  login(payload) {
    return api.post('auth/login/', payload);
  },
  googleLogin(payload) {
    return api.post('auth/google/', payload);
  },
  logout() {
    return api.post('auth/logout/');
  },
  getProfile() {
    return api.get('auth/me/');
  },
  getCurrentUser() {
    return api.get('auth/me/');
  },
  updateCurrentUser(payload) {
    return api.patch('auth/me/', payload);
  },
  getLanguages() {
    return api.get('auth/languages/');
  },
  setLanguage(language) {
    return api.post('auth/set-language/', { language });
  },
};

export const chatApi = {
  sendMessage(message, room, targetLanguage) {
    const payload = { message };
    if (room !== undefined && room !== null && room !== '') {
      payload.room = room;
    }
    if (targetLanguage) {
      payload.target_language = targetLanguage;
    }
    return api.post('chat/send/', payload);
  },
  getChatHistory(roomId, language) {
    const suffix = language ? `?language=${encodeURIComponent(language)}` : '';
    return api.get(`chat/history/${roomId}/${suffix}`);
  },
  getContacts() {
    return api.get('auth/users/');
  },
  createRoom(targetUserId) {
    return api.post('chat/rooms/', { target_user_id: targetUserId });
  },
  createGroup(groupName, participantIds) {
    return api.post('chat/rooms/', { group_name: groupName, participant_ids: participantIds });
  },
  getRooms() {
    return api.get('chat/rooms/list/');
  },
  getWorkspaceContacts() {
    return api.get('auth/users/');
  },
};

export default api;
