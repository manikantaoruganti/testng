// server/src/core/routing.js
// Implements pathfinding algorithms (e.g., A*, Dijkstra) to find optimal evacuation routes.

const { buildingGraph } = require('../graph/building');
const { logger } = require('../utils/logger');

class RoutingEngine {
  constructor() {
    // No specific state, relies on buildingGraph
  }

  /**
   * Finds the safest and most efficient path between a start node and an end node
   * using a modified Dijkstra or A* algorithm.
   *
   * @param {string} startNodeId - The ID of the starting node.
   * @param {string} endNodeId - The ID of the destination node (e.g., an exit).
   * @param {string[]} blockedNodes - Array of node IDs that are currently blocked/hazardous.
   * @param {string[]} blockedPaths - Array of edge IDs that are currently blocked/hazardous.
   * @returns {Promise<{path: string[], cost: number}>} The path as an array of node IDs and its total cost.
   * @throws {Error} If no path is found.
   */
  async findSafestPath(startNodeId, endNodeId, blockedNodes = [], blockedPaths = []) {
    const graph = buildingGraph.getGraph(); // Get the current graph representation

    if (!graph.hasNode(startNodeId) || !graph.hasNode(endNodeId)) {
      throw new Error('Start or end node not found in graph.');
    }

    if (blockedNodes.includes(startNodeId)) {
      throw new Error('Start node is blocked.');
    }

    // Dijkstra's algorithm implementation
    const distances = new Map();
    const previousNodes = new Map();
    const priorityQueue = []; // Stores { nodeId, distance }

    // Initialize distances
    graph.nodes.forEach(node => {
      distances.set(node.id, Infinity);
      previousNodes.set(node.id, null);
    });
    distances.set(startNodeId, 0);
    priorityQueue.push({ nodeId: startNodeId, distance: 0 });

    while (priorityQueue.length > 0) {
      // Sort by distance to get the smallest
      priorityQueue.sort((a, b) => a.distance - b.distance);
      const { nodeId: currentNodeId, distance: currentDistance } = priorityQueue.shift();

      if (currentNodeId === endNodeId) {
        break; // Found the shortest path to the end node
      }

      if (currentDistance > distances.get(currentNodeId)) {
        continue; // Already found a shorter path
      }

      const neighbors = graph.getNeighbors(currentNodeId);
      for (const neighborId of neighbors) {
        // Check if neighbor node is blocked
        if (blockedNodes.includes(neighborId)) {
          continue;
        }

        const edge = graph.getEdge(currentNodeId, neighborId);
        if (!edge) continue; // Should not happen if getNeighbors is correct

        // Check if the edge (path) is blocked
        if (blockedPaths.includes(edge.id)) {
          continue;
        }

        // Calculate new distance
        const newDistance = currentDistance + (edge.weight || 1); // Default weight 1 if not specified

        if (newDistance < distances.get(neighborId)) {
          distances.set(neighborId, newDistance);
          previousNodes.set(neighborId, currentNodeId);
          priorityQueue.push({ nodeId: neighborId, distance: newDistance });
        }
      }
    }

    // Reconstruct path
    const path = [];
    let currentNode = endNodeId;
    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = previousNodes.get(currentNode);
    }

    if (path[0] !== startNodeId) {
      throw new Error(`No path found from ${startNodeId} to ${endNodeId}.`);
    }

    const totalCost = distances.get(endNodeId);
    if (totalCost === Infinity) {
      throw new Error(`No reachable path found from ${startNodeId} to ${endNodeId}.`);
    }

    logger.debug(`Found path from ${startNodeId} to ${endNodeId}: ${path.join(' -> ')} with cost ${totalCost}`);
    return { path, cost: totalCost };
  }

  /**
   * Finds all possible evacuation routes from a given start node to any available exit.
   * @param {string} startNodeId
   * @param {string} floorId
   * @param {string[]} blockedNodes
   * @param {string[]} blockedPaths
   * @returns {Promise<Array<{path: string[], cost: number, endNodeId: string}>>}
   */
  async findAllEvacuationRoutes(startNodeId, floorId, blockedNodes = [], blockedPaths = []) {
    const exits = buildingGraph.getExitsForFloor(floorId);
    const allRoutes = [];

    for (const exit of exits) {
      try {
        const { path, cost } = await this.findSafestPath(startNodeId, exit.id, blockedNodes, blockedPaths);
        allRoutes.push({ path, cost, endNodeId: exit.id });
      } catch (error) {
        logger.warn(`Could not find path from ${startNodeId} to exit ${exit.id}: ${error.message}`);
      }
    }
    return allRoutes;
  }
}

const routingEngine = new RoutingEngine();
module.exports = { routingEngine };

