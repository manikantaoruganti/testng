// server/src/services/simulationService.js
// Provides business logic for interacting with the simulation engine.

const { simulationEngine } = require('../core/simulation');
const { stateManager } = require('../core/state');
const { logger } = require('../utils/logger');

class SimulationService {
  constructor() {
    // No specific state, relies on simulationEngine and stateManager.
  }

  /**
   * Gets all available simulation scenarios.
   * @returns {Array<object>} An array of simulation scenarios.
   */
  getScenarios() {
    return simulationEngine.getScenarios();
  }

  /**
   * Gets a specific simulation scenario by ID.
   * @param {string} scenarioId - The ID of the scenario.
   * @returns {object|undefined} The scenario object, or undefined if not found.
   */
  getScenarioById(scenarioId) {
    return simulationEngine.getScenarioById(scenarioId);
  }

  /**
   * Starts a simulation with a given scenario.
   * @param {string} scenarioId - The ID of the scenario to start.
   * @returns {Promise<void>}
   * @throws {Error} If simulation cannot be started.
   */
  async startSimulation(scenarioId) {
    return simulationEngine.start(scenarioId);
  }

  /**
   * Pauses the current simulation.
   * @returns {Promise<void>}
   * @throws {Error} If no simulation is running.
   */
  async pauseSimulation() {
    return simulationEngine.pause();
  }

  /**
   * Resumes a paused simulation.
   * @returns {Promise<void>}
   * @throws {Error} If no simulation is paused.
   */
  async resumeSimulation() {
    return simulationEngine.resume();
  }

  /**
   * Resets the current simulation.
   * @returns {Promise<void>}
   */
  async resetSimulation() {
    return simulationEngine.reset();
  }

  /**
   * Sets the speed multiplier for the simulation.
   * @param {number} speed - The speed multiplier (e.g., 1 for real-time, 2 for 2x speed).
   */
  setSimulationSpeed(speed) {
    simulationEngine.setSpeed(speed);
  }

  /**
   * Triggers an event within the running simulation.
   * @param {object} event - The event object to trigger.
   * @returns {Promise<void>}
   */
  async triggerSimulationEvent(event) {
    return simulationEngine.triggerEvent(event);
  }

  /**
   * Gets the current state of the running simulation.
   * @returns {object} The current simulation state.
   */
  getSimulationState() {
    return stateManager.getSimulationState();
  }
}

const simulationService = new SimulationService();
module.exports = { simulationService };

