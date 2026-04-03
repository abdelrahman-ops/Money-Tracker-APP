import apiClient from '../api/client';

// ─── SAVINGS GOALS ───
export async function fetchSavingsGoals() {
  const { data } = await apiClient.get('/savings-goals');
  return data.data;
}

export async function fetchSavingsGoal(id) {
  const { data } = await apiClient.get(`/savings-goals/${id}`);
  return data.data;
}

export async function createSavingsGoal(goalData) {
  const { data } = await apiClient.post('/savings-goals', goalData);
  return data.data;
}

export async function updateSavingsGoal(id, goalData) {
  const { data } = await apiClient.put(`/savings-goals/${id}`, goalData);
  return data.data;
}

export async function deleteSavingsGoal(id) {
  await apiClient.delete(`/savings-goals/${id}`);
}
