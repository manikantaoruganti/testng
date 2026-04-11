// server/src/socket/connectionManager.js
// Manages active Socket.IO client connections.

const { logger } = require('../utils/logger');

class ConnectionManager {
  constructor() {
    this.activeConnections = new Map(); // Map<socketId, socketObject>
    logger.info('ConnectionManager initialized.');
  }

  /**
   * Adds a new socket connection to the manager.
   * @param {object} socket - The Socket.IO socket object.
   */
  addConnection(socket) {
    this.activeConnections.set(socket.id, socket);
    logger.debug(`Connection added: ${socket.id}. Total active connections: ${this.activeconnections.size}`);
  }

  /**
   * Removes a socket connection from the manager.
   * @param {string} socketId - The ID of the socket to remove.
   */
  removeConnection(socketId) {
    if (this.activeConnections.delete(socketId)) {
      logger.debug(`Connection removed: ${socketId}. Total active connections: ${this.activeConnections.size}`);
    } else {
      logger.warn(`Attempted to remove non-existent connection: ${socketId}`);
    }
  }

  /**
   * Gets a specific socket connection by its ID.
   * @param {string} socketId - The ID of the socket.
   * @returns {object|undefined} The Socket.IO socket object, or undefined if not found.
   */
  getConnection(socketId) {
    return this.activeConnections.get(socketId);
  }

  /**
   * Gets all active socket connections.
   * @returns {Map<string, object>} A Map of all active socket connections.
   */
  getAllConnections() {
    return this.activeConnections;
  }

  /**
   * Gets the number of active connections.
   * @returns {number} The count of active connections.
   */
  getConnectionCount() {
    return this.activeConnections.size;
  }
}

const connectionManager = new ConnectionManager();
module.exports = { connectionManager };

