import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Proxy handled by Vite

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  get: async (url, config) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`API GET error for ${url}:`, error);
      throw error.response?.data || error.message;
    }
  },

  post: async (url, data, config) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`API POST error for ${url}:`, error);
      throw error.response?.data || error.message;
    }
  },

  put: async (url, data, config) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`API PUT error for ${url}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (url, config) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

