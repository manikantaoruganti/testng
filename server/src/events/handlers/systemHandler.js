// server/src/events/handlers/systemHandler.js
// Handles system-level events like startup, shutdown, errors, and configuration changes.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { logService } = require('../../services/logService');
const { configService } = require('../../services/configService');

class SystemHandler {
  constructor() {
    // No specific state for the handler.
  }

  async handleSystemReady(payload) {
    logger.info(`SystemHandler: System is ready! Message: ${payload.message}`);
    await logService.createLog('system', 'System Ready', payload.message, 'info', payload);
    // Potentially load initial configurations or perform startup checks
    await configService.loadInitialConfig();
  }

  async handleSystemError({ message, error, eventPayload }) {
    logger.error(`SystemHandler: System Error! Message: ${message}, Error: ${error}`);
    await logService.createLog('system', 'System Error', message, 'error', { error, eventPayload });
    // Implement error notification mechanisms (e.g., email, PagerDuty)
    // Potentially trigger system health checks or fallback procedures
  }

  async handleConfigUpdated(updatedConfig) {
    logger.info(`SystemHandler: Configuration updated. Version: ${updatedConfig.version || 'N/A'}`);
    await logService.createLog('system', 'Config Updated', 'Application configuration has been updated.', 'info', updatedConfig);
    // Apply new configurations to relevant modules
    // For example, if simulation speed is a config, update simulationEngine.setSpeed()
  }

  async handleSystemShutdown(payload) {
    logger.critical(`SystemHandler: System is shutting down! Reason: ${payload.reason}`);
    await logService.createLog('system', 'System Shutdown', payload.reason, 'critical', payload);
    // Perform graceful shutdown procedures for all modules
    // Save any volatile state, close database connections, etc.
  }
}

const systemHandler = new SystemHandler();
module.exports = systemHandler;

