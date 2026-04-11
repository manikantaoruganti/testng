import { create } from 'zustand';
import simulationService from '../services/simulationService';

export const useSimulationStore = create((set, get) => ({
  scenarios: [],
  currentScenario: null,
  simulationState: 'idle', // 'idle', 'running', 'paused', 'finished', 'error'
  simulationSpeed: 1, // Multiplier for simulation time
  simulationLogs: [],
  loading: false,
  error: null,

  fetchScenarios: async () => {
    set({ loading: true, error: null });
    try {
      const data = await simulationService.getScenarios();
      set({ scenarios: data });
      if (data.length > 0 && !get().currentScenario) {
        set({ currentScenario: data[0] }); // Select first scenario if none selected
      }
    } catch (err) {
      set({ error: 'Failed to fetch scenarios.', loading: false });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  selectScenario: (scenarioId) => {
    const scenario = get().scenarios.find(s => s.id === scenarioId);
    set({ currentScenario: scenario, simulationLogs: [], simulationState: 'idle' });
  },

  startSimulation: async () => {
    const { currentScenario } = get();
    if (!currentScenario) {
      set({ error: 'No scenario selected to start simulation.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      await simulationService.startSimulation(currentScenario.id);
      set({ simulationState: 'running', simulationLogs: [], loading: false });
      get().addSimulationLog({ type: 'info', message: `Simulation started for scenario: ${currentScenario.name}` });
    } catch (err) {
      set({ error: 'Failed to start simulation.', simulationState: 'error', loading: false });
      console.error(err);
    }
  },

  pauseSimulation: async () => {
    set({ loading: true, error: null });
    try {
      await simulationService.pauseSimulation();
      set({ simulationState: 'paused', loading: false });
      get().addSimulationLog({ type: 'info', message: 'Simulation paused.' });
    } catch (err) {
      set({ error: 'Failed to pause simulation.', loading: false });
      console.error(err);
    }
  },

  resumeSimulation: async () => {
    set({ loading: true, error: null });
    try {
      await simulationService.resumeSimulation();
      set({ simulationState: 'running', loading: false });
      get().addSimulationLog({ type: 'info', message: 'Simulation resumed.' });
    } catch (err) {
      set({ error: 'Failed to resume simulation.', loading: false });
      console.error(err);
    }
  },

  resetSimulation: async () => {
    set({ loading: true, error: null });
    try {
      await simulationService.resetSimulation();
      set({ simulationState: 'idle', simulationLogs: [], loading: false });
      get().addSimulationLog({ type: 'info', message: 'Simulation reset.' });
    } catch (err) {
      set({ error: 'Failed to reset simulation.', loading: false });
      console.error(err);
    }
  },

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  triggerEvent: async (event) => {
    set({ loading: true, error: null });
    try {
      await simulationService.triggerEvent(event);
      get().addSimulationLog({ type: 'event', message: `Event triggered: ${event.type} at ${event.payload.locationId}` });
    } catch (err) {
      set({ error: 'Failed to trigger event.', loading: false });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  addSimulationLog: (logEntry) => set((state) => ({
    simulationLogs: [...state.simulationLogs, { ...logEntry, timestamp: Date.now() }]
  })),

  // This would be updated by WebSocket events from the server
  updateSimulationState: (newState) => set({ simulationState: newState }),
  updateSimulationData: (data) => { /* Logic to update map data, etc. */ },
}));

