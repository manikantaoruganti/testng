// server/src/socket/socketHandlers.js
// Registers specific Socket.IO event handlers for incoming client messages.

const { getSocketIoInstance } = require('./socketServer');
const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { simulationEngine } = require('../core/simulation'); // To interact with simulation core

/**
 * Initializes all Socket.IO event handlers.
 * This function should be called once after the Socket.IO server is initialized.
 */
const initSocketHandlers = () => {
  const io = getSocketIoInstance();
  if (!io) {
    logger.error('Socket.IO instance not available. Cannot initialize socket handlers.');
    return;
  }

  io.on('connection', (socket) => {
    logger.debug(`Registering specific handlers for new socket: ${socket.id}`);

    // --- Simulation Control Handlers ---
    socket.on('simulation:start', async (payload) => {
      logger.info(`Socket ${socket.id}: Request to start simulation for scenario ${payload.scenarioId}`);
      try {
        await simulationEngine.start(payload.scenarioId);
        socket.emit('simulation:status', { success: true, message: 'Simulation started.' });
      } catch (error) {
        logger.error(`Error starting simulation: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    socket.on('simulation:pause', async () => {
      logger.info(`Socket ${socket.id}: Request to pause simulation.`);
      try {
        await simulationEngine.pause();
        socket.emit('simulation:status', { success: true, message: 'Simulation paused.' });
      } catch (error) {
        logger.error(`Error pausing simulation: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    socket.on('simulation:resume', async () => {
      logger.info(`Socket ${socket.id}: Request to resume simulation.`);
      try {
        await simulationEngine.resume();
        socket.emit('simulation:status', { success: true, message: 'Simulation resumed.' });
      } catch (error) {
        logger.error(`Error resuming simulation: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    socket.on('simulation:reset', async () => {
      logger.info(`Socket ${socket.id}: Request to reset simulation.`);
      try {
        await simulationEngine.reset();
        socket.emit('simulation:status', { success: true, message: 'Simulation reset.' });
      } catch (error) {
        logger.error(`Error resetting simulation: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    socket.on('simulation:set_speed', async (payload) => {
      logger.info(`Socket ${socket.id}: Request to set simulation speed to ${payload.speed}x.`);
      try {
        simulationEngine.setSpeed(payload.speed);
        socket.emit('simulation:status', { success: true, message: `Simulation speed set to ${payload.speed}x.` });
      } catch (error) {
        logger.error(`Error setting simulation speed: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    socket.on('simulation:trigger_event', async (payload) => {
      logger.info(`Socket ${socket.id}: Request to trigger event: ${payload.type} at ${payload.locationId}`);
      try {
        await simulationEngine.triggerEvent(payload);
        socket.emit('simulation:status', { success: true, message: `Event ${payload.type} triggered.` });
      } catch (error) {
        logger.error(`Error triggering event: ${error.message}`);
        socket.emit('simulation:status', { success: false, message: error.message });
      }
    });

    // --- Other potential client-server interactions ---
    socket.on('client:request_initial_state', () => {
      // When a client connects, send them the current crisis state
      const { stateManager } = require('../core/state');
      const crisisState = stateManager.getCrisisState();
      socket.emit('crisis_state_updated', crisisState);
      logger.debug(`Sent initial crisis state to new client ${socket.id}`);
    });

    // Add more handlers as needed for specific client-server interactions
  });
};

module.exports = {
  initSocketHandlers,
};

