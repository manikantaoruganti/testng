// server/src/core/prediction.js
// The Prediction Engine uses historical data and current state to forecast
// future crisis evolution and potential outcomes.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { stateManager } = require('./state');
const { simulationEngine } = require('./simulation'); // Can leverage simulation for predictions

class PredictionEngine {
  constructor() {
    this.currentPrediction = null; // Stores the latest prediction
    this.predictionInterval = null;
    this.predictionFrequency = 10000; // Predict every 10 seconds

    this.initListeners();
  }

  initListeners() {
    eventBus.on('crisis_state_updated', this.triggerPrediction.bind(this));
    eventBus.on('simulation_tick', this.updatePrediction.bind(this)); // Update prediction based on simulation
  }

  start() {
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
    }
    this.predictionInterval = setInterval(this.triggerPrediction.bind(this), this.predictionFrequency);
    logger.info('Prediction Engine started.');
  }

  stop() {
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
      this.predictionInterval = null;
    }
    logger.info('Prediction Engine stopped.');
  }

  /**
   * Triggers a new prediction based on the current real-time crisis state.
   */
  async triggerPrediction() {
    logger.debug('Prediction Engine triggering new prediction...');
    const crisisState = stateManager.getCrisisState();
    const prediction = await this.generatePrediction(crisisState);
    this.currentPrediction = prediction;
    eventBus.emit('prediction_updated', prediction);
    logger.info('New prediction generated and broadcasted.');
  }

  /**
   * Generates a prediction based on a given state (real or simulated).
   * This could involve running a micro-simulation or using ML models.
   * @param {object} state - The crisis state (real-time or simulated).
   * @returns {Promise<object>} The predicted future state.
   */
  async generatePrediction(state) {
    // For simplicity, this will be a basic projection.
    // In a full system, this would involve:
    // 1. Analyzing current hazards (e.g., fire spread rate)
    // 2. Projecting people movement based on current routes
    // 3. Considering external factors (e.g., weather, building structure)
    // 4. Potentially running a fast-forward micro-simulation.

    logger.debug('Generating prediction...');
    const predictedState = JSON.parse(JSON.stringify(state)); // Deep copy

    // Example: Simple fire spread prediction
    predictedState.activeHazards = predictedState.activeHazards.map(hazard => {
      if (hazard.type === 'fire') {
        const newIntensity = Math.min(10, hazard.intensity + (hazard.spreadRate || 0.1) * 5); // Project 5 ticks ahead
        const newAffectedNodes = [...hazard.affectedNodes]; // More complex logic needed here
        return { ...hazard, intensity: newIntensity, affectedNodes: newAffectedNodes };
      }
      return hazard;
    });

    // Example: Simple people movement prediction (assuming they follow current routes)
    predictedState.peopleLocations = predictedState.peopleLocations.map(person => {
      const assignedRoute = state.evacuationRoutes.find(r => r.personId === person.id);
      if (assignedRoute && assignedRoute.path.length > 1) {
        // Move person one step along their assigned path
        const currentIndex = assignedRoute.path.indexOf(person.currentLocationId);
        if (currentIndex !== -1 && currentIndex < assignedRoute.path.length - 1) {
          return { ...person, currentLocationId: assignedRoute.path[currentIndex + 1], status: 'evacuating' };
        } else if (currentIndex === assignedRoute.path.length - 1) {
          return { ...person, status: 'safe_at_exit' }; // Reached exit
        }
      }
      return person;
    });

    return {
      predictedTime: Date.now() + this.predictionFrequency, // Prediction for 10 seconds in future
      predictedCrisisState: predictedState,
      confidence: 0.85, // Placeholder confidence score
    };
  }

  /**
   * Updates the prediction based on the current simulation state.
   * This is used when the simulation itself is the source of "future" data.
   * @param {object} simulationTickData - The current state from the simulation tick.
   */
  updatePrediction(simulationTickData) {
    logger.debug('Prediction Engine updating from simulation tick...');
    this.currentPrediction = {
      predictedTime: Date.now() + (simulationTickData.time * 1000), // Project simulation time to real time
      predictedCrisisState: {
        activeHazards: simulationTickData.hazards,
        peopleLocations: simulationTickData.people,
        evacuationRoutes: simulationTickData.routes,
        activeAlerts: simulationTickData.alerts,
        crowdDensity: simulationTickData.crowdDensity,
      },
      confidence: 0.95, // Higher confidence from active simulation
    };
    eventBus.emit('prediction_updated', this.currentPrediction);
  }

  getPrediction() {
    return this.currentPrediction;
  }
}

const predictionEngine = new PredictionEngine();
module.exports = { predictionEngine };

