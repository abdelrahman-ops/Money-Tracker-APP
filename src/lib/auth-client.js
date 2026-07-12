import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
