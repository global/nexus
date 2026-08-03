/**
 * OIDC configuration, derived from environment variables.
 *
 * Nexus Insight does not issue or store credentials itself: Keycloak is the
 * identity provider, and this app only ever verifies bearer JWTs it issued.
 *
 * This module loads its own `.env.*` file based on the `NODE_ENV` environment variable, 
 * so that the same code can run in different environments without modification.
 *
 * @module config/auth
 */

const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' :
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';

dotenv.config({ path: envFile });

const keycloakUrl = process.env.KEYCLOAK_URL;
const realm = process.env.KEYCLOAK_REALM;
const issuer = `${keycloakUrl}/realms/${realm}`;

module.exports = {
  keycloakUrl,
  realm,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  issuer,
  jwksUri: `${issuer}/protocol/openid-connect/certs`,
  tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
  logoutEndpoint: `${issuer}/protocol/openid-connect/logout`,
};
