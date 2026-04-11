// server/src/api/controllers/configController.js
// Handles API requests for application and building configurations.

const { configService } = require('../../services/configService');
const { errorHandler } = require('../middlewares/errorHandler');
const { logger } = require('../../utils/logger');
const { eventBus } = require('../../events/eventBus');

const configController = {
  async getAppConfig(request, reply) {
    try {
      const config = await configService.getAppConfig();
      reply.send(config);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async updateAppConfig(request, reply) {
    try {
      const updatedConfig = await configService.updateAppConfig(request.body);
      eventBus.emit('config_updated', updatedConfig); // Notify system of config change
      reply.send({ success: true, message: 'Application configuration updated.', config: updatedConfig });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getBuildingConfig(request, reply) {
    try {
      const config = await configService.getBuildingConfig();
      reply.send(config);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async updateBuildingConfig(request, reply) {
    try {
      const updatedConfig = await configService.updateBuildingConfig(request.body);
      // Potentially trigger a graph rebuild or system restart if building config changes
      eventBus.emit('building_config_updated', updatedConfig);
      reply.send({ success: true, message: 'Building configuration updated.', config: updatedConfig });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { configController };

