import apiService from './api';

export const logService = {
  getEventLogs: async (filters) => {
    return apiService.get('/logs/events', { params: filters });
  },

  getDecisionLogs: async (filters) => {
    return apiService.get('/logs/decisions', { params: filters });
  },

  getSystemLogs: async (filters) => {
    return apiService.get('/logs/system', { params: filters });
  },
};

