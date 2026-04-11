export const CRISIS_EVENT_TYPES = {
  FIRE_DETECTED: 'fire_detected',
  PANIC_TRIGGERED: 'panic_triggered',
  SENSOR_MALFUNCTION: 'sensor_malfunction',
  EVACUATION_STARTED: 'evacuation_started',
  SYSTEM_ALERT: 'system_alert',
};

export const SIMULATION_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
  ERROR: 'error',
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

export const API_ENDPOINTS = {
  BUILDING_DATA: '/api/config/building',
  CRISIS_PEOPLE: '/api/crisis/people',
  CRISIS_HAZARDS: '/api/crisis/hazards',
  CRISIS_ROUTES: '/api/crisis/routes',
  CRISIS_ALERTS: '/api/crisis/alerts',
  CRISIS_CROWD_DENSITY: '/api/crisis/crowd-density',
  SIMULATION_SCENARIOS: '/api/simulation/scenarios',
  SIMULATION_START: '/api/simulation/start',
  SIMULATION_PAUSE: '/api/simulation/pause',
  SIMULATION_RESUME: '/api/simulation/resume',
  SIMULATION_RESET: '/api/simulation/reset',
  SIMULATION_EVENT: '/api/simulation/event',
  ANALYTICS_BASE: '/api/analytics',
  LOGS_EVENTS: '/api/logs/events',
  LOGS_DECISIONS: '/api/logs/decisions',
  LOGS_SYSTEM: '/api/logs/system',
  CONFIG_APP: '/api/config/app',
};

