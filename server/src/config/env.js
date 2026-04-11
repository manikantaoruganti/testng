// server/src/config/env.js
// Centralized environment variable loading and validation.

const dotenv = require('dotenv');
const path = require('path');
const { logger } = require('../utils/logger');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/crisis_os_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here', // CRITICAL: Change this in production!
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Add other environment variables here
};

// Basic validation for critical environment variables
if (!env.MONGO_URI) {
  logger.error('CRITICAL: MONGO_URI environment variable is not set.');
  process.exit(1);
}

if (env.JWT_SECRET === 'your_jwt_secret_key_here' && env.NODE_ENV === 'production') {
  logger.warn('WARNING: JWT_SECRET is using default value in production. Please change it!');
}

logger.info('Environment variables loaded successfully.');

module.exports = { env };

