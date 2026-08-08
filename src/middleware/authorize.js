const { UnauthorizedError, ForbiddenError } = require('../common/errors');

/**
 * Returns middleware that only allows requests whose authenticated user
 * holds at least one of the given IdP realm roles.
 *
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    // User must be authenticated first, so `req.user` is set by `authenticate`.
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError(`Requires one of the following roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

module.exports = { authorize };
