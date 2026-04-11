// server/src/socket/broadcaster.js
// Handles broadcasting internal system events to connected Socket.IO clients.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { connectionManager } = require('./connectionManager');

let ioInstance; // Reference to the Socket.IO server instance

class Broadcaster {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initializes the broadcaster with the Socket.IO server instance.
   * @param {object} io - The Socket.IO server instance.
   */
  init(io) {
    if (this.isInitialized) {
      logger.warn('Broadcaster already initialized.');
      return;
    }
    ioInstance = io;
    this.registerListeners();
    this.isInitialized = true;
    logger.info('Broadcaster initialized and listening for events.');
  }

  /**
   * Registers listeners for internal events that need to be broadcasted to clients.
   */
  registerListeners() {
    // Listen for crisis state updates and broadcast to all clients
    eventBus.on('crisis_state_updated', (state) => {
      this.broadcast('crisis_state_updated', state);
    });

    // Listen for simulation tick updates and broadcast to all clients
    eventBus.on('simulation_tick', (tickData) => {
      this.broadcast('simulation_tick', tickData);
    });

    // Listen for new alerts and broadcast
    eventBus.on('alert_issued', (alert) => {
      this.broadcast('new_alert', alert);
    });

    // Listen for alert resolutions
    eventBus.on('alert_resolved', (payload) => {
      this.broadcast('alert_resolved', payload);
    });

    // Listen for risk score updates
    eventBus.on('risk_score_updated', (data) => {
      this.broadcast('risk_score_updated', data);
    });

    // Listen for prediction updates
    eventBus.on('prediction_updated', (prediction) => {
      this.broadcast('prediction_updated', prediction);
    });

    // Generic broadcast event for specific needs
    eventBus.on('websocket_broadcast', ({ type, payload, room = 'all' }) => {
      if (room === 'all') {
        this.broadcast(type, payload);
      } else {
        this.broadcastToRoom(room, type, payload);
      }
    });

    // Add more event listeners as needed for other real-time data
  }

  /**
   * Broadcasts an event to all connected clients.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to send with the event.
   */
  broadcast(eventName, payload) {
    if (!ioInstance) {
      logger.error('Socket.IO instance not available for broadcasting.');
      return;
    }
    ioInstance.emit(eventName, payload);
    logger.debug(`Broadcasted event '${eventName}' to all clients.`);
  }

  /**
   * Broadcasts an event to clients in a specific room.
   * @param {string} roomName - The name of the room.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to send with the event.
   */
  broadcastToRoom(roomName, eventName, payload) {
    if (!ioInstance) {
      logger.error('Socket.IO instance not available for broadcasting to room.');
      return;
    }
    ioInstance.to(roomName).emit(eventName, payload);
    logger.debug(`Broadcasted event '${eventName}' to room '${roomName}'.`);
  }

  /**
   * Emits an event to a specific client by socket ID.
   * @param {string} socketId - The ID of the target socket.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to send with the event.
   */
  emitToClient(socketId, eventName, payload) {
    if (!ioInstance) {
      logger.error('Socket.IO instance not available for emitting to client.');
      return;
    }
    const socket = connectionManager.getConnection(socketId);
    if (socket) {
      socket.emit(eventName, payload);
      logger.debug(`Emitted event '${eventName}' to client ${socketId}.`);
    } else {
      logger.warn(`Attempted to emit to non-existent client socket: ${socketId}`);
    }
  }
}

const broadcaster = new Broadcaster();
module.exports = { broadcaster };

