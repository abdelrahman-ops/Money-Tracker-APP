import apiClient from '../api/client';

// ─── ANALYTICS ───
export async function fetchNetWorth() {
  const { data } = await apiClient.get('/analytics/net-worth');
  return data.data;
}

export async function fetchMonthlyStats(year, month) {
  const { data } = await apiClient.get('/analytics/monthly-stats', { params: { year, month } });
  return data.data;
}

export async function fetchCategoryBreakdown(year, month) {
  const { data } = await apiClient.get('/analytics/category-breakdown', { params: { year, month } });
  return data.data;
}

export async function fetchTrends(months = 6) {
  const { data } = await apiClient.get('/analytics/trends', { params: { months } });
  return data.data;
}

export async function fetchInsights() {
  const { data } = await apiClient.get('/analytics/insights');
  return data.data;
}

export async function fetchWalletAnalysis(walletId) {
  const { data } = await apiClient.get(`/analytics/wallet/${walletId}`);
  return data.data;
}

export async function fetchNudges() {
  const { data } = await apiClient.get('/analytics/nudges');
  return data.data;
}

// ─── INTELLIGENCE ───
export async function fetchHealthScore() {
  const { data } = await apiClient.get('/intelligence/health-score');
  return data.data;
}

export async function fetchProjection() {
  const { data } = await apiClient.get('/intelligence/projection');
  return data.data;
}

export async function fetchSummary(period = 'month') {
  const { data } = await apiClient.get('/intelligence/summary', { params: { period } });
  return data.data;
}

// ─── PARSER ───
export async function parseTransaction(text) {
  const { data } = await apiClient.post('/parse', { text });
  return data.data;
}

// ─── DATA ───
export async function exportData() {
  const { data } = await apiClient.get('/data/export');
  return data.data;
}

export async function exportCsv() {
  const response = await apiClient.get('/data/export-csv', { responseType: 'blob' });
  return response.data;
}

export async function importData(importPayload) {
  const { data } = await apiClient.post('/data/import', importPayload);
  return data;
}

export async function clearAllData() {
  const { data } = await apiClient.delete('/data/clear');
  return data;
}

export async function seedDefaults() {
  const { data } = await apiClient.post('/data/seed');
  return data;
}

// ─── ALERTS ───
export async function fetchAlerts() {
  const { data } = await apiClient.get('/alerts');
  return data.data;
}

export async function markAlertRead(id) {
  await apiClient.put(`/alerts/${id}/read`);
}

export async function markAllAlertsRead() {
  await apiClient.put('/alerts/read-all');
}

export async function clearAlerts() {
  await apiClient.delete('/alerts');
}

// ─── SETTINGS ───
export async function getSetting(key) {
  const { data } = await apiClient.get(`/settings/${key}`);
  return data.data;
}

export async function setSetting(key, value) {
  const { data } = await apiClient.put(`/settings/${key}`, { value });
  return data.data;
}

// ─── TEMPLATES ───
export async function fetchTemplates() {
  const { data } = await apiClient.get('/templates');
  return data.data;
}

export async function createTemplate(templateData) {
  const { data } = await apiClient.post('/templates', templateData);
  return data.data;
}

export async function updateTemplate(id, templateData) {
  const { data } = await apiClient.put(`/templates/${id}`, templateData);
  return data.data;
}

export async function deleteTemplate(id) {
  await apiClient.delete(`/templates/${id}`);
}

// ─── BUDGETS ───
export async function fetchBudgets(monthKey) {
  const { data } = await apiClient.get(`/budgets/month/${monthKey}`);
  return data.data;
}

export async function saveBudget({ categoryId, monthKey, limit }) {
  const { data } = await apiClient.post('/budgets', { categoryId, monthKey, limit });
  return data.data;
}

// ─── EVENTS ───
export async function fetchEvents(limit = 50) {
  const { data } = await apiClient.get('/events', { params: { limit } });
  return data.data;
}
