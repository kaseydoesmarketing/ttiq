import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('titleiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('titleiq_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH APIs
// ============================================

export const authApi = {
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============================================
// TRANSCRIPT APIs
// ============================================

export const transcriptApi = {
  start: async (url) => {
    const response = await api.post('/api/transcript/start', { url });
    return response.data;
  },

  getStatus: async (jobId) => {
    const response = await api.get(`/api/transcript/status/${jobId}`);
    return response.data;
  },
};

// ============================================
// GENERATION APIs
// ============================================

export const generateApi = {
  generateTitles: async (transcript, provider = 'groq') => {
    const response = await api.post('/api/generate', {
      input: transcript,
      type: 'text',
      provider,
    });
    return response.data;
  },
};

// ============================================
// USER APIs
// ============================================

export const userApi = {
  getHistory: async (limit = 20) => {
    const response = await api.get(`/api/user/history?limit=${limit}`);
    return response.data;
  },

  getUsage: async () => {
    const response = await api.get('/api/user/usage');
    return response.data;
  },

  updateProvider: async (provider) => {
    const response = await api.patch('/api/user/provider', { provider });
    return response.data;
  },

  getAdminMetrics: async () => {
    const response = await api.get('/api/admin/metrics');
    return response.data;
  },
};

// ============================================
// BILLING APIs
// ============================================

export const billingApi = {
  createCheckoutSession: async (plan) => {
    const response = await api.post('/api/billing/create-checkout-session', { plan });
    return response.data;
  },
};

// ============================================
// NEWSLETTER APIs
// ============================================

export const newsletterApi = {
  signup: async (email) => {
    const response = await api.post('/api/newsletter/signup', { email });
    return response.data;
  },
};

// ============================================
// ADMIN APIs
// ============================================

export const adminApi = {
  getMetrics: async () => {
    const response = await api.get('/api/admin/metrics');
    return response.data;
  },
};

export default api;
