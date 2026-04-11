// server/src/db/schemas/eventSchema.js
// Mongoose schema for storing crisis events and alerts.

const mongoose = require('mongoose');

const crisisEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'system_ready', 'system_shutdown', 'system_error', 'config_updated',
      'crisis_state_updated', 'hazard_created', 'hazard_updated', 'hazard_resolved',
      'person_detected', 'person_moved', 'person_status_updated', 'crowd_density_updated',
      'alert_issued', 'alert_resolved', 'sensor_data_received',
      'simulation_started', 'simulation_paused', 'simulation_resumed', 'simulation_reset',
      'simulation_tick', 'simulation_event_triggered', 'simulation_finished',
      'route_recalculation_needed', 'route_updated', 'path_blocked',
      'decision_proposed', 'decision_executed', 'evacuation_initiated',
      'person_guidance_needed', 'crowd_diversion_needed', 'assistance_deployment_needed',
      'prediction_updated', 'risk_score_updated',
      'panic_triggered', // Specific panic event
      'decision_log', // For generic decision logging
    ],
  },
  severity: {
    type: String,
    required: true,
    enum: ['debug', 'info', 'warning', 'error', 'critical', 'success'],
    default: 'info',
  },
  message: {
    type: String,
    required: true,
  },
  locationId: {
    type: String,
    default: 'N/A',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for additional event data
    default: {},
  },
});

const CrisisEvent = mongoose.model('CrisisEvent', crisisEventSchema);

module.exports = { CrisisEvent };

