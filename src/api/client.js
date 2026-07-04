import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enable sending cookies with requests for Better Auth
});

// Simple response interceptor to catch unauthorized requests
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and not an auth endpoint, redirect to login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      // Session has expired or is invalid, redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

