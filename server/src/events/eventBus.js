// server/src/events/eventBus.js
// Centralized event bus for inter-module communication.

const EventEmitter = require('events');
const { logger } = require('../utils/logger');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners for complex systems
    logger.info('EventBus initialized.');
  }

  emit(eventName, ...args) {
    logger.debug(`EventBus: Emitting event '${eventName}'`, args);
    super.emit(eventName, ...args);
  }

  on(eventName, listener) {
    logger.debug(`EventBus: Registering listener for event '${eventName}'`);
    super.on(eventName, listener);
  }

  off(eventName, listener) {
    logger.debug(`EventBus: Deregistering listener for event '${eventName}'`);
    super.off(eventName, listener);
  }

  once(eventName, listener) {
    logger.debug(`EventBus: Registering one-time listener for event '${eventName}'`);
    super.once(eventName, listener);
  }
}

const eventBus = new EventBus();
module.exports = { eventBus };

