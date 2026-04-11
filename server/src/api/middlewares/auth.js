// server/src/api/middlewares/auth.js
// Authentication middleware (JWT based).

const jwt = require('jsonwebtoken');
const { logger } = require('../../utils/logger');
const { errorCodes } = require('../../utils/errorCodes');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret from .env

const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(errorCodes.AUTH_MISSING_TOKEN);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user information to the request
    request.user = decoded;
  } catch (error) {
    logger.warn('Authentication failed:', error.message);
    if (error.name === 'JsonWebTokenError') {
      reply.status(401).send({ success: false, message: 'Invalid token', code: errorCodes.AUTH_INVALID_TOKEN });
    } else if (error.name === 'TokenExpiredError') {
      reply.status(401).send({ success: false, message: 'Token expired', code: errorCodes.AUTH_TOKEN_EXPIRED });
    } else if (error.message === errorCodes.AUTH_MISSING_TOKEN) {
      reply.status(401).send({ success: false, message: 'Authorization token missing', code: errorCodes.AUTH_MISSING_TOKEN });
    } else {
      reply.status(401).send({ success: false, message: 'Authentication failed', code: errorCodes.AUTH_FAILED });
    }
    throw new Error('Authentication failed'); // Stop further processing
  }
};

// Example of how to use:
// fastify.addHook('preHandler', authMiddleware); // Apply to all routes
// fastify.get('/protected', { preHandler: authMiddleware }, async (request, reply) => { ... }); // Apply to specific route

module.exports = { authMiddleware };

