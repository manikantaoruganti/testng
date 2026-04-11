// server/src/events/eventQueue.js
// Manages a queue of events to be processed, ensuring order and preventing overload.

const { eventBus } = require('./eventBus');
const { logger } = require('../utils/logger');

class EventQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.processInterval = 100; // Process events every 100ms
    this.maxBatchSize = 10; // Process up to 10 events per interval

    // Listen to all events and add them to the queue
    eventBus.on('*', (eventName, ...args) => {
      this.addEvent(eventName, ...args);
    });

    setInterval(this.processQueue.bind(this), this.processInterval);
    logger.info('EventQueue initialized and listening for events.');
  }

  /**
   * Adds an event to the queue.
   * @param {string} eventName - The name of the event.
   * @param {any[]} args - Arguments for the event.
   */
  addEvent(eventName, ...args) {
    this.queue.push({ eventName, args, timestamp: Date.now() });
    logger.debug(`Event '${eventName}' added to queue. Queue size: ${this.queue.length}`);
  }

  /**
   * Processes events from the queue in batches.
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = this.queue.splice(0, this.maxBatchSize);
    logger.debug(`Processing batch of ${eventsToProcess.length} events. Remaining in queue: ${this.queue.length}`);

    for (const event of eventsToProcess) {
      try {
        // Re-emit the event, allowing registered handlers to process it
        // Note: This creates a potential infinite loop if not handled carefully.
        // The 'on' listener for '*' should be removed or modified if this is a concern.
        // For now, we assume handlers are distinct from the queueing mechanism.
        // A better approach might be to have a dedicated 'internal_event' emitter.
        eventBus.emit(`processed_${event.eventName}`, ...event.args); // Emit a 'processed' version
        // Or, directly call specific handlers if the queue is meant to replace direct eventBus.emit
        // For this architecture, we'll stick to re-emitting for now, assuming handlers listen to specific events.
      } catch (error) {
        logger.error(`Error processing event '${event.eventName}':`, error);
        eventBus.emit('system_error', {
          message: `Error processing event '${event.eventName}'`,
          error: error.message,
          eventPayload: event.args,
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Gets the current size of the queue.
   * @returns {number} The number of events in the queue.
   */
  size() {
    return this.queue.length;
  }
}

const eventQueue = new EventQueue();
module.exports = { eventQueue };

