import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (!rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.endsWith('/') ? `${rawApiUrl}api` : `${rawApiUrl}/api`;
}
const API_BASE = rawApiUrl;

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enable sending cookies with requests for Better Auth
});

// Request interceptor to attach Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

