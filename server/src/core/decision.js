// server/src/core/decision.js
// The Decision Engine analyzes the current crisis state and simulation predictions
// to recommend or execute optimal actions.

const { eventBus } = require('../events/eventBus');
const { logger } = require('../utils/logger');
const { stateManager } = require('./state');
const { routingEngine } = require('./routing');
const { buildingGraph } = require('../graph/building');
const { CrisisEvent } = require('../db/schemas/eventSchema'); // For logging decisions

class DecisionEngine {
  constructor() {
    this.initListeners();
  }

  initListeners() {
    eventBus.on('crisis_state_updated', this.evaluateCrisisState.bind(this));
    eventBus.on('simulation_tick', this.evaluateSimulationState.bind(this));
  }

  /**
   * Evaluates the current real-time crisis state and makes decisions.
   * @param {object} crisisState - The current real-time crisis state.
   */
  async evaluateCrisisState(crisisState) {
    logger.debug('Decision Engine evaluating real-time crisis state...');
    const decisions = await this.makeDecisions(crisisState);
    if (decisions.length > 0) {
      logger.info(`Decision Engine proposing ${decisions.length} real-time actions.`);
      // For real-time, we might directly execute or send to an operator for approval
      for (const decision of decisions) {
        await this.executeDecision(decision, false); // false for not simulated
      }
    }
  }

  /**
   * Evaluates the simulated crisis state and makes decisions for the simulation.
   * @param {object} simulationTickData - The current simulated crisis state.
   */
  async evaluateSimulationState(simulationTickData) {
    logger.debug('Decision Engine evaluating simulated crisis state...');
    const simulatedState = {
      activeHazards: simulationTickData.hazards,
      peopleLocations: simulationTickData.people,
      evacuationRoutes: simulationTickData.routes,
      activeAlerts: simulationTickData.alerts,
      crowdDensity: simulationTickData.crowdDensity,
      // Add other relevant simulated state properties
    };
    const decisions = await this.makeDecisions(simulatedState);
    if (decisions.length > 0) {
      logger.debug(`Decision Engine proposing ${decisions.length} simulated actions.`);
      // For simulation, we return decisions to the simulation engine to apply
      // The simulation engine will then call executeDecision with isSimulated = true
      return decisions;
    }
    return [];
  }

  /**
   * Core decision-making logic based on a given state (real or simulated).
   * @param {object} state - The crisis state (real-time or simulated).
   * @returns {Promise<Array<{action: string, targetId: string, reason: string, payload?: object}>>}
   */
  async makeDecisions(state) {
    const decisions = [];
    const { activeHazards, peopleLocations, evacuationRoutes, crowdDensity } = state;

    // 1. Evaluate Hazards
    for (const hazard of activeHazards) {
      if (hazard.type === 'fire' && hazard.intensity > 5) {
        // If fire is critical, ensure evacuation is active for affected areas
        const affectedFloor = buildingGraph.getFloorOfNode(hazard.locationId);
        if (affectedFloor && !evacuationRoutes.some(r => r.startNodeId === hazard.locationId)) {
          decisions.push({
            action: 'initiate_evacuation',
            targetId: affectedFloor.id,
            reason: `Critical fire in ${hazard.locationId}`,
            payload: { floorId: affectedFloor.id },
          });
        }
      }
      // If a path is blocked by a hazard, ensure no routes use it
      if (hazard.affectedPaths && hazard.affectedPaths.length > 0) {
        for (const pathId of hazard.affectedPaths) {
          // Check if any active evacuation route still uses this path
          const compromisedRoutes = evacuationRoutes.filter(route => route.path.includes(pathId) && route.isSafe);
          if (compromisedRoutes.length > 0) {
            decisions.push({
              action: 'recalculate_routes',
              targetId: pathId,
              reason: `Path ${pathId} compromised by hazard`,
              payload: { affectedRoutes: compromisedRoutes.map(r => r.id) },
            });
          }
        }
      }
    }

    // 2. Evaluate People Locations & Safety
    for (const person of peopleLocations) {
      const personNode = buildingGraph.getNode(person.currentLocationId);
      if (!personNode) {
        logger.warn(`Person ${person.id} at unknown location ${person.currentLocationId}`);
        continue;
      }

      const isPersonInHazard = activeHazards.some(h => h.affectedNodes.includes(person.currentLocationId));
      if (isPersonInHazard && person.status !== 'evacuating') {
        decisions.push({
          action: 'guide_person',
          targetId: person.id,
          reason: `Person ${person.id} in hazard zone`,
          payload: { personId: person.id, targetStatus: 'evacuating' },
        });
      }

      // Check if person has a safe route
      const hasSafeRoute = evacuationRoutes.some(r => r.personId === person.id && r.isSafe);
      if (isPersonInHazard && !hasSafeRoute) {
        decisions.push({
          action: 'issue_alert',
          targetId: person.id,
          reason: `Person ${person.id} trapped in hazard zone`,
          payload: { type: 'critical', message: `Person ${person.id} trapped at ${person.currentLocationId}` },
        });
        decisions.push({
          action: 'deploy_assistance',
          targetId: person.id,
          reason: `Person ${person.id} trapped in hazard zone`,
          payload: { personId: person.id, locationId: person.currentLocationId },
        });
      }
    }

    // 3. Evaluate Crowd Density
    for (const locationId in crowdDensity) {
      const count = crowdDensity[locationId];
      const node = buildingGraph.getNode(locationId);
      if (node && node.capacity && count > node.capacity * 0.8) { // 80% capacity threshold
        decisions.push({
          action: 'divert_crowd',
          targetId: locationId,
          reason: `High crowd density in ${locationId}`,
          payload: { locationId, currentCount: count, threshold: node.capacity * 0.8 },
        });
      }
    }

    // 4. Evaluate System Status (e.g., sensor malfunctions)
    // This would involve checking activeAlerts for system-related issues

    return decisions;
  }

