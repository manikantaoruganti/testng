import { create } from 'zustand';
import configService from '../services/configService';

export const useConfigStore = create((set, get) => ({
  config: null,
  loading: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const appConfig = await configService.getAppConfig();
      set({ config: appConfig, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch configuration.', loading: false });
      console.error(err);
    }
  },

  updateConfig: async (newConfig) => {
    set({ loading: true, error: null });
    try {
      const updatedConfig = await configService.updateAppConfig(newConfig);
      set({ config: updatedConfig, loading: false });
      return true;
    } catch (err) {
      set({ error: 'Failed to update configuration.', loading: false });
      console.error(err);
      return false;
    }
  },
}));

