// server/src/socket/socketServer.js
// Initializes and manages the Socket.IO server instance.

const { Server } = require('socket.io');
const { logger } = require('../utils/logger');
const { eventBus } = require('../events/eventBus');
const { connectionManager } = require('./connectionManager');
const { broadcaster } = require('./broadcaster');

let io; // Global Socket.IO instance

/**
 * Initializes the Socket.IO server.
 * @param {object} fastifyIo - The Socket.IO instance provided by fastify-socket.io plugin.
 */
const initSocketServer = (fastifyIo) => {
  if (io) {
    logger.warn('Socket.IO server already initialized.');
    return io;
  }

  io = fastifyIo;
  logger.info('Socket.IO server initialized.');

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    connectionManager.addConnection(socket);
    eventBus.emit('client_connected', { socketId: socket.id });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      connectionManager.removeConnection(socket.id);
      eventBus.emit('client_disconnected', { socketId: socket.id });
    });

    // Register common handlers for incoming messages from clients
    // Specific handlers are registered in socketHandlers.js
    socket.on('client_message', (data) => {
      logger.debug(`Received client_message from ${socket.id}:`, data);
      eventBus.emit('user_action', { socketId: socket.id, action: data.type, payload: data.payload });
    });
  });

  // Register the broadcaster to listen for internal events and emit to clients
  broadcaster.init(io);

  return io;
};

/**
 * Gets the initialized Socket.IO server instance.
 * @returns {Server|undefined} The Socket.IO server instance.
 */
const getSocketIoInstance = () => io;

module.exports = {
  initSocketServer,
  getSocketIoInstance,
};

