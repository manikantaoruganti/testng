// server/src/core/state.js
// Manages the global, real-time state of the crisis and the environment.
// This is the "Digital Twin" in action, holding the current snapshot.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { buildingGraph } = require('../graph/building'); // Assuming building graph is loaded

class StateManager {
  constructor() {
    this.currentCrisisState = {
      timestamp: Date.now(),
      activeHazards: [], // e.g., [{ id: 'fire-1', type: 'fire', locationId: 'room-101', intensity: 8, spreadRate: 0.1, affectedNodes: [], affectedPaths: [] }]
      peopleLocations: [], // e.g., [{ id: 'person-1', currentLocationId: 'room-102', currentFloorId: 'floor-1', status: 'normal' }]
      evacuationRoutes: [], // e.g., [{ id: 'route-1', startNodeId: 'room-102', endNodeId: 'exit-A', path: ['path-1', 'path-6'], isSafe: true }]
      activeAlerts: [], // e.g., [{ id: 'alert-1', type: 'critical', message: 'Fire detected', locationId: 'room-101', timestamp: Date.now() }]
      crowdDensity: {}, // e.g., { 'room-101': 5, 'room-102': 12 }
      systemStatus: 'operational', // operational, degraded, critical
    };

    this.simulationState = {
      isRunning: false,
      isPaused: false,
      currentScenarioId: null,
      simulationTime: 0, // in seconds
      speedMultiplier: 1,
      simulatedHazards: [],
      simulatedPeopleLocations: [],
      simulatedEvacuationRoutes: [],
      simulatedAlerts: [],
      simulatedCrowdDensity: {},
    };

    this.initListeners();
  }

  initListeners() {
    eventBus.on('hazard_created', this.handleHazardCreated.bind(this));
    eventBus.on('hazard_updated', this.handleHazardUpdated.bind(this));
    eventBus.on('hazard_resolved', this.handleHazardResolved.bind(this));
    eventBus.on('person_moved', this.handlePersonMoved.bind(this));
    eventBus.on('route_updated', this.handleRouteUpdated.bind(this));
    eventBus.on('alert_issued', this.handleAlertIssued.bind(this));
    eventBus.on('crowd_density_updated', this.handleCrowdDensityUpdated.bind(this));
    eventBus.on('simulation_started', this.handleSimulationStarted.bind(this));
    eventBus.on('simulation_paused', this.handleSimulationPaused.bind(this));
    eventBus.on('simulation_resumed', this.handleSimulationResumed.bind(this));
    eventBus.on('simulation_reset', this.handleSimulationReset.bind(this));
    eventBus.on('simulation_tick', this.handleSimulationTick.bind(this));
  }

  // --- Real-time Crisis State Management ---
  getCrisisState() {
    return { ...this.currentCrisisState };
  }

  updateCrisisState(newState) {
    this.currentCrisisState = { ...this.currentCrisisState, ...newState, timestamp: Date.now() };
    eventBus.emit('crisis_state_updated', this.currentCrisisState);
    logger.debug('Crisis state updated', { state: this.currentCrisisState });
  }

  handleHazardCreated(hazard) {
    this.currentCrisisState.activeHazards.push(hazard);
    this.updateCrisisState({}); // Trigger update
  }

  handleHazardUpdated(updatedHazard) {
    this.currentCrisisState.activeHazards = this.currentCrisisState.activeHazards.map(h =>
      h.id === updatedHazard.id ? { ...h, ...updatedHazard } : h
    );
    this.updateCrisisState({});
  }

  handleHazardResolved(hazardId) {
    this.currentCrisisState.activeHazards = this.currentCrisisState.activeHazards.filter(h => h.id !== hazardId);
    this.updateCrisisState({});
  }

  handlePersonMoved({ personId, newLocationId, newFloorId, status }) {
    this.currentCrisisState.peopleLocations = this.currentCrisisState.peopleLocations.map(p =>
      p.id === personId ? { ...p, currentLocationId: newLocationId, currentFloorId: newFloorId, status: status || p.status } : p
    );
    this.updateCrisisState({});
  }

  handleRouteUpdated(routes) {
    this.currentCrisisState.evacuationRoutes = routes;
    this.updateCrisisState({});
  }

  handleAlertIssued(alert) {
    this.currentCrisisState.activeAlerts.push(alert);
    this.updateCrisisState({});
  }

  handleCrowdDensityUpdated(densityMap) {
    this.currentCrisisState.crowdDensity = densityMap;
    this.updateCrisisState({});
  }

  // --- Simulation State Management ---
  getSimulationState() {
    return { ...this.simulationState };
  }

  updateSimulationState(newState) {
    this.simulationState = { ...this.simulationState, ...newState };
    eventBus.emit('simulation_state_updated', this.simulationState);
    logger.debug('Simulation state updated', { state: this.simulationState });
  }

  handleSimulationStarted({ scenarioId, initialData }) {
    this.simulationState = {
      isRunning: true,
      isPaused: false,
      currentScenarioId: scenarioId,
      simulationTime: 0,
      speedMultiplier: 1, // Default speed
      simulatedHazards: initialData.hazards || [],
      simulatedPeopleLocations: initialData.people || [],
      simulatedEvacuationRoutes: initialData.routes || [],
      simulatedAlerts: initialData.alerts || [],
      simulatedCrowdDensity: initialData.crowdDensity || {},
    };
    this.updateSimulationState({});
  }

  handleSimulationPaused() {
    this.simulationState.isPaused = true;
    this.updateSimulationState({});
  }

  handleSimulationResumed() {
    this.simulationState.isPaused = false;
    this.updateSimulationState({});
  }

  handleSimulationReset() {
    this.simulationState = {
      isRunning: false,
      isPaused: false,
      currentScenarioId: null,
      simulationTime: 0,
      speedMultiplier: 1,
      simulatedHazards: [],
      simulatedPeopleLocations: [],
      simulatedEvacuationRoutes: [],
      simulatedAlerts: [],
      simulatedCrowdDensity: {},
    };
    this.updateSimulationState({});
  }

  handleSimulationTick(tickData) {
    // Apply tickData to simulated state
    this.simulationState.simulationTime = tickData.time;
    this.simulationState.simulatedHazards = tickData.hazards;
    this.simulationState.simulatedPeopleLocations = tickData.people;
    this.simulationState.simulatedEvacuationRoutes = tickData.routes;
    this.simulationState.simulatedAlerts = tickData.alerts;
    this.simulationState.simulatedCrowdDensity = tickData.crowdDensity;
    this.updateSimulationState({});
  }
}

const stateManager = new StateManager();
module.exports = { stateManager };

