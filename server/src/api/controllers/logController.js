// server/src/api/controllers/logController.js
// Handles API requests for retrieving logs.

const { logService } = require('../../services/logService');
const { errorHandler } = require('../middlewares/errorHandler');
const { logger } = require('../../utils/logger');

const logController = {
  async getEventLogs(request, reply) {
    try {
      const filters = request.query;
      const logs = await logService.getEventLogs(filters);
      reply.send(logs);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getDecisionLogs(request, reply) {
    try {
      const filters = request.query;
      const logs = await logService.getDecisionLogs(filters);
      reply.send(logs);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getSystemLogs(request, reply) {
    try {
      const filters = request.query;
      const logs = await logService.getSystemLogs(filters);
      reply.send(logs);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getLogsByType(request, reply) {
    try {
      const { type } = request.params;
      const filters = request.query;
      let logs;
      switch (type) {
        case 'events':
          logs = await logService.getEventLogs(filters);
          break;
        case 'decisions':
          logs = await logService.getDecisionLogs(filters);
          break;
        case 'system':
          logs = await logService.getSystemLogs(filters);
          break;
        default:
          return reply.status(400).send({ success: false, message: 'Invalid log type specified.' });
      }
      reply.send(logs);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { logController };

