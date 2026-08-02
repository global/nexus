const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { UnauthorizedError, ForbiddenError } = require('../common/errors');
const { issuer, jwksUri } = require('../config/auth');

// Set up a JWKS client to fetch IdP's public keys for JWT verification.
const client = jwksClient({
  jwksUri,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
  rateLimit: true,
});

/**
 * Verifies a JWT's signature and issuer against IdP's public keys. 
 *
 * @param {import('jsonwebtoken').JwtHeader} header
 * @param {(err: Error|null, key?: string) => void} callback
 */
function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * Verifies the request's `Authorization: Bearer <token>` JWT against
 * IdP's public signing keys and the expected issuer. On success,
 * attaches an identity to `req.user`. On failure, forwards an
 * UnauthorizedError to the central error handler rather than responding
 * directly, so the response shape stays consistent with the rest of the app.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  jwt.verify(token, getSigningKey, { algorithms: ['RS256'], issuer }, (err, claims) => {
    if (err) {
      return next(new UnauthorizedError(`Invalid token: ${err.message}`));
    }

    // Attach the authenticated user's identity to the request object for downstream middleware 
    // and route handlers. Roles are extracted from the `realm_access` claim, which is standard 
    // in IdP-issued tokens.
    req.user = {
      id: claims.sub,
      username: claims.preferred_username,
      email: claims.email,
      roles: (claims.realm_access && claims.realm_access.roles) || [],
      claims,
    };

    next();
  });
}

/**
 * Returns middleware that only allows requests whose authenticated user
 * (set by `authenticate`) holds at least one of the given IdP realm
 * roles. 
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

module.exports = { authenticate, authorize };
