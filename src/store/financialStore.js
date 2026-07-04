import { create } from 'zustand';
import {
  fetchInsights,
  fetchHealthScore,
  fetchProjection,
  getSetting,
} from '../services/apiServices';

/**
 * Financial store — Zustand store for financial logic state.
 * Now powered by the backend API instead of Dexie.
 */
export const useFinancialStore = create((set, get) => ({
  // Daily limits
  dailyLimit: null,
  strictMode: false,

  // Insights
  insights: [],
  isLoadingInsights: false,

  // Health Score & Projections
  healthScore: null,
  projection: null,

  // Actions
  loadDailyLimit: async () => {
    try {
      const limit = await getSetting('dailyLimit');
      if (limit) {
        set({ dailyLimit: limit.amount || 0, strictMode: limit.isStrictMode || false });
      }
    } catch (e) {
      console.error('Failed to load daily limit:', e);
    }
  },

  loadInsights: async () => {
    set({ isLoadingInsights: true });
    try {
      const insights = await fetchInsights();
      set({ insights, isLoadingInsights: false });
    } catch (e) {
      console.error('Failed to load insights:', e);
      set({ isLoadingInsights: false });
    }
  },

  loadHealthScore: async () => {
    try {
      const score = await fetchHealthScore();
      set({ healthScore: score });
    } catch (e) {
      console.error('Failed to load health score:', e);
    }
  },

  loadProjection: async () => {
    try {
      const proj = await fetchProjection();
      set({ projection: proj });
    } catch (e) {
      console.error('Failed to load projection:', e);
    }
  },

  // Refresh all financial data
  refreshAll: async () => {
    const store = get();
    await Promise.all([
      store.loadDailyLimit(),
      store.loadInsights(),
      store.loadHealthScore(),
      store.loadProjection(),
    ]);
  },
}));
