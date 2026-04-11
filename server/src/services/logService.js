// server/src/services/logService.js
// Provides business logic for logging and retrieving system events, decisions, and general logs.

const { CrisisEvent, SystemLog } = require('../db/schemas/logSchema'); // Assuming separate schemas for different log types
const { logger } = require('../utils/logger');

class LogService {
  constructor() {
    // No specific state, relies on DB.
  }

  /**
   * Creates a new log entry.
   * @param {'event'|'decision'|'system'} logType - The type of log.
   * @param {string} title - A brief title for the log.
   * @param {string} message - The detailed log message.
   * @param {'debug'|'info'|'warning'|'error'|'critical'|'success'} severity - Severity level.
   * @param {object} payload - Additional data associated with the log.
   * @returns {Promise<object>} The created log entry.
   */
  async createLog(logType, title, message, severity = 'info', payload = {}) {
    try {
      let logEntry;
      if (logType === 'system') {
        logEntry = await SystemLog.create({
          level: severity,
          message: `${title}: ${message}`,
          timestamp: Date.now(),
          payload,
        });
      } else { // 'event' or 'decision'
        logEntry = await CrisisEvent.create({
          eventType: logType === 'event' ? title : 'decision_log', // Use title for eventType, or specific for decision
          severity,
          message: `${title}: ${message}`,
          locationId: payload.locationId || 'N/A',
          timestamp: Date.now(),
          payload,
        });
      }
      logger.debug(`LogService: Created ${logType} log - ${title}`);
      return logEntry;
    } catch (error) {
      logger.error(`LogService: Error creating ${logType} log - ${title}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves event logs.
   * @param {object} filters - Query filters (e.g., time range, severity, eventType).
   * @returns {Promise<Array<object>>} Array of event log entries.
   */
  async getEventLogs(filters = {}) {
    logger.debug('LogService: Fetching event logs with filters:', filters);
    try {
      const query = {
        eventType: { $ne: 'decision_log' }, // Exclude decision logs if CrisisEvent is used for both
        ...filters,
      };
      const logs = await CrisisEvent.find(query).sort({ timestamp: -1 }).limit(100); // Latest 100
      return logs.map(log => ({
        id: log._id,
        timestamp: log.timestamp,
        eventType: log.eventType,
        severity: log.severity,
        locationId: log.locationId,
        message: log.message,
        payload: log.payload,
      }));
    } catch (error) {
      logger.error('LogService: Error fetching event logs:', error);
      throw error;
    }
  }

  /**
   * Retrieves decision logs.
   * @param {object} filters - Query filters.
   * @returns {Promise<Array<object>>} Array of decision log entries.
   */
  async getDecisionLogs(filters = {}) {
    logger.debug('LogService: Fetching decision logs with filters:', filters);
    try {
      const query = {
        eventType: 'decision_log', // Assuming a specific eventType for decisions
        ...filters,
      };
      const logs = await CrisisEvent.find(query).sort({ timestamp: -1 }).limit(100);
      return logs.map(log => ({
        id: log._id,
        timestamp: log.timestamp,
        decisionType: log.payload.action, // Extract from payload
        targetId: log.payload.targetId,
        action: log.payload.action,
        status: log.payload.status || 'executed', // Default status
        reason: log.payload.reason,
        message: log.message,
        payload: log.payload,
      }));
    } catch (error) {
      logger.error('LogService: Error fetching decision logs:', error);
      throw error;
    }
  }

  /**
   * Retrieves system logs.
   * @param {object} filters - Query filters.
   * @returns {Promise<Array<object>>} Array of system log entries.
   */
  async getSystemLogs(filters = {}) {
    logger.debug('LogService: Fetching system logs with filters:', filters);
    try {
      const logs = await SystemLog.find(filters).sort({ timestamp: -1 }).limit(100);
      return logs.map(log => ({
        id: log._id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        payload: log.payload,
      }));
    } catch (error) {
      logger.error('LogService: Error fetching system logs:', error);
      throw error;
    }
  }
}

const logService = new LogService();
module.exports = { logService };

