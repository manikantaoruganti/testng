// server/src/events/eventTypes.js
// Defines a comprehensive list of all event types used in CrisisOS.

module.exports = {
  // System Events
  SYSTEM_READY: 'system_ready',
  SYSTEM_SHUTDOWN: 'system_shutdown',
  SYSTEM_ERROR: 'system_error',
  CONFIG_UPDATED: 'config_updated',

  // Crisis State Events (emitted by StateManager or direct sensors)
  CRISIS_STATE_UPDATED: 'crisis_state_updated', // General update to the digital twin state
  HAZARD_CREATED: 'hazard_created', // e.g., fire detected, gas leak
  HAZARD_UPDATED: 'hazard_updated', // e.g., fire spread, intensity change
  HAZARD_RESOLVED: 'hazard_resolved', // e.g., fire extinguished, leak contained
  PERSON_DETECTED: 'person_detected', // New person entered system
  PERSON_MOVED: 'person_moved', // Person changed location
  PERSON_STATUS_UPDATED: 'person_status_updated', // e.g., panicked, safe, injured
  CROWD_DENSITY_UPDATED: 'crowd_density_updated',
  ALERT_ISSUED: 'alert_issued', // New alert generated
  ALERT_RESOLVED: 'alert_resolved',
  SENSOR_DATA_RECEIVED: 'sensor_data_received', // Raw sensor input

  // Simulation Events (emitted by SimulationEngine)
  SIMULATION_START_REQUEST: 'simulation_start_request', // Request to start simulation
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_PAUSE_REQUEST: 'simulation_pause_request',
  SIMULATION_PAUSED: 'simulation_paused',
  SIMULATION_RESUME_REQUEST: 'simulation_resume_request',
  SIMULATION_RESUMED: 'simulation_resumed',
  SIMULATION_RESET_REQUEST: 'simulation_reset_request',
  SIMULATION_RESET: 'simulation_reset',
  SIMULATION_TICK: 'simulation_tick', // Periodic update during simulation
  SIMULATION_EVENT_TRIGGERED: 'simulation_event_triggered', // An event occurred within simulation
  SIMULATION_FINISHED: 'simulation_finished',

  // Routing Events (emitted by RoutingEngine or DecisionEngine)
  ROUTE_RECALCULATION_NEEDED: 'route_recalculation_needed',
  ROUTE_UPDATED: 'route_updated', // New optimal routes calculated
  PATH_BLOCKED: 'path_blocked', // A path is deemed unsafe/unusable

  // Decision Events (emitted by DecisionEngine)
  DECISION_PROPOSED: 'decision_proposed', // Decision made, awaiting execution
  DECISION_EXECUTED: 'decision_executed', // Decision has been acted upon
  EVACUATION_INITIATED: 'evacuation_initiated',
  PERSON_GUIDANCE_NEEDED: 'person_guidance_needed',
  CROWD_DIVERSION_NEEDED: 'crowd_diversion_needed',
  ASSISTANCE_DEPLOYMENT_NEEDED: 'assistance_deployment_needed',

  // Prediction Events (emitted by PredictionEngine)
  PREDICTION_UPDATED: 'prediction_updated',

  // Risk Events (emitted by RiskEngine)
  RISK_SCORE_UPDATED: 'risk_score_updated',

  // UI/API Interaction Events (from client via API/Socket)
  CLIENT_CONNECTED: 'client_connected',
  CLIENT_DISCONNECTED: 'client_disconnected',
  USER_ACTION: 'user_action', // Generic user interaction
};

