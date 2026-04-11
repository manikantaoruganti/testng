const Fastify = require('fastify');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Core imports
const { connectDB } = require('./db/connection');
const { initSocketServer } = require('./socket/socketServer');
const { eventBus } = require('./events/eventBus');
const { orchestrator } = require('./core/orchestrator');
const { logger } = require('./utils/logger');

// Create Fastify app with pretty logger
const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
app.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register API routes
app.register(require('./api/routes/crisisRoutes'), { prefix: '/api/crisis' });
app.register(require('./api/routes/simulationRoutes'), { prefix: '/api/simulation' });
app.register(require('./api/routes/analyticsRoutes'), { prefix: '/api/analytics' });
app.register(require('./api/routes/systemRoutes'), { prefix: '/api/system' });
app.register(require('./api/routes/logRoutes'), { prefix: '/api/logs' });
app.register(require('./api/routes/configRoutes'), { prefix: '/api/config' });

// Global error handler
app.setErrorHandler((error, request, reply) => {
  logger.error(error);

  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message || 'Internal Server Error',
    code: error.code || 'SERVER_ERROR',
  });
});

// Start server function
const start = async () => {
  try {
    // Connect DB
    await connectDB();

    // Start Fastify
    await app.listen({
      port: process.env.PORT || 5000,
      host: '0.0.0.0',
    });

    logger.info(`Server listening on ${app.server.address().port}`);

    // Setup Socket.IO
    const { Server } = require('socket.io');

    const io = new Server(app.server, {
      cors: {
        origin: '*',
      },
    });

    initSocketServer(io);

    // Start core system
    orchestrator.init();

    // Emit system ready
    eventBus.emit('system_ready', {
      timestamp: Date.now(),
      message: 'CrisisOS backend is operational.',
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// ✅ IMPORTANT FIX: only run if executed directly
if (require.main === module) {
  start();
}

// Export app (safe for imports/testing)
module.exports = app;
