// server/src/graph/graphBuilder.js
// Utility for dynamically building or modifying the graph (e.g., adding temporary nodes/edges).

const { buildingGraph } = require('./building');
const { logger } = require('../utils/logger');

class GraphBuilder {
  constructor() {
    // This class primarily interacts with the existing buildingGraph instance.
  }

  /**
   * Adds a new node to the graph.
   * @param {object} node - The node object to add (e.g., { id, type, x, y, width, height, label, floorId }).
   */
  addNode(node) {
    if (buildingGraph.graph.nodes.has(node.id)) {
      logger.warn(`Node with ID ${node.id} already exists.`);
      return false;
    }
    buildingGraph.graph.nodes.set(node.id, node);
    buildingGraph.graph.adj.set(node.id, new Set());
    buildingGraph.graph.nodeToFloorMap.set(node.id, node.floorId);
    logger.info(`Node ${node.id} added to graph.`);
    return true;
  }

  /**
   * Removes a node from the graph and all associated edges.
   * @param {string} nodeId - The ID of the node to remove.
   */
  removeNode(nodeId) {
    if (!buildingGraph.graph.nodes.has(nodeId)) {
      logger.warn(`Node with ID ${nodeId} not found.`);
      return false;
    }

    buildingGraph.graph.nodes.delete(nodeId);
    buildingGraph.graph.adj.delete(nodeId);
    buildingGraph.graph.nodeToFloorMap.delete(nodeId);

    // Remove all edges connected to this node
    buildingGraph.graph.edges.forEach((edge, edgeId) => {
      if (edge.from === nodeId || edge.to === nodeId) {
        buildingGraph.graph.edges.delete(edgeId);
      }
    });

    // Remove from adjacency lists of other nodes
    buildingGraph.graph.adj.forEach(neighbors => {
      neighbors.delete(nodeId);
    });

    logger.info(`Node ${nodeId} and its associated edges removed from graph.`);
    return true;
  }

  /**
   * Adds a new edge to the graph.
   * @param {object} edge - The edge object to add (e.g., { id, from, to, length, bidirectional, weight, floorId }).
   */
  addEdge(edge) {
    if (buildingGraph.graph.edges.has(edge.id)) {
      logger.warn(`Edge with ID ${edge.id} already exists.`);
      return false;
    }
    if (!buildingGraph.graph.nodes.has(edge.from) || !buildingGraph.graph.nodes.has(edge.to)) {
      logger.error(`Cannot add edge ${edge.id}: 'from' or 'to' node not found.`);
      return false;
    }

    buildingGraph.graph.edges.set(edge.id, edge);
    buildingGraph.addEdgeToAdjacencyList(edge.from, edge.to);
    if (edge.bidirectional) {
      buildingGraph.addEdgeToAdjacencyList(edge.to, edge.from);
    }
    logger.info(`Edge ${edge.id} added to graph.`);
    return true;
  }

  /**
   * Removes an edge from the graph.
   * @param {string} edgeId - The ID of the edge to remove.
   */
  removeEdge(edgeId) {
    const edge = buildingGraph.graph.edges.get(edgeId);
    if (!edge) {
      logger.warn(`Edge with ID ${edgeId} not found.`);
      return false;
    }

    buildingGraph.graph.edges.delete(edgeId);

    // Remove from adjacency lists
    if (buildingGraph.graph.adj.has(edge.from)) {
      buildingGraph.graph.adj.get(edge.from).delete(edge.to);
    }
    if (edge.bidirectional && buildingGraph.graph.adj.has(edge.to)) {
      buildingGraph.graph.adj.get(edge.to).delete(edge.from);
    }

    logger.info(`Edge ${edgeId} removed from graph.`);
    return true;
  }

  /**
   * Updates an existing node's properties.
   * @param {string} nodeId - The ID of the node to update.
   * @param {object} updates - An object containing properties to update.
   */
  updateNode(nodeId, updates) {
    const node = buildingGraph.graph.nodes.get(nodeId);
    if (!node) {
      logger.warn(`Node with ID ${nodeId} not found for update.`);
      return false;
    }
    buildingGraph.graph.nodes.set(nodeId, { ...node, ...updates });
    logger.info(`Node ${nodeId} updated.`);
    return true;
  }

  /**
   * Updates an existing edge's properties.
   * @param {string} edgeId - The ID of the edge to update.
   * @param {object} updates - An object containing properties to update.
   */
  updateEdge(edgeId, updates) {
    const edge = buildingGraph.graph.edges.get(edgeId);
    if (!edge) {
      logger.warn(`Edge with ID ${edgeId} not found for update.`);
      return false;
    }
    buildingGraph.graph.edges.set(edgeId, { ...edge, ...updates });
    logger.info(`Edge ${edgeId} updated.`);
    return true;
  }
}

const graphBuilder = new GraphBuilder();
module.exports = { graphBuilder };
