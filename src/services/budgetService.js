import apiClient from '../api/client';

// ─── BUDGETS ───
export async function fetchBudgets() {
  const { data } = await apiClient.get('/budgets');
  return data.data;
}

export async function fetchBudgetsByMonth(monthKey) {
  const { data } = await apiClient.get(`/budgets/month/${monthKey}`);
  return data.data;
}

export async function upsertBudget(budgetData) {
  const { data } = await apiClient.post('/budgets', budgetData);
  return data.data;
}

export async function deleteBudget(id) {
  await apiClient.delete(`/budgets/${id}`);
}

export async function fetchBudgetSummary(monthKey) {
  const { data } = await apiClient.get(`/budgets/summary/${monthKey}`);
  return data.data;
}

export async function copyBudgetsForward(fromMonthKey, toMonthKey) {
  const { data } = await apiClient.post('/budgets/copy-forward', {
    fromMonthKey,
    toMonthKey,
  });
  return data.data;
}
