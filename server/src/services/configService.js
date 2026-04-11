// server/src/services/configService.js
// Provides business logic for managing application and building configurations.

const { AppConfig, BuildingConfig } = require('../db/schemas/configSchema'); // Assuming config schemas
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const { eventBus } = require('../events/eventBus');

class ConfigService {
  constructor() {
    // No specific state, relies on DB.
  }

  /**
   * Loads initial application configuration from DB or defaults.
   * @returns {Promise<object>} The application configuration.
   */
  async loadInitialConfig() {
    try {
      let config = await AppConfig.findOne({});
      if (!config) {
        logger.warn('No application config found in DB. Creating default config.');
        config = await AppConfig.create({
          simulationSpeed: 1,
          alertThreshold: 80,
          enableRealtimeUpdates: true,
          version: '1.0.0',
          lastUpdated: Date.now(),
        });
      }
      logger.info('Application config loaded.');
      return config.toObject();
    } catch (error) {
      logger.error('ConfigService: Error loading initial config:', error);
      throw error;
    }
  }

  /**
   * Retrieves the current application configuration.
   * @returns {Promise<object>} The application configuration.
   */
  async getAppConfig() {
    try {
      const config = await AppConfig.findOne({});
      if (!config) {
        throw new Error('Application configuration not found.');
      }
      return config.toObject();
    } catch (error) {
      logger.error('ConfigService: Error getting app config:', error);
      throw error;
    }
  }

  /**
   * Updates the application configuration.
   * @param {object} updates - Properties to update.
   * @returns {Promise<object>} The updated application configuration.
   */
  async updateAppConfig(updates) {
    try {
      const config = await AppConfig.findOneAndUpdate(
        {},
        { ...updates, lastUpdated: Date.now() },
        { new: true, upsert: true } // Create if not exists
      );
      logger.info('Application config updated.');
      eventBus.emit('config_updated', config.toObject());
      return config.toObject();
    } catch (error) {
      logger.error('ConfigService: Error updating app config:', error);
      throw error;
    }
  }

  /**
   * Retrieves the current building configuration (from file or DB).
   * For now, it reads from the static `building.json`.
   * @returns {Promise<object>} The building configuration.
   */
  async getBuildingConfig() {
    logger.debug('ConfigService: Reading building config from file...');
    try {
      const filePath = path.resolve(__dirname, '../../../client/public/building.json');
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('ConfigService: Error reading building config file:', error);
      throw error;
    }
  }

  /**
   * Updates the building configuration.
   * For now, it writes to the static `building.json`.
   * In a real system, this might involve updating a DB entry or triggering a graph rebuild.
   * @param {object} newBuildingConfig - The new building configuration.
   * @returns {Promise<object>} The updated building configuration.
   */
  async updateBuildingConfig(newBuildingConfig) {
    logger.info('ConfigService: Updating building config file...');
    try {
      const filePath = path.resolve(__dirname, '../../../client/public/building.json');
      await fs.writeFile(filePath, JSON.stringify(newBuildingConfig, null, 2), 'utf8');
      logger.info('Building config file updated.');
      eventBus.emit('building_config_updated', newBuildingConfig);
      return newBuildingConfig;
    } catch (error) {
      logger.error('ConfigService: Error writing building config file:', error);
      throw error;
    }
  }
}

const configService = new ConfigService();
module.exports = { configService };

