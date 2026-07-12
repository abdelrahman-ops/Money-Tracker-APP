let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (!rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.endsWith('/') ? `${rawApiUrl}api` : `${rawApiUrl}/api`;
}
const API_BASE = rawApiUrl;

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  AUTH_REFRESH: `${API_BASE}/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE}/auth/logout`,

  // Core
  WALLETS: `${API_BASE}/wallets`,
  TRANSACTIONS: `${API_BASE}/transactions`,
  CATEGORIES: `${API_BASE}/categories`,
  BUDGETS: `${API_BASE}/budgets`,
  SAVINGS_GOALS: `${API_BASE}/savings-goals`,
  DEBTS: `${API_BASE}/debts`,
  TEMPLATES: `${API_BASE}/templates`,
  ALERTS: `${API_BASE}/alerts`,
  SETTINGS: `${API_BASE}/settings`,
  EVENTS: `${API_BASE}/events`,

  // Intelligence
  ANALYTICS: `${API_BASE}/analytics`,
  INTELLIGENCE: `${API_BASE}/intelligence`,
  PARSE: `${API_BASE}/parse`,
  DATA: `${API_BASE}/data`,

  // Health
  HEALTH: `${API_BASE}/health`,
};

export default API_BASE;
