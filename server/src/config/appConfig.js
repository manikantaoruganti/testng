// server/src/config/appConfig.js
// Provides application-wide configuration settings, potentially loaded from DB.

const { configService } = require('../services/configService');
const { logger } = require('../utils/logger');
const { eventBus } = require('../events/eventBus');

let currentAppConfig = {};

/**
 * Loads the application configuration from the database or uses defaults.
 */
const loadAppConfig = async () => {
  try {
    currentAppConfig = await configService.loadInitialConfig();
    logger.info('Application configuration initialized.');
  } catch (error) {
    logger.error('Failed to load application configuration, using hardcoded defaults:', error);
    // Fallback to hardcoded defaults if DB fails
    currentAppConfig = {
      simulationSpeed: 1,
      alertThreshold: 80,
      enableRealtimeUpdates: true,
      version: '1.0.0',
      lastUpdated: Date.now(),
    };
  }
};

/**
 * Gets the current application configuration.
 * @returns {object} The current application configuration.
 */
const getAppConfig = () => {
  return { ...currentAppConfig }; // Return a copy to prevent direct modification
};

/**
 * Updates the in-memory application configuration.
 * This is typically called by the configService after a DB update.
 * @param {object} newConfig - The new configuration object.
 */
const updateInMemoryAppConfig = (newConfig) => {
  currentAppConfig = { ...currentAppConfig, ...newConfig };
  logger.info('In-memory application configuration updated.');
};

// Listen for config updates from the event bus
eventBus.on('config_updated', (updatedConfig) => {
  updateInMemoryAppConfig(updatedConfig);
});

// Load config on module initialization
loadAppConfig();

module.exports = {
  getAppConfig,
  loadAppConfig,
  updateInMemoryAppConfig,
};

