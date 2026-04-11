import { create } from 'zustand';
import analyticsService from '../services/analyticsService';

export const useAnalyticsStore = create((set, get) => ({
  analyticsData: {
    riskScores: [],
    responseTimes: [],
    evacuationEfficiency: [],
    hazardTrends: [],
    incidentBreakdown: [],
  },
  loading: false,
  error: null,

  fetchAnalyticsData: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const [
        riskScores,
        responseTimes,
        evacuationEfficiency,
        hazardTrends,
        incidentBreakdown,
      ] = await Promise.all([
        analyticsService.getRiskScores(filters),
        analyticsService.getResponseTimes(filters),
        analyticsService.getEvacuationEfficiency(filters),
        analyticsService.getHazardTrends(filters),
        analyticsService.getIncidentBreakdown(filters),
      ]);

      set({
        analyticsData: {
          riskScores,
          responseTimes,
          evacuationEfficiency,
          hazardTrends,
          incidentBreakdown,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: 'Failed to fetch analytics data.', loading: false });
      console.error(err);
    }
  },
}));

