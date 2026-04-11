// server/src/api/routes/logRoutes.js
// Defines API routes for retrieving various types of logs.

const { logController } = require('../controllers/logController');

async function logRoutes(fastify, options) {
  // Get all event logs
  fastify.get('/events', logController.getEventLogs);

  // Get all decision logs
  fastify.get('/decisions', logController.getDecisionLogs);

  // Get all system logs
  fastify.get('/system', logController.getSystemLogs);

  // Get logs by type and filters
  fastify.get('/:type', logController.getLogsByType);
}

module.exports = logRoutes;

