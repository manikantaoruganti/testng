// server/src/graph/zoneMapper.js
// Manages dynamic zones within the building (e.g., smoke zones, safe zones).

const { buildingGraph } = require('./building');
const { logger } = require('../utils/logger');

class ZoneMapper {
  constructor() {
    this.activeZones = new Map(); // Map<zoneId, { type: 'smoke', affectedNodes: [], severity: 0-10 }>
  }

  /**
   * Creates or updates a dynamic zone.
   * @param {string} zoneId - Unique ID for the zone.
   * @param {string} type - Type of zone (e.g., 'smoke', 'clear', 'hazard').
   * @param {string[]} initialNodes - Array of node IDs initially affected by the zone.
   * @param {object} properties - Additional properties for the zone (e.g., severity, spreadRate).
   */
  createOrUpdateZone(zoneId, type, initialNodes, properties = {}) {
    const existingZone = this.activeZones.get(zoneId);
    if (existingZone) {
      // Update existing zone
      existingZone.type = type;
      existingZone.affectedNodes = Array.from(new Set([...existingZone.affectedNodes, ...initialNodes]));
      Object.assign(existingZone, properties);
      logger.debug(`Zone ${zoneId} updated. Type: ${type}, Affected Nodes: ${existingZone.affectedNodes.length}`);
    } else {
      // Create new zone
      const newZone = {
        id: zoneId,
        type,
        affectedNodes: Array.from(new Set(initialNodes)),
        timestamp: Date.now(),
        ...properties,
      };
      this.activeZones.set(zoneId, newZone);
      logger.info(`Zone ${zoneId} created. Type: ${type}, Affected Nodes: ${newZone.affectedNodes.length}`);
    }
    return this.activeZones.get(zoneId);
  }

  /**
   * Expands a zone based on its properties (e.g., spreadRate for smoke).
   * @param {string} zoneId - The ID of the zone to expand.
   * @returns {object|null} The updated zone, or null if not found.
   */
  expandZone(zoneId) {
    const zone = this.activeZones.get(zoneId);
    if (!zone || !zone.spreadRate || zone.spreadRate <= 0) {
      return null;
    }

    const newAffectedNodes = new Set(zone.affectedNodes);
    let changed = false;

    zone.affectedNodes.forEach(nodeId => {
      const neighbors = buildingGraph.getNeighbors(nodeId);
      neighbors.forEach(neighborId => {
        if (!newAffectedNodes.has(neighborId) && Math.random() < zone.spreadRate) {
          newAffectedNodes.add(neighborId);
          changed = true;
        }
      });
    });

    if (changed) {
      zone.affectedNodes = Array.from(newAffectedNodes);
      logger.debug(`Zone ${zoneId} expanded. New affected nodes count: ${zone.affectedNodes.length}`);
      return zone;
    }
    return null; // No change
  }

  /**
   * Dissipates a zone (e.g., smoke clearing).
   * @param {string} zoneId - The ID of the zone to dissipate.
   * @returns {object|null} The updated zone, or null if dissipated.
   */
  dissipateZone(zoneId) {
    const zone = this.activeZones.get(zoneId);
    if (!zone || !zone.dissipationRate || zone.dissipationRate <= 0) {
      return null;
    }

    if (zone.affectedNodes.length === 0) {
      this.removeZone(zoneId);
      return null;
    }

    const remainingNodes = [];
    let changed = false;

    zone.affectedNodes.forEach(nodeId => {
      if (Math.random() > zone.dissipationRate) { // Chance to remain
        remainingNodes.push(nodeId);
      } else {
        changed = true;
      }
    });

    if (changed) {
      zone.affectedNodes = remainingNodes;
      logger.debug(`Zone ${zoneId} dissipated. Remaining affected nodes count: ${zone.affectedNodes.length}`);
      if (zone.affectedNodes.length === 0) {
        this.removeZone(zoneId);
        return null;
      }
      return zone;
    }
    return null; // No change
  }

  /**
   * Removes a zone.
   * @param {string} zoneId - The ID of the zone to remove.
   * @returns {boolean} True if removed, false if not found.
   */
  removeZone(zoneId) {
    if (this.activeZones.has(zoneId)) {
      this.activeZones.delete(zoneId);
      logger.info(`Zone ${zoneId} removed.`);
      return true;
    }
    logger.warn(`Attempted to remove non-existent zone: ${zoneId}`);
    return false;
  }

  /**
   * Gets a zone by its ID.
   * @param {string} zoneId - The ID of the zone.
   * @returns {object|undefined} The zone object.
   */
  getZone(zoneId) {
    return this.activeZones.get(zoneId);
  }

  /**
   * Gets all active zones.
   * @returns {Array<object>} An array of all active zone objects.
   */
  getAllZones() {
    return Array.from(this.activeZones.values());
  }

  /**
   * Checks if a node is within any active zone of a specific type.
   * @param {string} nodeId - The ID of the node.
   * @param {string} type - The type of zone to check (optional).
   * @returns {boolean} True if the node is in an active zone, false otherwise.
   */
  isNodeInZone(nodeId, type = null) {
    for (const zone of this.activeZones.values()) {
      if ((!type || zone.type === type) && zone.affectedNodes.includes(nodeId)) {
        return true;
      }
    }
    return false;
  }
}

const zoneMapper = new ZoneMapper();
module.exports = { zoneMapper };

