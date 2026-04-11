// server/src/db/mongo.js
// MongoDB connection setup using Mongoose.

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crisis_os_db';
    await mongoose.connect(mongoUri, {
      // useNewUrlParser: true, // Deprecated in Mongoose 6
      // useUnifiedTopology: true, // Deprecated in Mongoose 6
      // useCreateIndex: true, // Deprecated in Mongoose 6
      // useFindAndModify: false, // Deprecated in Mongoose 6
    });
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
  }
};

module.exports = { connectDB, disconnectDB };

