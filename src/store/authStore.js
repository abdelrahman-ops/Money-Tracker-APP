import { create } from 'zustand';
import { authClient } from '../lib/auth-client';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,


  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        const message = error.message || 'Login failed';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (email, password, name, currency) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        currency,
      });
      if (error) {
        const message = error.message || 'Registration failed';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Registration failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  // Called on app startup to restore active session from cookies
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data } = await authClient.getSession();
      if (data && data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true,
      });
    }
  },

}));

