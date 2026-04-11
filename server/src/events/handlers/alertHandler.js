// server/src/events/handlers/alertHandler.js
// Handles the lifecycle of alerts within the system.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { stateManager } = require('../../core/state');
const { alertService } = require('../../services/alertService');
const { logService } = require('../../services/logService');

class AlertHandler {
  constructor() {
    // No specific state for the handler.
  }

  async handleAlertIssued(alertData) {
    logger.info(`AlertHandler: New alert issued - ${alertData.title} (${alertData.severity}) at ${alertData.locationId}`);
    await logService.createLog('event', 'Alert Issued', alertData.message, alertData.severity, alertData);

    // Create the alert in the database and update state
    const newAlert = await alertService.createAlert(alertData);
    if (newAlert) {
      stateManager.handleAlertIssued(newAlert); // Add to active alerts in state
      // Broadcast to clients via WebSocket
      eventBus.emit('websocket_broadcast', { type: 'new_alert', payload: newAlert });
    }
  }

  async handleAlertResolved(alertId) {
    logger.info(`AlertHandler: Alert resolved - ${alertId}`);
    await logService.createLog('event', 'Alert Resolved', `Alert ID: ${alertId} has been resolved.`, 'success', { alertId });

    // Resolve the alert in the database and update state
    const resolvedAlert = await alertService.resolveAlert(alertId);
    if (resolvedAlert) {
      // Remove from active alerts in state (stateManager will handle filtering)
      // Broadcast to clients via WebSocket
      eventBus.emit('websocket_broadcast', { type: 'alert_resolved', payload: { id: alertId } });
    }
  }

  async handleAlertUpdated(alertId, updates) {
    logger.info(`AlertHandler: Alert updated - ${alertId}`);
    await logService.createLog('event', 'Alert Updated', `Alert ID: ${alertId} updated.`, 'info', { alertId, updates });

    const updatedAlert = await alertService.updateAlert(alertId, updates);
    if (updatedAlert) {
      // Update in state manager (stateManager will handle mapping)
      // Broadcast to clients via WebSocket
      eventBus.emit('websocket_broadcast', { type: 'alert_updated', payload: updatedAlert });
    }
  }
}

const alertHandler = new AlertHandler();
module.exports = alertHandler;

