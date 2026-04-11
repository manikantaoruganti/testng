// server/src/events/handlers/evacuationHandler.js
// Handles events related to evacuation procedures.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { stateManager } = require('../../core/state');
const { routingEngine } = require('../../core/routing');
const { alertService } = require('../../services/alertService');
const { logService } = require('../../services/logService');
const { buildingGraph } = require('../../graph/building');

class EvacuationHandler {
  constructor() {
    // No specific state for the handler.
  }

  async handleEvacuationInitiated({ floorId }) {
    logger.info(`EvacuationHandler: Evacuation initiated for floor ${floorId}.`);
    await logService.createLog('event', 'Evacuation Initiated', `Evacuation procedure started for floor ${floorId}.`, 'critical', { floorId });

    // Issue a critical alert for evacuation
    await alertService.createAlert({
      title: 'Evacuation Initiated',
      message: `Evacuation procedure has been initiated for floor ${floorId}. Please follow instructions.`,
      severity: 'critical',
      locationId: floorId,
      type: 'evacuation',
    });

    // For all people on this floor, find and assign evacuation routes
    const crisisState = stateManager.getCrisisState();
    const peopleOnFloor = crisisState.peopleLocations.filter(p => p.currentFloorId === floorId);
    const currentHazards = crisisState.activeHazards;
    const blockedNodes = currentHazards.flatMap(h => h.affectedNodes);
    const blockedPaths = currentHazards.flatMap(h => h.affectedPaths);

    const newEvacuationRoutes = [];
    for (const person of peopleOnFloor) {
      try {
        const routes = await routingEngine.findAllEvacuationRoutes(person.currentLocationId, floorId, blockedNodes, blockedPaths);
        if (routes.length > 0) {
          // Select the safest/shortest route
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
          // Update person status
          eventBus.emit('person_status_updated', { personId: person.id, newStatus: 'evacuating', oldStatus: person.status, locationId: person.currentLocationId });
        } else {
          logger.warn(`EvacuationHandler: No safe route found for person ${person.id} on floor ${floorId}.`);
          await alertService.createAlert({
            title: 'Person Trapped',
            message: `No safe evacuation route found for person ${person.id} at ${person.currentLocationId}.`,
            severity: 'critical',
            locationId: person.currentLocationId,
            type: 'trapped_person',
          });
        }
      } catch (error) {
        logger.error(`EvacuationHandler: Error finding routes for person ${person.id}:`, error);
      }
    }
    stateManager.handleRouteUpdated(newEvacuationRoutes);
  }

  async handleRouteRecalculationNeeded({ affectedNodes = [], affectedPaths = [], clearedHazardId = null }) {
    logger.info(`EvacuationHandler: Route recalculation needed. Affected nodes: ${affectedNodes.length}, Affected paths: ${affectedPaths.length}, Cleared hazard: ${clearedHazardId}`);
    await logService.createLog('event', 'Route Recalculation Needed', `Due to changes in hazards/paths.`, 'info', { affectedNodes, affectedPaths, clearedHazardId });

    const crisisState = stateManager.getCrisisState();
    const currentHazards = crisisState.activeHazards;
    const currentBlockedNodes = currentHazards.flatMap(h => h.affectedNodes);
    const currentBlockedPaths = currentHazards.flatMap(h => h.affectedPaths);

    const updatedEvacuationRoutes = [];
    for (const route of crisisState.evacuationRoutes) {
      // Check if the current route is still safe
      const isStillSafe = await routingEngine.findSafestPath(route.startNodeId, route.endNodeId, currentBlockedNodes, currentBlockedPaths)
        .then(() => true)
        .catch(() => false);

      if (!isStillSafe) {
        logger.warn(`EvacuationHandler: Route ${route.id} is no longer safe. Recalculating.`);
        // Try to find a new route for the person associated with this route
        const person = crisisState.peopleLocations.find(p => p.id === route.personId);
        if (person) {
          try {
            const newRoutes = await routingEngine.findAllEvacuationRoutes(person.currentLocationId, person.currentFloorId, currentBlockedNodes, currentBlockedPaths);
            if (newRoutes.length > 0) {
              const bestNewRoute = newRoutes.sort((a, b) => a.cost - b.cost)[0];
              updatedEvacuationRoutes.push({
                ...route,
                path: bestNewRoute.path,
                cost: bestNewRoute.cost,
                isSafe: true,
                status: 'recalculated',
              });
              await logService.createLog('decision', 'Route Recalculated', `New safe route found for person ${person.id}.`, 'success', { personId: person.id, oldRoute: route.id, newRoute: bestNewRoute.path });
            } else {
              logger.critical(`EvacuationHandler: No new safe route found for person ${person.id}.`);
              await alertService.createAlert({
                title: 'Person Trapped - No New Route',
                message: `No new safe evacuation route found for person ${person.id} at ${person.currentLocationId}.`,
                severity: 'critical',
                locationId: person.currentLocationId,
                type: 'trapped_person',
              });
              // Keep the old route but mark it as unsafe
              updatedEvacuationRoutes.push({ ...route, isSafe: false, status: 'compromised' });
            }
          } catch (error) {
            logger.error(`EvacuationHandler: Error during new route finding for person ${person.id}:`, error);
            updatedEvacuationRoutes.push({ ...route, isSafe: false, status: 'compromised' });
          }
        } else {
          // If person not found, just mark route as unsafe
          updatedEvacuationRoutes.push({ ...route, isSafe: false, status: 'compromised' });
        }
      } else {
        updatedEvacuationRoutes.push(route); // Route is still safe, keep it
      }
    }
    stateManager.handleRouteUpdated(updatedEvacuationRoutes);
  }

