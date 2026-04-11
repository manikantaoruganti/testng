// server/src/api/middlewares/errorHandler.js
// Centralized error handling for API routes.

const { logger } = require('../../utils/logger');
const { errorCodes } = require('../../utils/errorCodes');

/**
 * Generic error handler for Fastify routes.
 * @param {Error} error - The error object.
 * @param {object} request - The Fastify request object.
 * @param {object} reply - The Fastify reply object.
 */
const errorHandler = (error, request, reply) => {
  logger.error(`API Error on ${request.method} ${request.url}: ${error.message}`, {
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
  });

  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || 'Internal Server Error';
  const errorCode = error.code || errorCodes.SERVER_ERROR;

  reply.status(statusCode).send({
    success: false,
    message: errorMessage,
    code: errorCode,
  });
};

module.exports = { errorHandler };

