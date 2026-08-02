/**
 * Error raised when an operation conflicts with existing state, such as a
 * uniqueness constraint violation (e.g. a duplicate name or key).
 * Maps to an HTTP 409 response by the central error-handling middleware.
 *
 * @extends Error
 */
class ConflictError extends Error {
  /**
   * @param {string} [message='Resource already exists']
   */
  constructor(message = 'Resource already exists') {
    super(message);

    /** @type {string} Error class name, used for identification in logs and responses. */
    this.name = 'ConflictError';

    /** @type {number} HTTP status code associated with this error. */
    this.statusCode = 409;

    // Stack trace is captured for debugging purposes, but not sent to the client.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ConflictError;
