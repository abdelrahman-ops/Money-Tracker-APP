import { create } from 'zustand';
import * as walletApi from '../services/walletService';

export const useWalletStore = create((set, get) => ({
  wallets: [],
  isLoading: false,
  error: null,

  fetchWallets: async () => {
    set({ isLoading: true, error: null });
    try {
      const wallets = await walletApi.fetchWallets();
      set({ wallets, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to load wallets' });
    }
  },

  createWallet: async (data) => {
    try {
      const wallet = await walletApi.createWallet(data);
      set({ wallets: [...get().wallets, wallet] });
      return { success: true, wallet };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to create wallet' };
    }
  },

  updateWallet: async (id, data) => {
    try {
      const updated = await walletApi.updateWallet(id, data);
      set({ wallets: get().wallets.map((w) => (w._id === id ? updated : w)) });
      return { success: true, wallet: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update wallet' };
    }
  },

  deleteWallet: async (id) => {
    try {
      await walletApi.deleteWallet(id);
      set({ wallets: get().wallets.filter((w) => w._id !== id) });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete wallet' };
    }
  },

  getWalletById: (id) => get().wallets.find((w) => w._id === id),
  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + (w.balance || 0), 0),
}));
