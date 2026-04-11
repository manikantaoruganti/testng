// server/src/core/simulation.js
// Manages the simulation engine, including scenario loading, execution, and state progression.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { stateManager } = require('./state');
const { buildingGraph } = require('../graph/building');
const { routingEngine } = require('./routing');
const { decisionEngine } = require('./decision');
const { predictionEngine } = require('./prediction');
const { CrisisEvent } = require('../db/schemas/eventSchema'); // Assuming event schema for scenarios

class SimulationEngine {
  constructor() {
    this.scenarios = []; // Loaded scenarios
    this.currentScenario = null;
    this.simulationInterval = null;
    this.simulationTickRate = 1000; // 1 second per tick (real-time)
    this.simulationTime = 0; // Current simulation time in seconds
    this.speedMultiplier = 1;

    this.initListeners();
  }

  initListeners() {
    eventBus.on('simulation_start_request', this.start.bind(this));
    eventBus.on('simulation_pause_request', this.pause.bind(this));
    eventBus.on('simulation_resume_request', this.resume.bind(this));
    eventBus.on('simulation_reset_request', this.reset.bind(this));
    eventBus.on('simulation_event_trigger_request', this.triggerEvent.bind(this));
  }

  async loadScenarios() {
    logger.info('Loading simulation scenarios...');
    // For now, we'll use a hardcoded scenario. In a real app, this would come from DB.
    this.scenarios = [
      {
        id: 'scenario-fire-drill',
        name: 'Fire Drill in Lobby',
        description: 'Simulates a fire detection in the main lobby, triggering evacuation.',
        initialState: {
          people: [
            { id: 'p1', currentLocationId: 'room-101', currentFloorId: 'floor-1', status: 'normal' },
            { id: 'p2', currentLocationId: 'room-102', currentFloorId: 'floor-1', status: 'normal' },
            { id: 'p3', currentLocationId: 'room-103', currentFloorId: 'floor-1', status: 'normal' },
          ],
          hazards: [],
          alerts: [],
        },
        events: [
          { time: 5, type: 'fire_detected', payload: { locationId: 'room-102', intensity: 7 } },
          { time: 20, type: 'panic_triggered', payload: { locationId: 'room-101' } },
          { time: 60, type: 'fire_extinguished', payload: { locationId: 'room-102' } },
        ],
      },
      {
        id: 'scenario-medical-emergency',
        name: 'Medical Emergency',
        description: 'Simulates a medical emergency in a conference room, requiring staff response.',
        initialState: {
          people: [
            { id: 'p4', currentLocationId: 'room-104', currentFloorId: 'floor-1', status: 'normal' },
          ],
          hazards: [],
          alerts: [],
        },
        events: [
          { time: 10, type: 'medical_emergency', payload: { locationId: 'room-104', severity: 'high' } },
        ],
      },
    ];
    logger.info(`Loaded ${this.scenarios.length} simulation scenarios.`);
    return this.scenarios;
  }

  getScenarios() {
    return this.scenarios;
  }

  getScenarioById(id) {
    return this.scenarios.find(s => s.id === id);
  }

  async start(scenarioId) {
    if (stateManager.getSimulationState().isRunning) {
      logger.warn('Simulation already running. Reset first.');
      throw new Error('Simulation already running.');
    }

    this.currentScenario = this.getScenarioById(scenarioId);
    if (!this.currentScenario) {
      logger.error(`Scenario with ID ${scenarioId} not found.`);
      throw new Error('Scenario not found.');
    }

    logger.info(`Starting simulation for scenario: ${this.currentScenario.name}`);
    this.simulationTime = 0;
    this.speedMultiplier = stateManager.getSimulationState().speedMultiplier || 1;

    // Initialize simulation state in StateManager
    stateManager.handleSimulationStarted({
      scenarioId: this.currentScenario.id,
      initialData: this.currentScenario.initialState,
    });

    this.simulationInterval = setInterval(this.tick.bind(this), this.simulationTickRate / this.speedMultiplier);
    eventBus.emit('simulation_started', { scenarioId: this.currentScenario.id });
  }

  pause() {
    if (!stateManager.getSimulationState().isRunning) {
      logger.warn('No simulation running to pause.');
      throw new Error('No simulation running.');
    }
    clearInterval(this.simulationInterval);
    stateManager.handleSimulationPaused();
    eventBus.emit('simulation_paused');
    logger.info('Simulation paused.');
  }

