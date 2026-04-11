// server/src/events/handlers/panicHandler.js
// Handles events related to panic situations.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { stateManager } = require('../../core/state');
const { alertService } = require('../../services/alertService');
const { logService } = require('../../services/logService');

class PanicHandler {
  constructor() {
    // No specific state for the handler.
  }

  async handlePersonStatusUpdated({ personId, newStatus, oldStatus, locationId }) {
    if (newStatus === 'panicked' && oldStatus !== 'panicked') {
      logger.warn(`PanicHandler: Person ${personId} is now panicked at ${locationId}.`);
      await logService.createLog('event', 'Person Panicked', `Person ${personId} at ${locationId} is panicked.`, 'warning', { personId, locationId });

      // Issue an alert for panic
      await alertService.createAlert({
        title: 'Panic Detected',
        message: `A person (${personId}) is showing signs of panic at ${locationId}.`,
        severity: 'warning',
        locationId: locationId,
        type: 'panic',
      });

      // Potentially trigger evacuation for the area if panic spreads
      eventBus.emit('panic_triggered', { locationId, personId });
    } else if (oldStatus === 'panicked' && newStatus !== 'panicked') {
      logger.info(`PanicHandler: Person ${personId} is no longer panicked.`);
      await logService.createLog('event', 'Person Calmed', `Person ${personId} at ${locationId} is no longer panicked.`, 'info', { personId, locationId });
      // Resolve associated panic alerts for this person/location
      const alertsToResolve = stateManager.getCrisisState().activeAlerts.filter(a => a.type === 'panic' && a.locationId === locationId);
      for (const alert of alertsToResolve) {
        await alertService.resolveAlert(alert.id);
      }
    }
  }

  async handlePanicTriggered({ locationId, personId }) {
    logger.critical(`PanicHandler: Widespread panic triggered at ${locationId} (initial trigger by ${personId || 'sensor'}).`);
    await logService.createLog('event', 'Widespread Panic Triggered', `Panic detected at ${locationId}, potentially spreading.`, 'critical', { locationId, triggeredBy: personId });

    // Issue a critical alert for widespread panic
    await alertService.createAlert({
      title: 'Widespread Panic',
      message: `Widespread panic detected at ${locationId}. Immediate action required.`,
      severity: 'critical',
      locationId: locationId,
      type: 'widespread_panic',
    });

    // Decision Engine should pick this up and potentially initiate evacuation for the floor
    eventBus.emit('evacuation_initiated', { floorId: stateManager.buildingGraph.getFloorOfNode(locationId)?.id });
  }
}

const panicHandler = new PanicHandler();
module.exports = panicHandler;

