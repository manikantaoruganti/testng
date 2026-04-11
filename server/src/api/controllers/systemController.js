// server/src/api/controllers/systemController.js
// Handles API requests for system health and status.

const os = require('os');
const process = require('process');
const { logger } = require('../../utils/logger');
const { errorHandler } = require('../middlewares/errorHandler');
const { connectionManager } = require('../../socket/connectionManager');
const { eventBus } = require('../../events/eventBus');

const systemController = {
  async getSystemHealth(request, reply) {
    try {
      // Basic health check
      const healthStatus = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        database: 'connected', // Assuming DB connection is managed elsewhere
        // Add more detailed checks for other services if needed
      };
      reply.send(healthStatus);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getSystemMetrics(request, reply) {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const cpuUsage = os.loadavg(); // [1min, 5min, 15min average]

      const metrics = {
        cpu: {
          loadAverage: cpuUsage,
          cores: os.cpus().length,
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          unit: 'bytes',
        },
        uptime: os.uptime(), // System uptime
        processUptime: process.uptime(), // Node.js process uptime
        timestamp: Date.now(),
      };
      reply.send(metrics);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async triggerShutdown(request, reply) {
    try {
      logger.warn('System shutdown requested via API.');
      eventBus.emit('system_shutdown', { reason: 'API request' });
      reply.send({ success: true, message: 'System shutdown initiated.' });
      // Give a short delay for response to be sent before exiting
      setTimeout(() => process.exit(0), 1000);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getConnectedClients(request, reply) {
    try {
      const connections = Array.from(connectionManager.getAllConnections().keys());
      reply.send({ count: connections.length, clients: connections });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { systemController };

