// server/src/db/schemas/logSchema.js
// Mongoose schema for general system logs (distinct from crisis events).

const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['debug', 'info', 'warn', 'error', 'critical'],
    default: 'info',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for additional log data
    default: {},
  },
});

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = { SystemLog };

