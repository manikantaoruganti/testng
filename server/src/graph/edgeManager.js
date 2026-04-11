// server/src/graph/edgeManager.js
// Provides utilities for managing edges (paths) within the building graph.

const { buildingGraph } = require('./building');
const { graphBuilder } = require('./graphBuilder');
const { logger } = require('../utils/logger');

class EdgeManager {
  constructor() {
    // This class primarily wraps buildingGraph and graphBuilder for edge-specific operations.
  }

  /**
   * Retrieves an edge by its ID.
   * @param {string} edgeId - The ID of the edge.
   * @returns {object|undefined} The edge object, or undefined if not found.
   */
  getEdge(edgeId) {
    return buildingGraph.graph.edges.get(edgeId);
  }

  /**
   * Retrieves all edges in the graph.
   * @returns {Array<object>} An array of all edge objects.
   */
  getAllEdges() {
    return Array.from(buildingGraph.graph.edges.values());
  }

  /**
   * Adds a new edge to the graph.
   * @param {object} edgeData - Data for the new edge.
   * @returns {boolean} True if added successfully, false otherwise.
   */
  createEdge(edgeData) {
    // Ensure required fields are present
    if (!edgeData.id || !edgeData.from || !edgeData.to || !edgeData.floorId) {
      logger.error('Cannot create edge: Missing required fields (id, from, to, floorId).', edgeData);
      return false;
    }
    return graphBuilder.addEdge(edgeData);
  }

  /**
   * Updates an existing edge.
   * @param {string} edgeId - The ID of the edge to update.
   * @param {object} updates - An object with properties to update.
   * @returns {boolean} True if updated successfully, false otherwise.
   */
  updateEdge(edgeId, updates) {
    return graphBuilder.updateEdge(edgeId, updates);
  }

  /**
   * Deletes an edge.
   * @param {string} edgeId - The ID of the edge to delete.
   * @returns {boolean} True if deleted successfully, false otherwise.
   */
  deleteEdge(edgeId) {
    return graphBuilder.removeEdge(edgeId);
  }

  /**
   * Checks if an edge exists.
   * @param {string} edgeId - The ID of the edge.
   * @returns {boolean} True if the edge exists, false otherwise.
   */
  edgeExists(edgeId) {
    return buildingGraph.graph.edges.has(edgeId);
  }

  /**
   * Gets all edges for a specific floor.
   * @param {string} floorId - The ID of the floor.
   * @returns {Array<object>} An array of edge objects on that floor.
   */
  getEdgesByFloor(floorId) {
    return Array.from(buildingGraph.graph.edges.values()).filter(edge => edge.floorId === floorId);
  }

  /**
   * Gets all edges connected to a specific node.
   * @param {string} nodeId - The ID of the node.
   * @returns {Array<object>} An array of edge objects connected to the node.
   */
  getEdgesConnectedToNode(nodeId) {
    return Array.from(buildingGraph.graph.edges.values()).filter(edge =>
      edge.from === nodeId || edge.to === nodeId
    );
  }
}

const edgeManager = new EdgeManager();
module.exports = { edgeManager };

