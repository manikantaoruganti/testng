// server/src/db/schemas/buildingSchema.js
// Mongoose schema for storing building configuration (if managed in DB).
// Currently, building data is loaded from `client/public/building.json`.
// This schema is a placeholder if we decide to manage building data dynamically in MongoDB.

const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['room', 'exit', 'stairwell', 'sensor'] },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  label: { type: String },
  capacity: { type: Number }, // For rooms
  properties: { type: mongoose.Schema.Types.Mixed }, // e.g., sensor types, exit status
});

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  length: { type: Number, default: 1 }, // Physical length
  weight: { type: Number, default: 1 }, // Cost for routing
  bidirectional: { type: Boolean, default: true },
  properties: { type: mongoose.Schema.Types.Mixed }, // e.g., door status, width
});

const floorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  properties: { type: mongoose.Schema.Types.Mixed },
});

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  floors: [floorSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Building = mongoose.model('Building', buildingSchema);

module.exports = { Building };
