// server/src/services/crisisService.js
// Provides business logic for managing real-time crisis data.

const { stateManager } = require('../core/state');
const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');

class CrisisService {
  constructor() {
    // No specific state, relies on stateManager.
  }

  /**
   * Gets the current real-time crisis state.
   * @returns {object} The current crisis state.
   */
  getCurrentState() {
    return stateManager.getCrisisState();
  }

  /**
   * Adds a new hazard to the system.
   * @param {object} hazardData - Data for the new hazard.
   * @returns {object} The created hazard.
   */
  async addHazard(hazardData) {
    const newHazard = {
      id: `hazard-${Date.now()}`,
      timestamp: Date.now(),
      ...hazardData,
    };
    eventBus.emit('hazard_created', newHazard);
    logger.info(`CrisisService: Added new hazard ${newHazard.id} at ${newHazard.locationId}`);
    return newHazard;
  }

  /**
   * Updates an existing hazard.
   * @param {string} hazardId - The ID of the hazard to update.
   * @param {object} updates - Properties to update.
   * @returns {object|null} The updated hazard, or null if not found.
   */
  async updateHazard(hazardId, updates) {
    const crisisState = stateManager.getCrisisState();
    const existingHazard = crisisState.activeHazards.find(h => h.id === hazardId);
    if (!existingHazard) {
      logger.warn(`CrisisService: Hazard ${hazardId} not found for update.`);
      return null;
    }
    const updatedHazard = { ...existingHazard, ...updates, timestamp: Date.now() };
    eventBus.emit('hazard_updated', updatedHazard);
    logger.info(`CrisisService: Updated hazard ${hazardId}`);
    return updatedHazard;
  }

  /**
   * Resolves (removes) a hazard.
   * @param {string} hazardId - The ID of the hazard to resolve.
   * @returns {boolean} True if resolved, false if not found.
   */
  async resolveHazard(hazardId) {
    const crisisState = stateManager.getCrisisState();
    const exists = crisisState.activeHazards.some(h => h.id === hazardId);
    if (!exists) {
      logger.warn(`CrisisService: Hazard ${hazardId} not found for resolution.`);
      return false;
    }
    eventBus.emit('hazard_resolved', hazardId);
    logger.info(`CrisisService: Resolved hazard ${hazardId}`);
    return true;
  }

  /**
   * Updates a person's location and status.
   * @param {string} personId - The ID of the person.
   * @param {string} newLocationId - The new location ID.
   * @param {string} newFloorId - The new floor ID.
   * @param {string} status - The new status (e.g., 'normal', 'evacuating', 'panicked').
   * @returns {object|null} The updated person object, or null if not found.
   */
  async updatePersonLocationAndStatus(personId, newLocationId, newFloorId, status) {
    const crisisState = stateManager.getCrisisState();
    const existingPerson = crisisState.peopleLocations.find(p => p.id === personId);
    if (!existingPerson) {
      logger.warn(`CrisisService: Person ${personId} not found for location/status update.`);
      return null;
    }

    const oldStatus = existingPerson.status;
    const updatedPerson = { ...existingPerson, currentLocationId: newLocationId, currentFloorId: newFloorId, status, timestamp: Date.now() };
    eventBus.emit('person_moved', { personId, newLocationId, newFloorId, status });
    if (oldStatus !== status) {
      eventBus.emit('person_status_updated', { personId, newStatus: status, oldStatus, locationId: newLocationId });
    }
    logger.info(`CrisisService: Person ${personId} moved to ${newLocationId} with status ${status}`);
    return updatedPerson;
  }

  /**
   * Adds a new person to the system.
   * @param {object} personData - Data for the new person.
   * @returns {object} The created person.
   */
  async addPerson(personData) {
    const newPerson = {
      id: `person-${Date.now()}`,
      timestamp: Date.now(),
      status: 'normal',
      ...personData,
    };
    // This would typically come from a sensor, but for manual addition:
    stateManager.currentCrisisState.peopleLocations.push(newPerson);
    eventBus.emit('person_detected', newPerson);
    logger.info(`CrisisService: Added new person ${newPerson.id} at ${newPerson.currentLocationId}`);
    return newPerson;
  }
}

const crisisService = new CrisisService();
module.exports = { crisisService };

