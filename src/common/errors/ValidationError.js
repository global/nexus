/**
 * Error raised when request input fails schema validation (e.g. a Joi
 * validation failure). Maps to an HTTP 400 response by the central
 * error-handling middleware.
 *
 * @extends Error
 */
class ValidationError extends Error {
  /**
   * @param {string} [message='Validation failed']
   * @param {Array<object>} [details=[]] - Field-level validation error details, if available.
   */
  constructor(message = 'Validation failed', details = []) {
    super(message);

    /** @type {string} Error class name, used for identification in logs and responses. */
    this.name = 'ValidationError';

    /** @type {number} HTTP status code associated with this error. */
    this.statusCode = 400;

    /** @type {Array<object>} Field-level validation error details. */
    this.details = details;

    // Stack trace is captured for debugging purposes, but not sent to the client.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ValidationError;
