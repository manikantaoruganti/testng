import apiService from './api';

export const configService = {
  getAppConfig: async () => {
    return apiService.get('/config/app');
  },

  updateAppConfig: async (configData) => {
    return apiService.put('/config/app', configData);
  },

  getBuildingConfig: async () => {
    return apiService.get('/config/building');
  },

  updateBuildingConfig: async (buildingData) => {
    return apiService.put('/config/building', buildingData);
  },
};

