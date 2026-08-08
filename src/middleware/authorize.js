const { UnauthorizedError, ForbiddenError } = require('../common/errors');

/**
 * Returns middleware that only allows requests whose authenticated user
 * (set by `authenticate`, see `middleware/auth.js`) holds at least one of
 * the given IdP realm roles.
 *
 * Deliberately kept in its own file, separate from `authenticate`'s JWT/JWKS
 * verification machinery: role-checking only ever reads `req.user.roles`,
 * so it has no need for `jsonwebtoken`/`jwks-rsa` and can be required (and
 * tested) without pulling that dependency chain in.
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
