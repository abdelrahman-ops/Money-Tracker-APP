import apiClient from '../api/client';

export async function loginUser(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data; // { user, accessToken, refreshToken }
}

export async function registerUser(email, password, name, currency = 'EGP') {
  const { data } = await apiClient.post('/auth/register', { email, password, name, currency });
  return data.data;
}

export async function refreshTokens(refreshToken) {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return data.data; // { accessToken, refreshToken }
}

export async function requestPasswordReset(email) {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data.data;
}

export async function resetPassword(token, newPassword) {
  const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
  return data.data;
}

export async function logoutUser(refreshToken) {
  try {
    await apiClient.post('/auth/logout', { refreshToken });
  } catch {
    // Ignore — we clear tokens locally regardless
  }
}
