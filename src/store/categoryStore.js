import { create } from 'zustand';
import * as catApi from '../services/categoryService';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await catApi.fetchCategories();
      set({ categories, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to load categories' });
    }
  },

  createCategory: async (data) => {
    try {
      const cat = await catApi.createCategory(data);
      set({ categories: [...get().categories, cat] });
      return { success: true, category: cat };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to create category' };
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updated = await catApi.updateCategory(id, data);
      set({ categories: get().categories.map((c) => (c._id === id ? updated : c)) });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update category' };
    }
  },

  deleteCategory: async (id) => {
    try {
      await catApi.deleteCategory(id);
      set({ categories: get().categories.filter((c) => c._id !== id) });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete category' };
    }
  },

  getCategoryById: (id) => get().categories.find((c) => c._id === id),
  getCategoryMap: () => {
    const map = {};
    get().categories.forEach((c) => { map[c._id] = c; });
    return map;
  },
}));
