// server/src/services/alertService.js
// Provides business logic for managing alerts.

const { CrisisEvent } = require('../db/schemas/eventSchema'); // Assuming alerts are stored as events
const { stateManager } = require('../core/state');
const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');

class AlertService {
  constructor() {
    // No specific state, relies on DB and stateManager.
  }

  /**
   * Creates a new alert in the system.
   * @param {object} alertData - Data for the new alert (title, message, severity, locationId, type).
   * @returns {Promise<object>} The created alert object.
   */
  async createAlert(alertData) {
    try {
      const newAlert = {
        id: `alert-${Date.now()}`, // Client-side ID for immediate use
        timestamp: Date.now(),
        status: 'active',
        ...alertData,
      };

      // Store in DB (using CrisisEvent schema for simplicity)
      const dbAlert = await CrisisEvent.create({
        eventType: 'alert_issued',
        severity: newAlert.severity,
        message: newAlert.message,
        locationId: newAlert.locationId,
        payload: newAlert,
      });

      logger.info(`AlertService: Created new alert ${newAlert.id} (${newAlert.title})`);
      eventBus.emit('alert_issued', newAlert); // Notify system of new alert
      return newAlert;
    } catch (error) {
      logger.error('AlertService: Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Resolves an active alert.
   * @param {string} alertId - The ID of the alert to resolve.
   * @returns {Promise<object|null>} The resolved alert, or null if not found.
   */
  async resolveAlert(alertId) {
    try {
      // Find the alert in the current state
      const crisisState = stateManager.getCrisisState();
      const alertToResolve = crisisState.activeAlerts.find(a => a.id === alertId);

      if (!alertToResolve) {
        logger.warn(`AlertService: Alert ${alertId} not found for resolution.`);
        return null;
      }

      // Update in DB (mark as resolved)
      // Assuming CrisisEvent has a 'status' field or similar for resolution
      await CrisisEvent.updateOne(
        { 'payload.id': alertId },
        { $set: { 'payload.status': 'resolved', 'payload.resolvedAt': Date.now() } }
      );

      logger.info(`AlertService: Resolved alert ${alertId}`);
      eventBus.emit('alert_resolved', { id: alertId }); // Notify system of alert resolution
      return { ...alertToResolve, status: 'resolved', resolvedAt: Date.now() };
    } catch (error) {
      logger.error(`AlertService: Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Updates an existing alert.
   * @param {string} alertId - The ID of the alert to update.
   * @param {object} updates - Properties to update.
   * @returns {Promise<object|null>} The updated alert, or null if not found.
   */
  async updateAlert(alertId, updates) {
    try {
      const crisisState = stateManager.getCrisisState();
      const existingAlert = crisisState.activeAlerts.find(a => a.id === alertId);

      if (!existingAlert) {
        logger.warn(`AlertService: Alert ${alertId} not found for update.`);
        return null;
      }

      const updatedAlert = { ...existingAlert, ...updates, timestamp: Date.now() };

      // Update in DB
      await CrisisEvent.updateOne(
        { 'payload.id': alertId },
        { $set: { 'payload': updatedAlert } }
      );

      logger.info(`AlertService: Updated alert ${alertId}`);
      eventBus.emit('alert_updated', updatedAlert); // Notify system of alert update
      return updatedAlert;
    } catch (error) {
      logger.error(`AlertService: Error updating alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Gets all active alerts.
   * @returns {Array<object>} An array of active alert objects.
   */
  getActiveAlerts() {
    return stateManager.getCrisisState().activeAlerts;
  }
}

const alertService = new AlertService();
module.exports = { alertService };

