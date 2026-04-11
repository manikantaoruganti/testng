// server/src/graph/nodeManager.js
// Provides utilities for managing nodes within the building graph.

const { buildingGraph } = require('./building');
const { graphBuilder } = require('./graphBuilder');
const { logger } = require('../utils/logger');

class NodeManager {
  constructor() {
    // This class primarily wraps buildingGraph and graphBuilder for node-specific operations.
  }

  /**
   * Retrieves a node by its ID.
   * @param {string} nodeId - The ID of the node.
   * @returns {object|undefined} The node object, or undefined if not found.
   */
  getNode(nodeId) {
    return buildingGraph.getNode(nodeId);
  }

  /**
   * Retrieves all nodes in the graph.
   * @returns {Array<object>} An array of all node objects.
   */
  getAllNodes() {
    return Array.from(buildingGraph.graph.nodes.values());
  }

  /**
   * Adds a new node to the graph.
   * @param {object} nodeData - Data for the new node.
   * @returns {boolean} True if added successfully, false otherwise.
   */
  createNode(nodeData) {
    // Ensure required fields are present
    if (!nodeData.id || !nodeData.type || !nodeData.floorId) {
      logger.error('Cannot create node: Missing required fields (id, type, floorId).', nodeData);
      return false;
    }
    return graphBuilder.addNode(nodeData);
  }

  /**
   * Updates an existing node.
   * @param {string} nodeId - The ID of the node to update.
   * @param {object} updates - An object with properties to update.
   * @returns {boolean} True if updated successfully, false otherwise.
   */
  updateNode(nodeId, updates) {
    return graphBuilder.updateNode(nodeId, updates);
  }

  /**
   * Deletes a node and its associated edges.
   * @param {string} nodeId - The ID of the node to delete.
   * @returns {boolean} True if deleted successfully, false otherwise.
   */
  deleteNode(nodeId) {
    return graphBuilder.removeNode(nodeId);
  }

  /**
   * Checks if a node exists.
   * @param {string} nodeId - The ID of the node.
   * @returns {boolean} True if the node exists, false otherwise.
   */
  nodeExists(nodeId) {
    return buildingGraph.graph.nodes.has(nodeId);
  }

  /**
   * Gets all nodes for a specific floor.
   * @param {string} floorId - The ID of the floor.
   * @returns {Array<object>} An array of node objects on that floor.
   */
  getNodesByFloor(floorId) {
    return Array.from(buildingGraph.graph.nodes.values()).filter(node => node.floorId === floorId);
  }

  /**
   * Gets all nodes of a specific type (e.g., 'exit', 'room').
   * @param {string} type - The type of node.
   * @returns {Array<object>} An array of node objects of that type.
   */
  getNodesByType(type) {
    return Array.from(buildingGraph.graph.nodes.values()).filter(node => node.type === type);
  }
}

const nodeManager = new NodeManager();
module.exports = { nodeManager };

