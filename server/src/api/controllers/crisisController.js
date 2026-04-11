// server/src/api/controllers/crisisController.js
// Handles API requests related to real-time crisis data.

const { stateManager } = require('../../core/state');
const { eventBus } = require('../../events/eventBus');
const { logger } = require('../../utils/logger');
const { alertService } = require('../../services/alertService');
const { errorHandler } = require('../middlewares/errorHandler');

const crisisController = {
  async getCurrentCrisisState(request, reply) {
    try {
      const state = stateManager.getCrisisState();
      reply.send(state);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getActiveHazards(request, reply) {
    try {
      const { activeHazards } = stateManager.getCrisisState();
      reply.send(activeHazards);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getPeopleLocations(request, reply) {
    try {
      const { peopleLocations } = stateManager.getCrisisState();
      reply.send(peopleLocations);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getEvacuationRoutes(request, reply) {
    try {
      const { evacuationRoutes } = stateManager.getCrisisState();
      reply.send(evacuationRoutes);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getActiveAlerts(request, reply) {
    try {
      const { activeAlerts } = stateManager.getCrisisState();
      reply.send(activeAlerts);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getCrowdDensity(request, reply) {
    try {
      const { crowdDensity } = stateManager.getCrisisState();
      reply.send(crowdDensity);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async triggerCrisisEvent(request, reply) {
    try {
      const { type, payload } = request.body;
      if (!type || !payload) {
        return reply.status(400).send({ success: false, message: 'Event type and payload are required.' });
      }
      eventBus.emit(type, payload); // Emit the event to the system
      reply.send({ success: true, message: `Event '${type}' triggered successfully.` });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async resolveAlert(request, reply) {
    try {
      const { id } = request.params;
      const resolvedAlert = await alertService.resolveAlert(id);
      if (!resolvedAlert) {
        return reply.status(404).send({ success: false, message: 'Alert not found.' });
      }
      reply.send({ success: true, message: `Alert ${id} resolved.`, alert: resolvedAlert });
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { crisisController };

