// server/src/api/controllers/analyticsController.js
// Handles API requests for analytics data.

const { analyticsService } = require('../../services/analyticsService');
const { errorHandler } = require('../middlewares/errorHandler');
const { logger } = require('../../utils/logger');

const analyticsController = {
  async getOverallAnalytics(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getOverallAnalytics(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getRiskScores(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getRiskScores(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getResponseTimes(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getResponseTimes(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getEvacuationEfficiency(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getEvacuationEfficiency(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getHazardTrends(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getHazardTrends(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },

  async getIncidentBreakdown(request, reply) {
    try {
      const filters = request.query;
      const data = await analyticsService.getIncidentBreakdown(filters);
      reply.send(data);
    } catch (error) {
      errorHandler(error, request, reply);
    }
  },
};

module.exports = { analyticsController };

