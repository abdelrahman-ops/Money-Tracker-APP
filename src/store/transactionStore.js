import { create } from 'zustand';
import * as txnApi from '../services/transactionService';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await txnApi.fetchTransactions({ ...get().filters, ...params });
      set({
        transactions: result.transactions,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to load transactions' });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchTransactions(filters);
  },

  createTransaction: async (data) => {
    const result = await txnApi.createTransaction(data);
    if (result.success) {
      // Refresh the list from server to get accurate balances
      get().fetchTransactions();
    }
    return result;
  },

  updateTransaction: async (id, data) => {
    const result = await txnApi.updateTransaction(id, data);
    if (result.success) {
      get().fetchTransactions();
    }
    return result;
  },

  deleteTransaction: async (id) => {
    const result = await txnApi.deleteTransaction(id);
    if (result.success) {
      // Optimistic: remove from list immediately
      set({ transactions: get().transactions.filter((t) => t._id !== id) });
    }
    return result;
  },

  getTransaction: async (id) => {
    return txnApi.fetchTransaction(id);
  },
}));
