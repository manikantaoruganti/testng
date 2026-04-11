// server/src/api/routes/simulationRoutes.js
// Defines API routes for managing and interacting with the simulation engine.

const { simulationController } = require('../controllers/simulationController');

async function simulationRoutes(fastify, options) {
  // Get all available simulation scenarios
  fastify.get('/scenarios', simulationController.getScenarios);

  // Get a specific simulation scenario by ID
  fastify.get('/scenarios/:id', simulationController.getScenarioById);

  // Start a simulation
  fastify.post('/start', simulationController.startSimulation);

  // Pause the current simulation
  fastify.post('/pause', simulationController.pauseSimulation);

  // Resume the paused simulation
  fastify.post('/resume', simulationController.resumeSimulation);

  // Reset the current simulation
  fastify.post('/reset', simulationController.resetSimulation);

  // Set simulation speed
  fastify.post('/set-speed', simulationController.setSimulationSpeed);

  // Trigger an event within the simulation
  fastify.post('/event', simulationController.triggerSimulationEvent);

  // Get current simulation data (if running)
  fastify.get('/data', simulationController.getSimulationData);
}

module.exports = simulationRoutes;

