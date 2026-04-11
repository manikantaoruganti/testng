// server/src/events/handlers/fireHandler.js
// Handles events related to fire hazards.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { stateManager } = require('../../core/state');
const { routingEngine } = require('../../core/routing');
const { alertService } = require('../../services/alertService');
const { logService } = require('../../services/logService');

class FireHandler {
  constructor() {
    // No specific state for the handler, relies on stateManager and services.
  }

  async handleHazardCreated(hazard) {
    logger.info(`FireHandler: New hazard created - ${hazard.type} at ${hazard.locationId}`);
    await logService.createLog('event', 'Hazard Created', `Type: ${hazard.type}, Location: ${hazard.locationId}`, 'warning', hazard);

    // Issue an alert
    await alertService.createAlert({
      title: `${hazard.type.toUpperCase()} Detected`,
      message: `A ${hazard.type} has been detected at ${hazard.locationId}. Intensity: ${hazard.intensity || 'N/A'}.`,
      severity: hazard.intensity > 5 ? 'critical' : 'warning',
      locationId: hazard.locationId,
      type: hazard.type,
    });

    // Trigger route recalculation for affected areas
    eventBus.emit('route_recalculation_needed', { affectedNodes: [hazard.locationId] });
  }

  async handleHazardUpdated(updatedHazard) {
    logger.info(`FireHandler: Hazard updated - ${updatedHazard.type} at ${updatedHazard.locationId}`);
    await logService.createLog('event', 'Hazard Updated', `Type: ${updatedHazard.type}, Location: ${updatedHazard.locationId}, Intensity: ${updatedHazard.intensity || 'N/A'}`, 'info', updatedHazard);

    // Update existing alert or issue new one if severity changes
    const existingAlert = stateManager.getCrisisState().activeAlerts.find(a => a.type === updatedHazard.type && a.locationId === updatedHazard.locationId);
    if (existingAlert) {
      const newSeverity = updatedHazard.intensity > 7 ? 'critical' : updatedHazard.intensity > 3 ? 'warning' : 'info';
      if (existingAlert.severity !== newSeverity) {
        await alertService.updateAlert(existingAlert.id, { severity: newSeverity, message: `Intensity increased to ${updatedHazard.intensity}.` });
      }
    } else {
      await alertService.createAlert({
        title: `${updatedHazard.type.toUpperCase()} Intensity Changed`,
        message: `The ${updatedHazard.type} at ${updatedHazard.locationId} has changed intensity to ${updatedHazard.intensity}.`,
        severity: updatedHazard.intensity > 7 ? 'critical' : 'warning',
        locationId: updatedHazard.locationId,
        type: updatedHazard.type,
      });
    }

    // Trigger route recalculation if affected areas change
    if (updatedHazard.affectedNodes && updatedHazard.affectedNodes.length > 0) {
      eventBus.emit('route_recalculation_needed', { affectedNodes: updatedHazard.affectedNodes });
    }
  }

  async handleHazardResolved(hazardId) {
    logger.info(`FireHandler: Hazard resolved - ${hazardId}`);
    await logService.createLog('event', 'Hazard Resolved', `Hazard ID: ${hazardId}`, 'success', { hazardId });

    // Resolve associated alerts
    const alertsToResolve = stateManager.getCrisisState().activeAlerts.filter(a => a.type === 'fire' && a.locationId === hazardId); // Assuming locationId matches hazardId for simplicity
    for (const alert of alertsToResolve) {
      await alertService.resolveAlert(alert.id);
    }

    // Trigger route recalculation to clear any blocked paths
    eventBus.emit('route_recalculation_needed', { clearedHazardId: hazardId });
  }
}

const fireHandler = new FireHandler();
module.exports = fireHandler;

