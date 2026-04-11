// server/src/api/routes/systemRoutes.js
// Defines API routes for system health, status, and control.

const { systemController } = require('../controllers/systemController');

async function systemRoutes(fastify, options) {
  // Get overall system health status
  fastify.get('/health', systemController.getSystemHealth);

  // Get system metrics (CPU, memory, uptime)
  fastify.get('/metrics', systemController.getSystemMetrics);

  // Trigger a system shutdown (admin only)
  fastify.post('/shutdown', systemController.triggerShutdown);

  // Get connected WebSocket clients
  fastify.get('/connections', systemController.getConnectedClients);
}

module.exports = systemRoutes;

