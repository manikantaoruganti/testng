// server/src/graph/building.js
// Manages the building's digital twin graph structure.

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class BuildingGraph {
  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adj: new Map(),
      floorMap: new Map(),
      nodeToFloorMap: new Map(),
    };
    this.buildingData = null;
  }

  async loadBuildingData() {
    logger.info('Loading building data from building.json...');

    // Possible paths to check
    const possiblePaths = [
      path.resolve(__dirname, './building.json'),                  // server folder
      path.resolve(__dirname, '../../client/public/building.json') // client folder
    ];

    let fileFound = false;
    let data;

    for (const filePath of possiblePaths) {
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        data = JSON.parse(raw);
        logger.info(`Loaded building.json from: ${filePath}`);
        fileFound = true;
        break;
      } catch (err) {
        logger.warn(`Could not load building.json from: ${filePath}`);
      }
    }

    if (!fileFound) {
      logger.error('Failed to find building.json in server or client folders.');
      throw new Error('Failed to load building data for graph construction.');
    }

    // Assign and build graph
    this.buildingData = data;
    this.buildGraph(this.buildingData);
    logger.info('Building graph successfully constructed.');
  }

  buildGraph(data) {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adj: new Map(),
      floorMap: new Map(),
      nodeToFloorMap: new Map(),
    };

    data.floors.forEach(floor => {
      this.graph.floorMap.set(floor.id, floor);

      floor.nodes.forEach(node => {
        this.graph.nodes.set(node.id, { ...node, floorId: floor.id });
        this.graph.adj.set(node.id, new Set());
        this.graph.nodeToFloorMap.set(node.id, floor.id);
      });

      floor.edges.forEach(edge => {
        this.graph.edges.set(edge.id, { ...edge, floorId: floor.id });
        this.addEdgeToAdjacencyList(edge.from, edge.to);
        if (edge.bidirectional) {
          this.addEdgeToAdjacencyList(edge.to, edge.from);
        }
      });
    });
  }

  addEdgeToAdjacencyList(fromNodeId, toNodeId) {
    if (this.graph.adj.has(fromNodeId)) {
      this.graph.adj.get(fromNodeId).add(toNodeId);
    } else {
      this.graph.adj.set(fromNodeId, new Set([toNodeId]));
    }
  }

  getGraph() {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values()),
      getNeighbors: this.getNeighbors.bind(this),
      getNode: this.getNode.bind(this),
      getEdge: this.getEdge.bind(this),
      hasNode: (nodeId) => this.graph.nodes.has(nodeId),
    };
  }

  getNode(nodeId) {
    return this.graph.nodes.get(nodeId);
  }

  getEdge(fromNodeId, toNodeId) {
    for (const edge of this.graph.edges.values()) {
      if ((edge.from === fromNodeId && edge.to === toNodeId) ||
          (edge.bidirectional && edge.from === toNodeId && edge.to === fromNodeId)) {
        return edge;
      }
    }
    return null;
  }

  getNeighbors(nodeId) {
    return Array.from(this.graph.adj.get(nodeId) || []);
  }

  getFloor(floorId) {
    return this.graph.floorMap.get(floorId);
  }

  getFloorOfNode(nodeId) {
    const floorId = this.graph.nodeToFloorMap.get(nodeId);
    return floorId ? this.graph.floorMap.get(floorId) : null;
  }

  getExitsForFloor(floorId) {
    return Array.from(this.graph.nodes.values()).filter(node =>
      node.floorId === floorId && node.type === 'exit'
    );
  }

  getPathsAffectedByNodes(nodeIds) {
    const affectedPaths = new Set();
    for (const nodeId of nodeIds) {
      for (const edge of this.graph.edges.values()) {
        if (edge.from === nodeId || edge.to === nodeId) {
          affectedPaths.add(edge.id);
        }
      }
    }
    return Array.from(affectedPaths);
  }
}

const buildingGraph = new BuildingGraph();
module.exports = { buildingGraph };