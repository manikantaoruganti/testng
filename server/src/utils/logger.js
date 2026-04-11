// server/src/utils/logger.js
// Centralized logging utility using Pino.

const pino = require('pino');
const path = require('path');

// Determine log level based on environment
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = pino({
  level: logLevel,
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:HH:MM:ss',
    },
  },
});

module.exports = { logger };

