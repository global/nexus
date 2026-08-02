/**
 * Error raised when a requested resource does not exist in the system.
 * Maps to an HTTP 404 response by the central error-handling middleware.
 *
 * @extends Error
 */
class NotFoundError extends Error {
  /**
   * @param {string} [message='Resource not found']
   */
  constructor(message = 'Resource not found') {
    super(message);

    /** @type {string} Error class name, used for identification in logs and responses. */
    this.name = 'NotFoundError';

    /** @type {number} HTTP status code associated with this error. */
    this.statusCode = 404;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = NotFoundError;
