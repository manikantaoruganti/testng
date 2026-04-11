// server/src/api/routes/crisisRoutes.js
// Defines API routes for real-time crisis data.

const { crisisController } = require('../controllers/crisisController');

async function crisisRoutes(fastify, options) {
  // Get current crisis state (hazards, people, routes, alerts)
  fastify.get('/', crisisController.getCurrentCrisisState);

  // Get all active hazards
  fastify.get('/hazards', crisisController.getActiveHazards);

  // Get all people locations and statuses
  fastify.get('/people', crisisController.getPeopleLocations);

  // Get all active evacuation routes
  fastify.get('/routes', crisisController.getEvacuationRoutes);

  // Get all active alerts
  fastify.get('/alerts', crisisController.getActiveAlerts);

  // Get crowd density data
  fastify.get('/crowd-density', crisisController.getCrowdDensity);

  // Manually trigger a crisis event (for testing/admin)
  fastify.post('/trigger-event', crisisController.triggerCrisisEvent);

  // Resolve a specific alert (for admin)
  fastify.post('/alerts/:id/resolve', crisisController.resolveAlert);
}

module.exports = crisisRoutes;

