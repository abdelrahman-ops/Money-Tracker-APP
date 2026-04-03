import apiClient from '../api/client';

/**
 * Transaction API Service — replaces the Dexie-based transactionService.
 * All ACID operations now happen server-side via MongoDB sessions.
 */

export async function fetchTransactions(params = {}) {
  const { data } = await apiClient.get('/transactions', { params });
  return data.data; // { transactions, total, page, limit, totalPages }
}

export async function fetchTransaction(id) {
  const { data } = await apiClient.get(`/transactions/${id}`);
  return data.data;
}

export async function createTransaction(txnData) {
  try {
    const { data } = await apiClient.post('/transactions', txnData);
    return { success: true, ...data.data };
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to create transaction';
    return { success: false, error: message };
  }
}

export async function updateTransaction(id, txnData) {
  try {
    const { data } = await apiClient.put(`/transactions/${id}`, txnData);
    return { success: true, data: data.data };
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to update transaction';
    return { success: false, error: message };
  }
}

export async function deleteTransaction(id) {
  try {
    await apiClient.delete(`/transactions/${id}`);
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to delete transaction';
    return { success: false, error: message };
  }
}

export async function createDebtPayment(debtId, amount, accountId) {
  return createTransaction({
    amount,
    type: 'expense',
    name: 'Debt payment',
    accountId,
    debtId,
    date: new Date().toISOString(),
  });
}

export async function createSavingsDeposit(goalId, amount, accountId) {
  return createTransaction({
    amount,
    type: 'expense',
    name: 'Savings deposit',
    accountId,
    savingsGoalId: goalId,
    date: new Date().toISOString(),
  });
}

export async function createSavingsWithdrawal(goalId, amount, accountId) {
  return createTransaction({
    amount,
    type: 'income',
    name: 'Savings withdrawal',
    accountId,
    savingsGoalId: goalId,
    date: new Date().toISOString(),
  });
}
