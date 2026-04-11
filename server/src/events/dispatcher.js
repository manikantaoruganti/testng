// server/src/events/dispatcher.js
// The Dispatcher routes events to their appropriate handlers.

const { eventBus } = require('./eventBus');
const { logger } = require('../utils/logger');
const eventTypes = require('./eventTypes');

// Import all handlers
const fireHandler = require('./handlers/fireHandler');
const panicHandler = require('./handlers/panicHandler');
const evacuationHandler = require('./handlers/evacuationHandler');
const systemHandler = require('./handlers/systemHandler');
const sensorHandler = require('./handlers/sensorHandler');
const alertHandler = require('./handlers/alertHandler');

class EventDispatcher {
  constructor() {
    this.registerHandlers();
    logger.info('EventDispatcher initialized and handlers registered.');
  }

  registerHandlers() {
    // Register specific handlers for specific event types
    eventBus.on(eventTypes.HAZARD_CREATED, fireHandler.handleHazardCreated);
    eventBus.on(eventTypes.HAZARD_UPDATED, fireHandler.handleHazardUpdated);
    eventBus.on(eventTypes.HAZARD_RESOLVED, fireHandler.handleHazardResolved);

    eventBus.on(eventTypes.PERSON_STATUS_UPDATED, panicHandler.handlePersonStatusUpdated);
    eventBus.on(eventTypes.PANIC_TRIGGERED, panicHandler.handlePanicTriggered); // Direct panic event

    eventBus.on(eventTypes.EVACUATION_INITIATED, evacuationHandler.handleEvacuationInitiated);
    eventBus.on(eventTypes.ROUTE_RECALCULATION_NEEDED, evacuationHandler.handleRouteRecalculationNeeded);
    eventBus.on(eventTypes.PERSON_GUIDANCE_NEEDED, evacuationHandler.handlePersonGuidanceNeeded);

    eventBus.on(eventTypes.SYSTEM_READY, systemHandler.handleSystemReady);
    eventBus.on(eventTypes.SYSTEM_ERROR, systemHandler.handleSystemError);
    eventBus.on(eventTypes.CONFIG_UPDATED, systemHandler.handleConfigUpdated);

    eventBus.on(eventTypes.SENSOR_DATA_RECEIVED, sensorHandler.handleSensorDataReceived);

    eventBus.on(eventTypes.ALERT_ISSUED, alertHandler.handleAlertIssued);
    eventBus.on(eventTypes.ALERT_RESOLVED, alertHandler.handleAlertResolved);

    // Generic handler for logging all events (optional, for debugging)
    // eventBus.on('*', (eventName, ...args) => {
    //   logger.debug(`[Dispatcher] Received event: ${eventName}`, args);
    // });
  }
}

const eventDispatcher = new EventDispatcher();
module.exports = { eventDispatcher };

