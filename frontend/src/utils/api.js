import axios from 'axios';

// IMPORTANT: use production domain when VITE_API_URL is not set
const API_URL =
  import.meta.env.VITE_API_URL || 'https://titleiq.tightslice.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- AUTH ----------
export const auth = {
  register: (email, password) =>
    api.post('/api/auth/register', { email, password }),

  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  me: () => api.get('/api/auth/me'),
};

// ---------- SETTINGS ----------
export const settings = {
  saveApiKey: (apiKey, provider) =>
    api.post('/api/settings/api-key', { apiKey, provider }),

  getApiKeyStatus: () =>
    api.get('/api/settings/api-key'),

  deleteApiKey: () =>
    api.delete('/api/settings/api-key'),
};

// ---------- ASYNC TRANSCRIPT API (v2) ----------
export const transcript = {
  // Start transcript extraction (returns immediately)
  startFromUrl: async (videoUrl) => {
    const response = await api.post('/api/transcript/start', { url: videoUrl });
    return response.data;
  },

  // Poll for async job status
  getStatus: async (jobId) => {
    const response = await api.get(`/api/transcript/status/${jobId}`);
    return response.data;
  },
};

// ---------- TITLE GENERATION ----------
export const generation = {
  // Takes raw transcript text and generates titles + description
  generateTitles: async (transcriptText) => {
    const response = await api.post('/api/generate-titles', {
      transcript: transcriptText,
    });
    return response.data;
  },

  // Legacy fallback (old combined route - keep for backward compatibility)
  generate: (input, type) =>
    api.post('/api/generate', { input, type }),
};
