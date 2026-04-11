import { create } from 'zustand';
import logService from '../services/logService';

export const useLogStore = create((set, get) => ({
  eventLogs: [],
  decisionLogs: [],
  systemLogs: [],
  loading: false,
  error: null,

  fetchLogs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const [eventLogs, decisionLogs, systemLogs] = await Promise.all([
        logService.getEventLogs(filters),
        logService.getDecisionLogs(filters),
        logService.getSystemLogs(filters),
      ]);

      set({
        eventLogs,
        decisionLogs,
        systemLogs,
        loading: false,
      });
    } catch (err) {
      set({ error: 'Failed to fetch logs.', loading: false });
      console.error(err);
    }
  },

  addEventLog: (log) => set((state) => ({ eventLogs: [...state.eventLogs, log] })),
  addDecisionLog: (log) => set((state) => ({ decisionLogs: [...state.decisionLogs, log] })),
  addSystemLog: (log) => set((state) => ({ systemLogs: [...state.systemLogs, log] })),
}));

