// server/src/events/handlers/sensorHandler.js
// Handles raw sensor data input and translates it into actionable crisis events.

const { eventBus } = require('../eventBus');
const { logger } = require('../../utils/logger');
const { stateManager } = require('../../core/state');
const { logService } = require('../../services/logService');

class SensorHandler {
  constructor() {
    // No specific state for the handler.
  }

  async handleSensorDataReceived(sensorData) {
    logger.debug(`SensorHandler: Received sensor data from ${sensorData.sensorId}. Type: ${sensorData.type}`);
    await logService.createLog('event', 'Sensor Data Received', `Sensor ${sensorData.sensorId} reported data.`, 'debug', sensorData);

    switch (sensorData.type) {
      case 'temperature':
        this.processTemperatureSensor(sensorData);
        break;
      case 'smoke':
        this.processSmokeSensor(sensorData);
        break;
      case 'motion':
        this.processMotionSensor(sensorData);
        break;
      case 'occupancy':
        this.processOccupancySensor(sensorData);
        break;
      // Add other sensor types
      default:
        logger.warn(`SensorHandler: Unknown sensor type received: ${sensorData.type}`);
    }
  }

  async processTemperatureSensor(data) {
    const { sensorId, locationId, value } = data;
    logger.debug(`Temperature sensor ${sensorId} at ${locationId}: ${value}°C`);

    // Example: If temperature exceeds a threshold, detect fire hazard
    const FIRE_THRESHOLD = 60; // degrees Celsius
    if (value > FIRE_THRESHOLD) {
      const existingHazard = stateManager.getCrisisState().activeHazards.find(h => h.locationId === locationId && h.type === 'fire');
      const intensity = Math.min(10, Math.floor((value - FIRE_THRESHOLD) / 5) + 1); // Simple intensity calculation

      if (existingHazard) {
        // Update existing fire hazard
        if (existingHazard.intensity < intensity) {
          eventBus.emit('hazard_updated', { ...existingHazard, intensity, timestamp: Date.now() });
        }
      } else {
        // Create new fire hazard
        eventBus.emit('hazard_created', {
          id: `fire-${locationId}-${Date.now()}`,
          type: 'fire',
          locationId,
          intensity,
          spreadRate: 0.1, // Default spread rate
          affectedNodes: [locationId],
          affectedPaths: [],
          timestamp: Date.now(),
        });
      }
    } else {
      // If temperature drops below threshold, check if a fire hazard can be resolved
      const existingFireHazard = stateManager.getCrisisState().activeHazards.find(h => h.locationId === locationId && h.type === 'fire');
      if (existingFireHazard && value < FIRE_THRESHOLD * 0.8) { // Resolve if significantly cooler
        eventBus.emit('hazard_resolved', existingFireHazard.id);
      }
    }
  }

  async processSmokeSensor(data) {
    const { sensorId, locationId, value } = data; // value could be density, boolean, etc.
    logger.debug(`Smoke sensor ${sensorId} at ${locationId}: ${value}`);

    const SMOKE_THRESHOLD = 0.5; // Example: 0-1 density
    if (value > SMOKE_THRESHOLD) {
      const existingHazard = stateManager.getCrisisState().activeHazards.find(h => h.locationId === locationId && h.type === 'smoke');
      if (!existingHazard) {
        eventBus.emit('hazard_created', {
          id: `smoke-${locationId}-${Date.now()}`,
          type: 'smoke',
          locationId,
          intensity: Math.min(10, Math.floor(value * 10)),
          spreadRate: 0.05,
          affectedNodes: [locationId],
          affectedPaths: [],
          timestamp: Date.now(),
        });
      } else {
        // Update smoke intensity if needed
        const newIntensity = Math.min(10, Math.floor(value * 10));
        if (existingHazard.intensity < newIntensity) {
          eventBus.emit('hazard_updated', { ...existingHazard, intensity: newIntensity, timestamp: Date.now() });
        }
      }
    } else {
      const existingSmokeHazard = stateManager.getCrisisState().activeHazards.find(h => h.locationId === locationId && h.type === 'smoke');
      if (existingSmokeHazard && value < SMOKE_THRESHOLD * 0.5) {
        eventBus.emit('hazard_resolved', existingSmokeHazard.id);
      }
    }
  }

  async processMotionSensor(data) {
    const { sensorId, locationId, detected } = data;
    logger.debug(`Motion sensor ${sensorId} at ${locationId}: ${detected ? 'Motion detected' : 'No motion'}`);

    // This could be used to update crowd density or detect unusual activity
    if (detected) {
      // Example: If motion detected in an area that should be empty during evacuation
      const crisisState = stateManager.getCrisisState();
      const isEvacuating = crisisState.evacuationRoutes.length > 0; // Simple check
      if (isEvacuating && !crisisState.peopleLocations.some(p => p.currentLocationId === locationId)) {
        // Motion detected where no known person is, during evacuation
        eventBus.emit('alert_issued', {
          title: 'Unusual Motion Detected',
          message: `Motion detected at ${locationId} during evacuation, but no known person is there.`,
          severity: 'warning',
          locationId: locationId,
          type: 'unusual_activity',
        });
      }
    }
  }

  async processOccupancySensor(data) {
    const { sensorId, locationId, count } = data;
    logger.debug(`Occupancy sensor ${sensorId} at ${locationId}: ${count} people`);

    // Update crowd density in state manager
    const currentCrowdDensity = stateManager.getCrisisState().crowdDensity;
    const newCrowdDensity = { ...currentCrowdDensity, [locationId]: count };
    eventBus.emit('crowd_density_updated', newCrowdDensity);

    // Check for overcrowding
    const node = buildingGraph.getNode(locationId);
    if (node && node.capacity && count > node.capacity * 1.2) { // 120% capacity
      eventBus.emit('alert_issued', {
        title: 'Overcrowding Detected',
        message: `Overcrowding detected at ${locationId}. Current: ${count}, Capacity: ${node.capacity}.`,
        severity: 'warning',
        locationId: locationId,
        type: 'overcrowding',
      });
    }
  }
}

const sensorHandler = new SensorHandler();
module.exports = sensorHandler;