  resume() {
    if (!stateManager.getSimulationState().isPaused) {
      logger.warn('Simulation not paused to resume.');
      throw new Error('Simulation not paused.');
    }
    this.simulationInterval = setInterval(this.tick.bind(this), this.simulationTickRate / this.speedMultiplier);
    stateManager.handleSimulationResumed();
    eventBus.emit('simulation_resumed');
    logger.info('Simulation resumed.');
  }

  reset() {
    clearInterval(this.simulationInterval);
    this.currentScenario = null;
    this.simulationTime = 0;
    stateManager.handleSimulationReset();
    eventBus.emit('simulation_reset');
    logger.info('Simulation reset.');
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    stateManager.updateSimulationState({ speedMultiplier: multiplier });
    if (stateManager.getSimulationState().isRunning && !stateManager.getSimulationState().isPaused) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = setInterval(this.tick.bind(this), this.simulationTickRate / this.speedMultiplier);
      logger.info(`Simulation speed set to ${multiplier}x.`);
    }
  }

  async tick() {
    this.simulationTime++;
    logger.debug(`Simulation tick: ${this.simulationTime}s`);

    // Process scheduled events for the current simulation time
    this.currentScenario.events
      .filter(event => event.time === this.simulationTime)
      .forEach(event => {
        logger.info(`Triggering scheduled event: ${event.type} at ${event.payload.locationId}`);
        eventBus.emit('simulation_event_triggered', event);
        // Directly apply event effects to simulated state or dispatch to handlers
        this.applyEventToSimulatedState(event);
      });

    // Evolve hazards (e.g., fire spread)
    this.evolveHazards();

    // Re-calculate routes based on new hazards
    await this.recalculateSimulatedRoutes();

    // Make decisions based on simulated state
    await this.makeSimulatedDecisions();

    // Update prediction engine
    predictionEngine.updatePrediction(stateManager.getSimulationState());

    // Emit simulation tick data
    eventBus.emit('simulation_tick', {
      time: this.simulationTime,
      hazards: stateManager.getSimulationState().simulatedHazards,
      people: stateManager.getSimulationState().simulatedPeopleLocations,
      routes: stateManager.getSimulationState().simulatedEvacuationRoutes,
      alerts: stateManager.getSimulationState().simulatedAlerts,
      crowdDensity: stateManager.getSimulationState().simulatedCrowdDensity,
    });

    // Check for simulation end conditions (e.g., all people evacuated, fire extinguished)
    // For now, let's just run for a fixed duration or until manually reset
    if (this.simulationTime >= 120) { // Example: stop after 2 minutes
      this.pause();
      logger.info('Simulation finished (time limit reached).');
      eventBus.emit('simulation_finished', { scenarioId: this.currentScenario.id, finalTime: this.simulationTime });
    }
  }

  applyEventToSimulatedState(event) {
    const simulatedState = stateManager.getSimulationState();
    switch (event.type) {
      case 'fire_detected':
        simulatedState.simulatedHazards.push({
          id: `sim-fire-${Date.now()}`,
          type: 'fire',
          locationId: event.payload.locationId,
          intensity: event.payload.intensity,
          spreadRate: 0.1, // Example spread rate
          affectedNodes: [event.payload.locationId],
          affectedPaths: [],
          timestamp: Date.now(),
        });
        break;
      case 'fire_extinguished':
        simulatedState.simulatedHazards = simulatedState.simulatedHazards.filter(h =>
          !(h.type === 'fire' && h.locationId === event.payload.locationId)
        );
        break;
      case 'panic_triggered':
        // Mark people in the area as 'panicked'
        simulatedState.simulatedPeopleLocations = simulatedState.simulatedPeopleLocations.map(p =>
          p.currentLocationId === event.payload.locationId ? { ...p, status: 'panicked' } : p
        );
        simulatedState.simulatedAlerts.push({
          id: `sim-alert-${Date.now()}`,
          type: 'warning',
          message: `Panic triggered in ${event.payload.locationId}`,
          locationId: event.payload.locationId,
          timestamp: Date.now(),
        });
        break;
      // Add other event types
    }
    stateManager.updateSimulationState(simulatedState);
  }

  evolveHazards() {
    const simulatedState = stateManager.getSimulationState();
    simulatedState.simulatedHazards.forEach(hazard => {
      if (hazard.type === 'fire' && hazard.spreadRate > 0) {
        // Simple fire spread logic: affect adjacent nodes over time
        const affectedNodes = new Set(hazard.affectedNodes);
        hazard.affectedNodes.forEach(nodeId => {
          const neighbors = buildingGraph.getNeighbors(nodeId);
          neighbors.forEach(neighborId => {
            if (Math.random() < hazard.spreadRate) { // Chance to spread
              affectedNodes.add(neighborId);
            }
          });
        });
        hazard.affectedNodes = Array.from(affectedNodes);

        // Update affected paths based on affected nodes
        hazard.affectedPaths = buildingGraph.getPathsAffectedByNodes(hazard.affectedNodes);
      }
    });
    stateManager.updateSimulationState(simulatedState);
  }

  async recalculateSimulatedRoutes() {
    const simulatedState = stateManager.getSimulationState();
    const currentHazards = simulatedState.simulatedHazards;
    const blockedNodes = currentHazards.flatMap(h => h.affectedNodes);
    const blockedPaths = currentHazards.flatMap(h => h.affectedPaths);

    // For each person, find a safe evacuation route
    const updatedRoutes = [];
    for (const person of simulatedState.simulatedPeopleLocations) {
      const startNode = person.currentLocationId;
      const exits = buildingGraph.getExitsForFloor(person.currentFloorId); // Get exits for current floor

      let safestRoute = null;
      let minCost = Infinity;

      for (const exit of exits) {
        try {
          const path = await routingEngine.findSafestPath(startNode, exit.id, blockedNodes, blockedPaths);
          if (path && path.cost < minCost) {
            minCost = path.cost;
            safestRoute = {
              id: `sim-route-${person.id}-${exit.id}`,
              startNodeId: startNode,
              endNodeId: exit.id,
              path: path.path,
              isSafe: true, // Assuming findSafestPath returns a safe path
              cost: path.cost,
              personId: person.id,
            };
          }
        } catch (routeError) {
          logger.debug(`No safe path found for person ${person.id} to exit ${exit.id}: ${routeError.message}`);
        }
      }
      if (safestRoute) {
        updatedRoutes.push(safestRoute);
      } else {
        // If no safe route, mark person as potentially trapped or needing assistance
        logger.warn(`No safe evacuation route found for person ${person.id} on floor ${person.currentFloorId}.`);
        // Optionally, add an alert
        simulatedState.simulatedAlerts.push({
          id: `sim-alert-no-route-${person.id}-${Date.now()}`,
          type: 'critical',
          message: `No safe route for person ${person.id}`,
          locationId: person.currentLocationId,
          timestamp: Date.now(),
        });
      }
    }
    simulatedState.simulatedEvacuationRoutes = updatedRoutes;
    stateManager.updateSimulationState(simulatedState);
  }

  async makeSimulatedDecisions() {
    const simulatedState = stateManager.getSimulationState();
    const decisions = await decisionEngine.makeDecisions(simulatedState);
    // Apply decisions to simulated state
    decisions.forEach(decision => {
      logger.debug(`Simulated decision: ${decision.action} for ${decision.targetId}`);
      // Example: if decision is to block a path
      if (decision.action === 'block_path') {
        const pathIdToBlock = decision.targetId;
        simulatedState.simulatedHazards.push({
          id: `sim-blocked-path-${pathIdToBlock}-${Date.now()}`,
          type: 'blocked_path',
          locationId: pathIdToBlock, // Treat path as a 'location' for hazard
          affectedPaths: [pathIdToBlock],
          timestamp: Date.now(),
        });
      }
      // Other decisions like 'guide_person', 'issue_alert' etc.
    });
    stateManager.updateSimulationState(simulatedState);
  }

  async triggerEvent(event) {
    logger.info(`Manually triggering event: ${event.type} at ${event.payload.locationId}`);
    // Apply event to current simulation state immediately
    this.applyEventToSimulatedState(event);
    eventBus.emit('simulation_event_triggered', event);
  }
}

const simulationEngine = new SimulationEngine();
module.exports = { simulationEngine };

