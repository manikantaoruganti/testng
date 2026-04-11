import { create } from 'zustand';
import apiService from '../services/api';

export const useCrisisStore = create((set, get) => ({
  building: null,
  currentFloor: null,
  people: [],
  hazards: [],
  evacuationRoutes: [],
  alerts: [],
  crowdDensity: {},
  loading: false,
  error: null,

  fetchBuildingData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/building.json'); // Fetch from public folder
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      set({ building: data });
      if (data.floors && data.floors.length > 0) {
        set({ currentFloor: data.floors[0].id }); // Set initial floor
      }
    } catch (err) {
      set({ error: 'Failed to load building data.', loading: false });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchRealtimeCrisisData: async () => {
    set({ loading: true, error: null });
    try {
      // These would ideally come from a single WebSocket stream or a batched API call
      const peopleData = await apiService.get('/crisis/people');
      const hazardData = await apiService.get('/crisis/hazards');
      const routeData = await apiService.get('/crisis/routes');
      const alertData = await apiService.get('/crisis/alerts');
      const crowdData = await apiService.get('/crisis/crowd-density');

      set({
        people: peopleData,
        hazards: hazardData,
        evacuationRoutes: routeData,
        alerts: alertData,
        crowdDensity: crowdData,
      });
    } catch (err) {
      set({ error: 'Failed to fetch real-time crisis data.', loading: false });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  setCurrentFloor: (floorId) => set({ currentFloor: floorId }),

  // Actions to update specific parts of the state from real-time events
  addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
  updatePersonLocation: (personId, newLocationId, newFloorId) => set((state) => ({
    people: state.people.map(p => p.id === personId ? { ...p, currentLocationId: newLocationId, currentFloorId: newFloorId } : p)
  })),
  addHazard: (hazard) => set((state) => ({ hazards: [...state.hazards, hazard] })),
  removeHazard: (hazardId) => set((state) => ({ hazards: state.hazards.filter(h => h.id !== hazardId) })),
  updateEvacuationRoutes: (routes) => set({ evacuationRoutes: routes }),
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  clearAlerts: () => set({ alerts: [] }),
  updateCrowdDensity: (densityMap) => set({ crowdDensity: densityMap }),
}));

