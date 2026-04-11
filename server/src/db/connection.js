// server/src/db/connection.js
// Centralized database connection management.

const { connectDB, disconnectDB } = require('./mongo');
const { logger } = require('../utils/logger');

/**
 * Establishes the database connection.
 */
const initializeDatabaseConnection = async () => {
  logger.info('Attempting to connect to database...');
  await connectDB();
};

/**
 * Closes the database connection.
 */
const closeDatabaseConnection = async () => {
  logger.info('Attempting to disconnect from database...');
  await disconnectDB();
};

// Listen for process termination signals to gracefully close DB connection
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

module.exports = { connectDB: initializeDatabaseConnection, disconnectDB: closeDatabaseConnection };

