import { useState, useEffect, useCallback } from 'react';
import simulationService from '../services/simulationService'; // Assuming a simulation service

export const useSimulation = () => {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [simulationState, setSimulationState] = useState('idle'); // idle, running, paused, finished
  const [simulationData, setSimulationData] = useState([]); // Live simulation data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulationService.getScenarios();
      setScenarios(data);
      if (data.length > 0) {
        setCurrentScenario(data[0]); // Select first scenario by default
      }
    } catch (err) {
      setError('Failed to fetch scenarios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startSimulation = useCallback(async (scenarioId) => {
    setLoading(true);
    setError(null);
    try {
      await simulationService.startSimulation(scenarioId);
      setSimulationState('running');
      // Optionally fetch initial simulation data
    } catch (err) {
      setError('Failed to start simulation.');
      console.error(err);
      setSimulationState('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const pauseSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulationService.pauseSimulation();
      setSimulationState('paused');
    } catch (err) {
      setError('Failed to pause simulation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulationService.resumeSimulation();
      setSimulationState('running');
    } catch (err) {
      setError('Failed to resume simulation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulationService.resetSimulation();
      setSimulationState('idle');
      setSimulationData([]);
    } catch (err) {
      setError('Failed to reset simulation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerEvent = useCallback(async (event) => {
    setLoading(true);
    setError(null);
    try {
      await simulationService.triggerEvent(event);
      // Handle event trigger success, maybe update logs
    } catch (err) {
      setError('Failed to trigger event.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return {
    scenarios,
    currentScenario,
    simulationState,
    simulationData,
    loading,
    error,
    fetchScenarios,
    selectScenario: (id) => setCurrentScenario(scenarios.find(s => s.id === id)),
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    triggerEvent,
  };
};

