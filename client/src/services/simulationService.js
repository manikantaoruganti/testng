import apiService from './api';

export const simulationService = {
  getScenarios: async () => {
    return apiService.get('/simulation/scenarios');
  },

  getScenarioById: async (id) => {
    return apiService.get(`/simulation/scenarios/${id}`);
  },

  startSimulation: async (scenarioId) => {
    return apiService.post('/simulation/start', { scenarioId });
  },

  pauseSimulation: async () => {
    return apiService.post('/simulation/pause');
  },

  resumeSimulation: async () => {
    return apiService.post('/simulation/resume');
  },

  resetSimulation: async () => {
    return apiService.post('/simulation/reset');
  },

  triggerEvent: async (event) => {
    return apiService.post('/simulation/event', event);
  },

  getSimulationData: async (simulationId) => {
    return apiService.get(`/simulation/${simulationId}/data`);
  },
};

