// server/src/api/routes/analyticsRoutes.js
// Defines API routes for retrieving analytics data.

const { analyticsController } = require('../controllers/analyticsController');

async function analyticsRoutes(fastify, options) {
  // Get overall analytics dashboard data
  fastify.get('/', analyticsController.getOverallAnalytics);

  // Get risk scores over time
  fastify.get('/risk-scores', analyticsController.getRiskScores);

  // Get response times for incidents
  fastify.get('/response-times', analyticsController.getResponseTimes);

  // Get evacuation efficiency metrics
  fastify.get('/evacuation-efficiency', analyticsController.getEvacuationEfficiency);

  // Get hazard trends over time
  fastify.get('/hazard-trends', analyticsController.getHazardTrends);

  // Get incident breakdown by type
  fastify.get('/incident-breakdown', analyticsController.getIncidentBreakdown);
}

module.exports = analyticsRoutes;

