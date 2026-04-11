// server/src/core/scheduler.js
// Manages scheduled tasks, such as periodic data updates, health checks, or cleanup.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { stateManager } = require('./state');
const { riskEngine } = require('./riskEngine');

class Scheduler {
  constructor() {
    this.tasks = [];
    this.intervalIds = new Map();
  }

  /**
   * Adds a task to be scheduled.
   * @param {string} id - Unique ID for the task.
   * @param {function} callback - The function to execute.
   * @param {number} intervalMs - The interval in milliseconds.
   * @param {boolean} runImmediately - Whether to run the task immediately upon scheduling.
   */
  addTask(id, callback, intervalMs, runImmediately = false) {
    if (this.intervalIds.has(id)) {
      logger.warn(`Task with ID ${id} already exists. Stopping existing task.`);
      this.stopTask(id);
    }

    this.tasks.push({ id, callback, intervalMs, runImmediately });
    logger.info(`Task '${id}' added with interval ${intervalMs}ms.`);

    if (runImmediately) {
      callback();
    }
    const intervalId = setInterval(callback, intervalMs);
    this.intervalIds.set(id, intervalId);
  }

  /**
   * Stops a scheduled task.
   * @param {string} id - The ID of the task to stop.
   */
  stopTask(id) {
    const intervalId = this.intervalIds.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(id);
      this.tasks = this.tasks.filter(task => task.id !== id);
      logger.info(`Task '${id}' stopped.`);
    } else {
      logger.warn(`Attempted to stop non-existent task: ${id}`);
    }
  }

  /**
   * Starts all registered tasks.
   */
  start() {
    logger.info('Scheduler starting all tasks...');
    // Define and add core system tasks
    this.addTask(
      'updateCrisisState',
      async () => {
        logger.debug('Scheduler: Fetching latest crisis data...');
        // In a real system, this would trigger fetching from sensors/DB
        // For now, we'll simulate some updates or rely on event-driven changes
        // stateManager.fetchLatestSensorData(); // Example
      },
      5000 // Every 5 seconds
    );

    this.addTask(
      'calculateRiskScores',
      async () => {
        logger.debug('Scheduler: Calculating overall risk scores...');
        const crisisState = stateManager.getCrisisState();
        const riskScore = await riskEngine.calculateOverallRisk(crisisState);
        eventBus.emit('risk_score_updated', { timestamp: Date.now(), score: riskScore });
      },
      10000 // Every 10 seconds
    );

    // Add more tasks as needed (e.g., database cleanup, external API calls)
    logger.info(`Scheduler initialized with ${this.tasks.length} tasks.`);
  }

  /**
   * Stops all scheduled tasks.
   */
  stopAll() {
    logger.info('Scheduler stopping all tasks...');
    this.intervalIds.forEach((id, taskId) => {
      clearInterval(id);
      logger.debug(`Stopped task: ${taskId}`);
    });
    this.intervalIds.clear();
    this.tasks = [];
    logger.info('All scheduler tasks stopped.');
  }
}

const scheduler = new Scheduler();
module.exports = { scheduler };