  async handlePersonGuidanceNeeded({ personId, targetStatus }) {
    logger.info(`EvacuationHandler: Guidance needed for person ${personId}. Target status: ${targetStatus}.`);
    await logService.createLog('event', 'Person Guidance Needed', `Person ${personId} needs guidance to ${targetStatus}.`, 'info', { personId, targetStatus });

    const crisisState = stateManager.getCrisisState();
    const person = crisisState.peopleLocations.find(p => p.id === personId);
    if (person) {
      // Update person's status
      eventBus.emit('person_status_updated', { personId, newStatus: targetStatus, oldStatus: person.status, locationId: person.currentLocationId });

      // If targetStatus is 'evacuating', ensure they have a route
      if (targetStatus === 'evacuating' && !crisisState.evacuationRoutes.some(r => r.personId === personId && r.isSafe)) {
        logger.info(`EvacuationHandler: Assigning new route for person ${personId} to evacuate.`);
        const currentHazards = crisisState.activeHazards;
        const blockedNodes = currentHazards.flatMap(h => h.affectedNodes);
        const blockedPaths = currentHazards.flatMap(h => h.affectedPaths);

        try {
          const routes = await routingEngine.findAllEvacuationRoutes(person.currentLocationId, person.currentFloorId, blockedNodes, blockedPaths);
          if (routes.length > 0) {
            const bestRoute = routes.sort((a, b) => a.cost - b.cost)[0];
            const newRoute = {
              id: `route-${person.id}-${bestRoute.endNodeId}-${Date.now()}`,
              personId: person.id,
              startNodeId: person.currentLocationId,
              endNodeId: bestRoute.endNodeId,
              path: bestRoute.path,
              isSafe: true,
              cost: bestRoute.cost,
              status: 'active',
            };
            const updatedRoutes = [...crisisState.evacuationRoutes.filter(r => r.personId !== personId), newRoute];
            stateManager.handleRouteUpdated(updatedRoutes);
            await logService.createLog('decision', 'Route Assigned', `Person ${personId} assigned new evacuation route.`, 'success', { personId, route: newRoute.path });
          } else {
            logger.critical(`EvacuationHandler: No safe route found for person ${person.id} during guidance.`);
            await alertService.createAlert({
              title: 'Person Trapped - Guidance Failed',
              message: `Guidance failed: No safe route found for person ${person.id} at ${person.currentLocationId}.`,
              severity: 'critical',
              locationId: person.currentLocationId,
              type: 'trapped_person',
            });
          }
        } catch (error) {
          logger.error(`EvacuationHandler: Error assigning route for person ${person.id}:`, error);
        }
      }
    } else {
      logger.warn(`EvacuationHandler: Person ${personId} not found for guidance.`);
    }
  }
}

const evacuationHandler = new EvacuationHandler();
module.exports = evacuationHandler;

