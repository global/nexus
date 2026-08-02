/**
 * Index module for the application's common error classes to be used in services, controllers, 
 * and the error-handling middleware.
 *
 * @module common/errors
 */

const NotFoundError = require('./NotFoundError');
const UnauthorizedError = require('./UnauthorizedError');
const ConflictError = require('./ConflictError');
const ValidationError = require('./ValidationError');

module.exports = { NotFoundError, UnauthorizedError, ConflictError, ValidationError };
