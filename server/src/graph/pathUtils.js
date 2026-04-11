// server/src/graph/pathUtils.js
// Provides utility functions for path manipulation and analysis.

const { buildingGraph } = require('./building');
const { logger } = require('../utils/logger');

class PathUtils {
  constructor() {
    // This class provides static utility methods.
  }

  /**
   * Calculates the total cost (e.g., length, time) of a given path.
   * @param {string[]} nodePath - An array of node IDs representing the path.
   * @returns {number} The total cost of the path.
   */
  static calculatePathCost(nodePath) {
    if (!nodePath || nodePath.length < 2) {
      return 0;
    }

    let totalCost = 0;
    for (let i = 0; i < nodePath.length - 1; i++) {
      const fromNodeId = nodePath[i];
      const toNodeId = nodePath[i + 1];
      const edge = buildingGraph.getEdge(fromNodeId, toNodeId);
      if (edge) {
        totalCost += (edge.weight || edge.length || 1); // Use weight, then length, then default 1
      } else {
        logger.warn(`Edge not found between ${fromNodeId} and ${toNodeId} in path cost calculation.`);
        totalCost += 100; // Penalize missing edges heavily
      }
    }
    return totalCost;
  }

  /**
   * Converts a path of node IDs into a path of edge IDs.
   * @param {string[]} nodePath - An array of node IDs.
   * @returns {string[]} An array of edge IDs.
   */
  static convertNodePathToEdgePath(nodePath) {
    if (!nodePath || nodePath.length < 2) {
      return [];
    }

    const edgePath = [];
    for (let i = 0; i < nodePath.length - 1; i++) {
      const fromNodeId = nodePath[i];
      const toNodeId = nodePath[i + 1];
      const edge = buildingGraph.getEdge(fromNodeId, toNodeId);
      if (edge) {
        edgePath.push(edge.id);
      } else {
        logger.warn(`Edge not found between ${fromNodeId} and ${toNodeId} during path conversion.`);
      }
    }
    return edgePath;
  }

  /**
   * Checks if a path is safe given current hazards.
   * @param {string[]} nodePath - An array of node IDs.
   * @param {string[]} blockedNodes - Array of node IDs that are currently blocked/hazardous.
   * @param {string[]} blockedPaths - Array of edge IDs that are currently blocked/hazardous.
   * @returns {boolean} True if the path is safe, false otherwise.
   */
  static isPathSafe(nodePath, blockedNodes = [], blockedPaths = []) {
    // Check if any node in the path is blocked
    for (const nodeId of nodePath) {
      if (blockedNodes.includes(nodeId)) {
        return false;
      }
    }

    // Check if any edge in the path is blocked
    const edgePath = PathUtils.convertNodePathToEdgePath(nodePath);
    for (const edgeId of edgePath) {
      if (blockedPaths.includes(edgeId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Finds the shortest path between two nodes using Breadth-First Search (BFS).
   * This is a simpler alternative to Dijkstra/A* if only unweighted shortest path is needed.
   * @param {string} startNodeId
   * @param {string} endNodeId
   * @param {string[]} blockedNodes
   * @param {string[]} blockedPaths
   * @returns {string[]|null} The shortest path as an array of node IDs, or null if no path.
   */
  static findShortestPathBFS(startNodeId, endNodeId, blockedNodes = [], blockedPaths = []) {
    const queue = [[startNodeId]]; // Queue of paths
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
      const currentPath = queue.shift();
      const currentNodeId = currentPath[currentPath.length - 1];

      if (currentNodeId === endNodeId) {
        return currentPath;
      }

      const neighbors = buildingGraph.getNeighbors(currentNodeId);
      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;

        // Check if neighbor node is blocked
        if (blockedNodes.includes(neighborId)) continue;

        const edge = buildingGraph.getEdge(currentNodeId, neighborId);
        if (!edge) continue;

        // Check if the edge is blocked
        if (blockedPaths.includes(edge.id)) continue;

        visited.add(neighborId);
        queue.push([...currentPath, neighborId]);
      }
    }
    return null; // No path found
  }
}

module.exports = { PathUtils };

