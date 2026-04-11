// server/src/utils/helpers.js
// General utility and helper functions.

/**
 * Generates a unique ID.
 * @returns {string} A unique ID string.
 */
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clones an object or array.
 * @param {object|Array} obj - The object or array to clone.
 * @returns {object|Array} A deep clone.
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Delays execution for a given number of milliseconds.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a timestamp into a human-readable string.
 * @param {Date|string|number} timestamp - The timestamp to format.
 * @returns {string} Formatted date and time.
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  generateUniqueId,
  deepClone,
  delay,
  formatTimestamp,
  capitalizeFirstLetter,
};

