import { createAuthClient } from 'better-auth/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const baseURL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export const authClient = createAuthClient({
  baseURL: baseURL,
});
export default authClient;
