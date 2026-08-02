/**
 * Error raised when a request is authenticated but the caller lacks the
 * role/permission required for the action.
 * 
 * Maps to an HTTP 403 response by the central error-handling middleware.
 *
 * @extends Error
 */
class ForbiddenError extends Error {
  /**
   * @param {string} [message='You do not have permission to perform this action']
   */
  constructor(message = 'You do not have permission to perform this action') {
    super(message);

    /** @type {string} Error class name, used for identification in logs and responses. */
    this.name = 'ForbiddenError';

    /** @type {number} HTTP status code associated with this error. */
    this.statusCode = 403;

    // Stack trace is captured for debugging purposes, but not sent to the client.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ForbiddenError;
