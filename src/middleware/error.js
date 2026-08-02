const NotFoundError = require('../common/errors/NotFoundError');
const UnauthorizedError = require('../common/errors/UnauthorizedError');
const ConflictError = require('../common/errors/ConflictError');
const ValidationError = require('../common/errors/ValidationError');  


/**
 * Catches requests that didn't match any route and forwards a NotFoundError
 * to the central error handler, so unmatched routes get the same JSON error
 * shape as every other 404.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Error Handling Middleware
 * 
 * Process all errors thrown in the application and send a consistent JSON response.
 *
 * Must be registered last, after all routes and other middleware.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err instanceof NotFoundError || err instanceof UnauthorizedError || err instanceof ConflictError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // express-openapi-validator errors (request/response contract violations):
  // they carry `status` and `errors`, not this app's `statusCode`/`details`.
  if (typeof err.status === 'number' && Array.isArray(err.errors)) {
    return res.status(err.status).json({ error: err.message, details: err.errors });
  }

  console.error(err);
  return res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler, notFoundHandler };
