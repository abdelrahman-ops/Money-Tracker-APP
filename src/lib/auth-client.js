import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (!rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.endsWith('/') ? `${rawApiUrl}api` : `${rawApiUrl}/api`;
}
const API_URL = rawApiUrl;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authClient = {
  signIn: {
    email: async ({ email, password }) => {
      try {
        const res = await api.post('/auth/login', { email, password });
        return { data: res.data, error: null };
      } catch (err) {
        return { 
          data: null, 
          error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
        };
      }
    },
  },
  signUp: {
    email: async ({ email, password, name, currency }) => {
      try {
        const res = await api.post('/auth/register', { email, password, name, currency });
        return { data: res.data, error: null };
      } catch (err) {
        return { 
          data: null, 
          error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
        };
      }
    },
  },
  signOut: async () => {
    try {
      await api.post('/auth/logout');
      return { error: null };
    } catch (err) {
      return { 
        error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
      };
    }
  },
  getSession: async () => {
    try {
      const res = await api.get('/auth/session');
      return { data: res.data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
      };
    }
  },
  sendVerificationEmail: async ({ email, callbackURL }) => {
    try {
      const res = await api.post('/auth/send-verification', { email, callbackURL });
      return { data: res.data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
      };
    }
  },
  forgetPassword: async ({ email, redirectTo }) => {
    try {
      const res = await api.post('/auth/forgot-password', { email, redirectTo });
      return { data: res.data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
      };
    }
  },
  resetPassword: async ({ newPassword, token }) => {
    try {
      const res = await api.post('/auth/reset-password', { newPassword, token });
      return { data: res.data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err.response?.data?.error || err.response?.data?.message || err.message } 
      };
    }
  },
};

export default authClient;
