// server/src/db/seed.js
// Script to seed initial data into the database.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { logger } = require('../utils/logger');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { CrisisEvent } = require('./schemas/eventSchema');
const { User } = require('./schemas/userSchema');
const { BuildingConfig, AppConfig } = require('./schemas/configSchema');
const { SystemLog } = require('./schemas/logSchema'); // Assuming SystemLog schema

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crisis_os_db';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected for seeding.');

    // Clear existing data
    logger.info('Clearing existing data...');
    await CrisisEvent.deleteMany({});
    await User.deleteMany({});
    await BuildingConfig.deleteMany({});
    await AppConfig.deleteMany({});
    await SystemLog.deleteMany({});
    logger.info('Existing data cleared.');

    // Seed Users
    const adminUser = await User.create({
      username: 'admin',
      password: 'password123', // In production, hash this!
      role: 'admin',
      email: 'admin@crisisos.com',
    });
    logger.info(`Seeded admin user: ${adminUser.username}`);

    // Seed App Configuration
    const appConfig = await AppConfig.create({
      simulationSpeed: 1,
      alertThreshold: 75,
      enableRealtimeUpdates: true,
      version: '1.0.0',
      lastUpdated: Date.now(),
    });
    logger.info('Seeded default app configuration.');

    // Seed some initial events/logs (optional)
    await CrisisEvent.create({
      eventType: 'system_ready',
      severity: 'info',
      message: 'CrisisOS backend started successfully.',
      timestamp: Date.now() - 10000,
      payload: { service: 'orchestrator' },
    });
    await CrisisEvent.create({
      eventType: 'fire_detected',
      severity: 'warning',
      message: 'Initial fire detected in room-102.',
      locationId: 'room-102',
      timestamp: Date.now() - 5000,
      payload: { intensity: 5 },
    });
    await SystemLog.create({
      level: 'info',
      message: 'Database seeded successfully.',
      timestamp: Date.now(),
      payload: { script: 'seed.js' },
    });
    logger.info('Seeded initial event and system logs.');

    logger.info('Database seeding complete!');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected after seeding.');
  }
};

seedData();

