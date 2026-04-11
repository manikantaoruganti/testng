// server/src/utils/validator.js
// Utility functions for data validation.

class Validator {
  /**
   * Checks if a value is not null, undefined, or an empty string.
   * @param {any} value
   * @returns {boolean}
   */
  static isRequired(value) {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Checks if a value is a valid number.
   * @param {any} value
   * @returns {boolean}
   */
  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Checks if a value is a positive number.
   * @param {any} value
   * @returns {boolean}
   */
  static isPositiveNumber(value) {
    return Validator.isNumber(value) && value > 0;
  }

  /**
   * Checks if a string is a valid email format.
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Checks if a string meets a minimum length.
   * @param {string} value
   * @param {number} minLength
   * @returns {boolean}
   */
  static isMinLength(value, minLength) {
    return typeof value === 'string' && value.length >= minLength;
  }

  /**
   * Checks if a value is within a specified range.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {boolean}
   */
  static isInRange(value, min, max) {
    return Validator.isNumber(value) && value >= min && value <= max;
  }

  /**
   * Validates an object against a schema of validation rules.
   * @param {object} data - The object to validate.
   * @param {object} rules - An object where keys are data properties and values are validation functions or arrays of functions.
   * @returns {{isValid: boolean, errors: object}}
   */
  static validate(data, rules) {
    const errors = {};
    let isValid = true;

    for (const key in rules) {
      if (Object.prototype.hasOwnProperty.call(rules, key)) {
        const rule = rules[key];
        const value = data[key];
        const validationFunctions = Array.isArray(rule) ? rule : [rule];

        for (const func of validationFunctions) {
          const error = func(value);
          if (error) {
            if (!errors[key]) {
              errors[key] = [];
            }
            errors[key].push(error);
            isValid = false;
          }
        }
      }
    }
    return { isValid, errors };
  }
}

module.exports = { Validator };

