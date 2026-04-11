// server/src/api/middlewares/requestLogger.js
// Middleware for logging incoming API requests.

const { logger } = require('../../utils/logger');

/**
 * Fastify preHandler hook for logging incoming requests.
 * @param {object} request - The Fastify request object.
 * @param {object} reply - The Fastify reply object.
 * @param {function} done - The callback to continue processing.
 */
const requestLogger = (request, reply, done) => {
  logger.info(`Incoming Request: ${request.method} ${request.url}`, {
    ip: request.ip,
    headers: request.headers,
    body: request.body, // Be cautious with logging sensitive data
  });
  done();
};

// Example of how to use:
// fastify.addHook('preHandler', requestLogger);

module.exports = { requestLogger };

