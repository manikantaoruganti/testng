// server/src/core/orchestrator.js
// The Orchestrator is the central hub that initializes and coordinates all core modules.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { stateManager } = require('./state');
const { simulationEngine } = require('./simulation');
const { routingEngine } = require('./routing');
const { decisionEngine } = require('./decision');
const { predictionEngine } = require('./prediction');
const { scheduler } = require('./scheduler');
const { riskEngine } = require('./riskEngine');
const { buildingGraph } = require('../graph/building');
const { initSocketHandlers } = require('../socket/socketHandlers'); // To register socket handlers

class Orchestrator {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      logger.warn('Orchestrator already initialized.');
      return;
    }

    logger.info('Initializing CrisisOS Orchestrator...');

    // 1. Load Building Graph (Digital Twin)
    await buildingGraph.loadBuildingData();

    // 2. Initialize Core Modules (order matters for dependencies)
    // StateManager is foundational
    // RoutingEngine depends on buildingGraph
    // SimulationEngine depends on StateManager, RoutingEngine, DecisionEngine, PredictionEngine
    // DecisionEngine depends on StateManager, RoutingEngine, PredictionEngine
    // PredictionEngine depends on StateManager, SimulationEngine (optionally)
    // RiskEngine depends on StateManager

    // StateManager is instantiated directly and listens to events
    // routingEngine is instantiated directly
    // decisionEngine is instantiated directly
    // predictionEngine is instantiated directly
    // riskEngine is instantiated directly
    // scheduler is instantiated directly

    // Load simulation scenarios
    await simulationEngine.loadScenarios();

    // Start periodic tasks
    scheduler.start();
    predictionEngine.start(); // Start periodic prediction generation

    // Initialize Socket.IO handlers (these will interact with core modules via eventBus)
    initSocketHandlers();

    this.isInitialized = true;
    logger.info('CrisisOS Orchestrator initialized successfully. System ready.');
    eventBus.emit('system_ready', { timestamp: Date.now(), message: 'CrisisOS backend is operational.' });
  }

  // Expose core modules if needed for direct interaction (e.g., for testing or specific API calls)
  getCoreModules() {
    return {
      stateManager,
      simulationEngine,
      routingEngine,
      decisionEngine,
      predictionEngine,
      scheduler,
      riskEngine,
      buildingGraph,
    };
  }
}

const orchestrator = new Orchestrator();
module.exports = { orchestrator };

