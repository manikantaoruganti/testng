// server/src/core/riskEngine.js
// The Risk Engine assesses the overall risk level of the crisis based on various factors.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { buildingGraph } = require('../graph/building');

class RiskEngine {
  constructor() {
    this.initListeners();
  }

  initListeners() {
    // Listen for events that might change risk levels
    eventBus.on('hazard_created', this.recalculateRisk.bind(this));
    eventBus.on('hazard_updated', this.recalculateRisk.bind(this));
    eventBus.on('hazard_resolved', this.recalculateRisk.bind(this));
    eventBus.on('person_moved', this.recalculateRisk.bind(this));
    eventBus.on('alert_issued', this.recalculateRisk.bind(this));
    eventBus.on('crowd_density_updated', this.recalculateRisk.bind(this));
  }

  /**
   * Recalculates the overall risk based on the current crisis state.
   * This method is typically triggered by events or the scheduler.
   * @param {object} crisisState - The current real-time crisis state.
   * @returns {Promise<number>} The calculated overall risk score (e.g., 0-100).
   */
  async calculateOverallRisk(crisisState) {
    logger.debug('Risk Engine calculating overall risk...');
    const { activeHazards, peopleLocations, activeAlerts, crowdDensity } = crisisState;
    let totalRisk = 0;

    // Factor 1: Hazards
    for (const hazard of activeHazards) {
      if (hazard.type === 'fire') {
        totalRisk += hazard.intensity * 5; // Higher intensity = higher risk
        totalRisk += hazard.affectedNodes.length * 2; // More affected area = higher risk
      } else if (hazard.type === 'blocked_path') {
        totalRisk += 10; // Blocking a path is a significant risk
      }
      // Add other hazard types
    }

    // Factor 2: People at Risk
    const peopleInHazardZones = peopleLocations.filter(person =>
      activeHazards.some(h => h.affectedNodes.includes(person.currentLocationId))
    ).length;
    totalRisk += peopleInHazardZones * 10; // Each person in a hazard adds significant risk

    const peopleWithoutSafeRoute = peopleLocations.filter(person =>
      activeHazards.some(h => h.affectedNodes.includes(person.currentLocationId)) &&
      !crisisState.evacuationRoutes.some(r => r.personId === person.id && r.isSafe)
    ).length;
    totalRisk += peopleWithoutSafeRoute * 20; // Trapped people are highest risk

    // Factor 3: Alerts Severity
    for (const alert of activeAlerts) {
      if (alert.severity === 'critical') totalRisk += 15;
      else if (alert.severity === 'warning') totalRisk += 5;
    }

    // Factor 4: Crowd Density
    for (const locationId in crowdDensity) {
      const count = crowdDensity[locationId];
      const node = buildingGraph.getNode(locationId);
      if (node && node.capacity && count > node.capacity) {
        totalRisk += (count - node.capacity) * 2; // Over capacity adds risk
      }
    }

    // Normalize risk to a 0-100 scale (example, adjust max possible risk)
    const maxPossibleRisk = 500; // Estimate based on max hazards, people, etc.
    const normalizedRisk = Math.min(100, (totalRisk / maxPossibleRisk) * 100);

    logger.debug(`Overall risk calculated: ${normalizedRisk.toFixed(2)}`);
    return parseFloat(normalizedRisk.toFixed(2));
  }

  /**
   * Recalculates risk and emits an update.
   * This is a wrapper for event listeners.
   */
  async recalculateRisk() {
    const crisisState = require('./state').stateManager.getCrisisState(); // Get latest state
    const riskScore = await this.calculateOverallRisk(crisisState);
    eventBus.emit('risk_score_updated', { timestamp: Date.now(), score: riskScore });
  }
}

const riskEngine = new RiskEngine();
module.exports = { riskEngine };

