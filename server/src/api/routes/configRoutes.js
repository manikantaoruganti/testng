// server/src/api/routes/configRoutes.js
// Defines API routes for managing application and building configurations.

const { configController } = require('../controllers/configController');

async function configRoutes(fastify, options) {
  // Get application configuration
  fastify.get('/app', configController.getAppConfig);

  // Update application configuration
  fastify.put('/app', configController.updateAppConfig);

  // Get building configuration (e.g., raw building.json)
  fastify.get('/building', configController.getBuildingConfig);

  // Update building configuration (e.g., upload new building.json)
  fastify.put('/building', configController.updateBuildingConfig);
}

module.exports = configRoutes;

