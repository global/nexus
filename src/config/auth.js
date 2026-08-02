/**
 * Keycloak / OIDC configuration, derived from environment variables.
 *
 * Nexus Insight does not issue or store credentials itself: Keycloak is the
 * identity provider, and this app only ever verifies bearer JWTs it issued.
 *
 * This module loads its own `.env.*` file rather than relying on `db.js`
 * having already done so: whichever of the two happens to be `require`'d
 * first in the dependency graph would otherwise win, silently leaving the
 * other's environment variables unset.
 *
 * @module config/auth
 */

const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' :
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';

dotenv.config({ path: envFile });

const keycloakUrl = process.env.KEYCLOAK_URL;
const realm = process.env.KEYCLOAK_REALM;

/** @type {string} The realm's OIDC issuer URL; must match the JWT `iss` claim exactly. */
const issuer = `${keycloakUrl}/realms/${realm}`;

module.exports = {
  /** @type {string} Base URL of the Keycloak server, e.g. http://localhost:8080. */
  keycloakUrl,

  /** @type {string} Keycloak realm name. */
  realm,

  /** @type {string} The public client id tokens are issued to. */
  clientId: process.env.KEYCLOAK_CLIENT_ID,

  issuer,

  /** @type {string} JWKS endpoint used to fetch the realm's RS256 signing keys. */
  jwksUri: `${issuer}/protocol/openid-connect/certs`,
};
