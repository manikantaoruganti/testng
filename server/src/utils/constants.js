// server/src/utils/constants.js
// Defines application-wide constants.

module.exports = {
  // Event Types (mirroring client-side for consistency)
  CRISIS_EVENT_TYPES: {
    FIRE_DETECTED: 'fire_detected',
    PANIC_TRIGGERED: 'panic_triggered',
    SENSOR_MALFUNCTION: 'sensor_malfunction',
    EVACUATION_STARTED: 'evacuation_started',
    SYSTEM_ALERT: 'system_alert',
    MEDICAL_EMERGENCY: 'medical_emergency',
    FIRE_EXTINGUISHED: 'fire_extinguished',
    // ... other event types
  },

  // Simulation States
  SIMULATION_STATES: {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    FINISHED: 'finished',
    ERROR: 'error',
  },

  // Severity Levels
  SEVERITY_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical',
    SUCCESS: 'success',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
  },

  // API Endpoints (for internal reference, client uses relative paths)
  API_ENDPOINTS: {
    CRISIS: '/api/crisis',
    SIMULATION: '/api/simulation',
    ANALYTICS: '/api/analytics',
    SYSTEM: '/api/system',
    LOGS: '/api/logs',
    CONFIG: '/api/config',
  },

  // Default Configuration Values
  DEFAULT_APP_CONFIG: {
    simulationSpeed: 1,
    alertThreshold: 80,
    enableRealtimeUpdates: true,
    version: '1.0.0',
  },

  // Graph Node Types
  NODE_TYPES: {
    ROOM: 'room',
    EXIT: 'exit',
    STAIRWELL: 'stairwell',
    SENSOR: 'sensor',
  },

  // Graph Edge Properties
  DEFAULT_EDGE_WEIGHT: 1,
};

