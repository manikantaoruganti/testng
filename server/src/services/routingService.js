// server/src/services/routingService.js
// Provides business logic for routing and pathfinding.

const { routingEngine } = require('../core/routing');
const { stateManager } = require('../core/state');
const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');

class RoutingService {
  constructor() {
    // No specific state, relies on routingEngine and stateManager.
  }

  /**
   * Finds the safest path between two nodes, considering current hazards.
   * @param {string} startNodeId - The ID of the starting node.
   * @param {string} endNodeId - The ID of the destination node.
   * @returns {Promise<{path: string[], cost: number}>} The path and its cost.
   * @throws {Error} If no path is found.
   */
  async findSafePath(startNodeId, endNodeId) {
    const { activeHazards } = stateManager.getCrisisState();
    const blockedNodes = activeHazards.flatMap(h => h.affectedNodes);
    const blockedPaths = activeHazards.flatMap(h => h.affectedPaths);

    return routingEngine.findSafestPath(startNodeId, endNodeId, blockedNodes, blockedPaths);
  }

  /**
   * Recalculates all evacuation routes for all people, considering current hazards.
   * This is typically triggered by a 'route_recalculation_needed' event.
   */
  async recalculateAllEvacuationRoutes() {
    logger.info('RoutingService: Recalculating all evacuation routes...');
    const crisisState = stateManager.getCrisisState();
    const { peopleLocations, activeHazards } = crisisState;

    const blockedNodes = activeHazards.flatMap(h => h.affectedNodes);
    const blockedPaths = activeHazards.flatMap(h => h.affectedPaths);

    const newEvacuationRoutes = [];
    for (const person of peopleLocations) {
      try {
        const routes = await routingEngine.findAllEvacuationRoutes(person.currentLocationId, person.currentFloorId, blockedNodes, blockedPaths);
        if (routes.length > 0) {
          const bestRoute = routes.sort((a, b) => a.cost - b.cost)[0];
          newEvacuationRoutes.push({
            id: `route-${person.id}-${bestRoute.endNodeId}-${Date.now()}`,
            personId: person.id,
            startNodeId: person.currentLocationId,
            endNodeId: bestRoute.endNodeId,
            path: bestRoute.path,
            isSafe: true,
            cost: bestRoute.cost,
            status: 'active',
          });
        } else {
          logger.warn(`RoutingService: No safe route found for person ${person.id}.`);
          // Emit an alert if a person is trapped
          eventBus.emit('alert_issued', {
            title: 'Person Trapped',
            message: `No safe evacuation route found for person ${person.id} at ${person.currentLocationId}.`,
            severity: 'critical',
            locationId: person.currentLocationId,
            type: 'trapped_person',
          });
        }
      } catch (error) {
        logger.error(`RoutingService: Error finding routes for person ${person.id}:`, error);
      }
    }
    stateManager.handleRouteUpdated(newEvacuationRoutes);
    eventBus.emit('route_updated', newEvacuationRoutes);
    logger.info(`RoutingService: Recalculation complete. ${newEvacuationRoutes.length} routes updated.`);
    return newEvacuationRoutes;
  }
}

const routingService = new RoutingService();
module.exports = { routingService };

