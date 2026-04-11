// server/src/api/controllers/simulationController.js
// Handles API requests for simulation management.

const { simulationEngine } = require('../../core/simulation');
const { stateManager } = require('../../core/state');
const { eventBus } = require('../../events/eventBus');
const { logger } = require('../../utils/logger');
const { errorHandler } = require('../middlewares/errorHandler');

const simulationController = {
  async getScenarios(request, reply) {
    try {
      const scenarios = simulationEngine.getScenarios();
      reply.send(scenarios);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getScenarioById(request, reply) {
    try {
      const { id } = request.params;
      const scenario = simulationEngine.getScenarioById(id);
      if (!scenario) {
        return reply.status(404).send({ success: false, message: 'Scenario not found.' });
      }
      reply.send(scenario);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async startSimulation(request, reply) {
    try {
      const { scenarioId } = request.body;
      if (!scenarioId) {
        return reply.status(400).send({ success: false, message: 'Scenario ID is required.' });
      }
      eventBus.emit('simulation_start_request', scenarioId);
      reply.send({ success: true, message: `Simulation start requested for scenario ${scenarioId}.` });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async pauseSimulation(request, reply) {
    try {
      eventBus.emit('simulation_pause_request');
      reply.send({ success: true, message: 'Simulation pause requested.' });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async resumeSimulation(request, reply) {
    try {
      eventBus.emit('simulation_resume_request');
      reply.send({ success: true, message: 'Simulation resume requested.' });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async resetSimulation(request, reply) {
    try {
      eventBus.emit('simulation_reset_request');
      reply.send({ success: true, message: 'Simulation reset requested.' });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async setSimulationSpeed(request, reply) {
    try {
      const { speed } = request.body;
      if (typeof speed !== 'number' || speed <= 0) {
        return reply.status(400).send({ success: false, message: 'Valid speed (number > 0) is required.' });
      }
      simulationEngine.setSpeed(speed);
      reply.send({ success: true, message: `Simulation speed set to ${speed}x.` });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async triggerSimulationEvent(request, reply) {
    try {
      const { type, payload } = request.body;
      if (!type || !payload) {
        return reply.status(400).send({ success: false, message: 'Event type and payload are required.' });
      }
      eventBus.emit('simulation_event_trigger_request', { type, payload });
      reply.send({ success: true, message: `Simulation event '${type}' triggered.` });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getSimulationData(request, reply) {
    try {
      const simulationState = stateManager.getSimulationState();
      reply.send(simulationState);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { simulationController };

