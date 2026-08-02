class ConflictError extends Error {
  constructor(message = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ConflictError;
