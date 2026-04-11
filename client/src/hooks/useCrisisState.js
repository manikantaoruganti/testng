import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api'; // Assuming an API service

export const useCrisisState = () => {
  const [building, setBuilding] = useState(null);
  const [people, setPeople] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [crowdDensity, setCrowdDensity] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBuildingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/building.json'); // Fetch from public folder
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBuilding(data);
      if (data.floors && data.floors.length > 0) {
        // Set initial floor to the first one
        // This will be handled by crisisStore, but for direct hook usage, it's here.
      }
    } catch (err) {
      setError('Failed to load building data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRealtimeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, these would be separate API calls or WebSocket updates
      const peopleData = await apiService.get('/api/crisis/people');
      const hazardData = await apiService.get('/api/crisis/hazards');
      const routeData = await apiService.get('/api/crisis/routes');
      const alertData = await apiService.get('/api/crisis/alerts');
      const crowdData = await apiService.get('/api/crisis/crowd-density');

      setPeople(peopleData);
      setHazards(hazardData);
      setEvacuationRoutes(routeData);
      setAlerts(alertData);
      setCrowdDensity(crowdData);
    } catch (err) {
      setError('Failed to fetch real-time crisis data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildingData();
    fetchRealtimeData(); // Initial fetch
    // Set up polling or WebSocket listener for real-time updates
    const interval = setInterval(fetchRealtimeData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchBuildingData, fetchRealtimeData]);

  return {
    building,
    people,
    hazards,
    evacuationRoutes,
    alerts,
    crowdDensity,
    loading,
    error,
    fetchBuildingData,
    fetchRealtimeData,
  };
};

