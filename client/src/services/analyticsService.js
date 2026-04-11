import apiService from './api';

export const analyticsService = {
  getAnalytics: async (filters) => {
    return apiService.get('/analytics', { params: filters });
  },

  getRiskScores: async (filters) => {
    return apiService.get('/analytics/risk-scores', { params: filters });
  },

  getResponseTimes: async (filters) => {
    return apiService.get('/analytics/response-times', { params: filters });
  },

  getEvacuationEfficiency: async (filters) => {
    return apiService.get('/analytics/evacuation-efficiency', { params: filters });
  },

  getHazardTrends: async (filters) => {
    return apiService.get('/analytics/hazard-trends', { params: filters });
  },

  getIncidentBreakdown: async (filters) => {
    return apiService.get('/analytics/incident-breakdown', { params: filters });
  },
};

