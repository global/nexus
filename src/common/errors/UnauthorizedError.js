/**
 * Error raised when a request is missing valid authentication credentials.
 * Maps to an HTTP 401 response by the central error-handling middleware.
 *
 * @extends Error
 */
class UnauthorizedError extends Error {
  /**
   * @param {string} [message='Authentication required']
   */
  constructor(message = 'Authentication required') {
    super(message);

    /** @type {string} Error class name, used for identification in logs and responses. */
    this.name = 'UnauthorizedError';

    /** @type {number} HTTP status code associated with this error. */
    this.statusCode = 401;

    // Stack trace is captured for debugging purposes, but not sent to the client.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = UnauthorizedError;
