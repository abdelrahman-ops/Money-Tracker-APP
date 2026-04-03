import { create } from 'zustand';
import apiClient from '../api/client';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  // IDs that have been shown in the top modal this session
  shownIds: new Set(),
  // IDs dismissed by the user this session
  readIds: new Set(),
  // Whether the bell dropdown is open
  dropdownOpen: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get('/notifications');
      const all = data.data || [];
      const { readIds, shownIds } = get();

      const enriched = all.map(n => ({
        ...n,
        isRead: readIds.has(n.id) ? true : n.isRead,
        shownInModal: shownIds.has(n.id),
      }));

      const unreadCount = enriched.filter(n => !n.isRead).length;
      set({ notifications: enriched, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** Get the latest notification that hasn't been shown in the top modal yet */
  getLatestUnshown: () => {
    const { notifications } = get();
    return notifications.find(n => !n.shownInModal && !n.isRead) || null;
  },

  /** Mark a notification as shown in the top modal (won't show again this session) */
  markAsShown: (id) => {
    const { shownIds, notifications } = get();
    shownIds.add(id);
    set({
      shownIds: new Set(shownIds),
      notifications: notifications.map(n => n.id === id ? { ...n, shownInModal: true } : n),
    });
  },

  /** Mark a specific notification as read */
  markAsRead: (id) => {
    const { readIds, notifications } = get();
    readIds.add(id);
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true, shownInModal: true } : n);
    set({
      readIds: new Set(readIds),
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length,
    });
  },

  /** Mark all notifications as read */
  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, isRead: true, shownInModal: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  toggleDropdown: () => set(s => ({ dropdownOpen: !s.dropdownOpen })),
  closeDropdown: () => set({ dropdownOpen: false }),
}));
