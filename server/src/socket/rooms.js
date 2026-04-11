// server/src/socket/rooms.js
// Manages Socket.IO rooms for targeted communication.

const { getSocketIoInstance } = require('./socketServer');
const { logger } = require('../utils/logger');

class RoomManager {
  constructor() {
    // No internal state needed, relies on Socket.IO's room management.
  }

  /**
   * Joins a socket to a specified room.
   * @param {string} socketId - The ID of the socket.
   * @param {string} roomName - The name of the room to join.
   */
  joinRoom(socketId, roomName) {
    const io = getSocketIoInstance();
    if (!io) {
      logger.error('Socket.IO instance not available. Cannot join room.');
      return;
    }
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(roomName);
      logger.info(`Socket ${socketId} joined room '${roomName}'.`);
    } else {
      logger.warn(`Socket ${socketId} not found. Cannot join room '${roomName}'.`);
    }
  }

  /**
   * Leaves a socket from a specified room.
   * @param {string} socketId - The ID of the socket.
   * @param {string} roomName - The name of the room to leave.
   */
  leaveRoom(socketId, roomName) {
    const io = getSocketIoInstance();
    if (!io) {
      logger.error('Socket.IO instance not available. Cannot leave room.');
      return;
    }
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(roomName);
      logger.info(`Socket ${socketId} left room '${roomName}'.`);
    } else {
      logger.warn(`Socket ${socketId} not found. Cannot leave room '${roomName}'.`);
    }
  }

  /**
   * Gets a list of all sockets in a given room.
   * @param {string} roomName - The name of the room.
   * @returns {Promise<Set<string>>} A Set of socket IDs in the room.
   */
  async getSocketsInRoom(roomName) {
    const io = getSocketIoInstance();
    if (!io) {
      logger.error('Socket.IO instance not available. Cannot get sockets in room.');
      return new Set();
    }
    return io.in(roomName).allSockets();
  }

  /**
   * Checks if a socket is in a specific room.
   * @param {string} socketId - The ID of the socket.
   * @param {string} roomName - The name of the room.
   * @returns {boolean} True if the socket is in the room, false otherwise.
   */
  isSocketInRoom(socketId, roomName) {
    const io = getSocketIoInstance();
    if (!io) {
      logger.error('Socket.IO instance not available. Cannot check room membership.');
      return false;
    }
    const socket = io.sockets.sockets.get(socketId);
    return socket ? socket.rooms.has(roomName) : false;
  }
}

const roomManager = new RoomManager();
module.exports = { roomManager };

