import apiClient from '../api/client';

// ─── DEBTS ───
export async function fetchDebts() {
  const { data } = await apiClient.get('/debts');
  return data.data;
}

export async function fetchDebt(id) {
  const { data } = await apiClient.get(`/debts/${id}`);
  return data.data;
}

export async function createDebt(debtData) {
  const { data } = await apiClient.post('/debts', debtData);
  return data.data;
}

export async function updateDebt(id, debtData) {
  const { data } = await apiClient.put(`/debts/${id}`, debtData);
  return data.data;
}

export async function deleteDebt(id) {
  await apiClient.delete(`/debts/${id}`);
}
