// server/src/db/schemas/configSchema.js
// Mongoose schemas for application-wide and building-specific configurations.

const mongoose = require('mongoose');

// --- Application Configuration Schema ---
const appConfigSchema = new mongoose.Schema({
  simulationSpeed: {
    type: Number,
    default: 1, // Default simulation speed multiplier
    min: 0.1,
  },
  alertThreshold: {
    type: Number,
    default: 80, // Percentage threshold for critical alerts
    min: 0,
    max: 100,
  },
  enableRealtimeUpdates: {
    type: Boolean,
    default: true,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // Add other global application settings here
});

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

// --- Building Configuration Schema ---
// This schema is for storing the building's structural data if it were to be
// managed directly in MongoDB rather than a static JSON file.
// For now, we are using `client/public/building.json` for the digital twin.
// This schema is included for completeness and future extensibility.
const buildingConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // The actual complex structure of floors, nodes, edges would go here.
  // For simplicity, we can store the entire JSON structure as a Mixed type,
  // or define sub-schemas for floors, nodes, edges as in buildingSchema.js
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}, // Will store the parsed content of building.json
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const BuildingConfig = mongoose.model('BuildingConfig', buildingConfigSchema);

module.exports = { AppConfig, BuildingConfig };

