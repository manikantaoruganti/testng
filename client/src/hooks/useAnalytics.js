import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService'; // Assuming an analytics service

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getAnalytics(filters);
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData(); // Initial fetch
  }, [fetchAnalyticsData]);

  return {
    analyticsData,
    loading,
    error,
    fetchAnalyticsData,
  };
};

