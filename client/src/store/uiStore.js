import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: false,
  notifications: [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  addNotification: (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type, duration }],
    }));
    return id;
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));