  /**
   * Executes a given decision, either in real-time or within the simulation.
   * @param {object} decision - The decision to execute.
   * @param {boolean} isSimulated - True if this decision is for the simulation.
   */
  async executeDecision(decision, isSimulated = false) {
    logger.info(`Executing decision: ${decision.action} for ${decision.targetId} (Simulated: ${isSimulated})`);

    // Log the decision
    await CrisisEvent.create({
      eventType: 'decision_executed',
      severity: 'info',
      message: `Decision: ${decision.action} for ${decision.targetId}. Reason: ${decision.reason}`,
      locationId: decision.targetId,
      payload: { ...decision, isSimulated },
    });

    switch (decision.action) {
      case 'initiate_evacuation':
        // This would trigger the routing engine to find routes for all people on the floor
        // and update their status.
        if (!isSimulated) {
          // For real-time, we'd update the actual crisis state
          eventBus.emit('evacuation_initiated', decision.payload);
        } else {
          // For simulation, the simulation engine will handle applying this
          // For now, we just log it.
        }
        break;
      case 'recalculate_routes':
        if (!isSimulated) {
          // Trigger routing engine to re-evaluate routes for affected people
          eventBus.emit('route_recalculation_needed', decision.payload);
        }
        break;
      case 'guide_person':
        if (!isSimulated) {
          // Update person's status and potentially assign a new route
          eventBus.emit('person_guidance_needed', decision.payload);
        }
        break;
      case 'issue_alert':
        if (!isSimulated) {
          eventBus.emit('alert_issued', {
            id: `alert-${Date.now()}`,
            title: 'Decision Engine Alert',
            ...decision.payload,
          });
        }
        break;
      case 'divert_crowd':
        if (!isSimulated) {
          eventBus.emit('crowd_diversion_needed', decision.payload);
        }
        break;
      case 'deploy_assistance':
        if (!isSimulated) {
          eventBus.emit('assistance_deployment_needed', decision.payload);
        }
        break;
      case 'block_path':
        // This decision would be applied by the simulation engine if isSimulated is true
        // In real-time, it might mean physically blocking a path or updating digital signage
        if (!isSimulated) {
          eventBus.emit('path_blocked', decision.payload);
        }
        break;
      default:
        logger.warn(`Unknown decision action: ${decision.action}`);
    }
  }
}

const decisionEngine = new DecisionEngine();
module.exports = { decisionEngine };

