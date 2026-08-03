const { tokenEndpoint, logoutEndpoint, clientId } = require('../../config/auth');
const { UnauthorizedError } = require('../../common/errors');

/**
 * Posts a grant request to Keycloak's token endpoint and normalizes the
 * response into camelCase. Used for both the password grant (login) and
 * the refresh_token grant.
 *
 * @param {Record<string, string>} params - Grant-specific form fields, merged with client_id.
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, tokenType: string}>}
 */
async function requestToken(params) {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, ...params }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new UnauthorizedError(data.error_description || data.error || 'Authentication failed');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * Exchanges a username/password for tokens via Keycloak's Direct Access
 * Grant (Resource Owner Password Credentials). This is a dev/internal-tool
 * convenience — OAuth2 best practice is Authorization Code + PKCE for
 * user-facing apps, since ROPC requires the caller to handle raw passwords.
 *
 * @param {string} username
 * @param {string} password
 */
const login = (username, password) => requestToken({ grant_type: 'password', username, password });

/**
 * Exchanges a refresh token for a new access/refresh token pair.
 *
 * @param {string} refreshToken
 */
const refresh = (refreshToken) => requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });

/**
 * Revokes a refresh token (and its associated session) at Keycloak.
 *
 * @param {string} refreshToken
 */
async function logout(refreshToken) {
  const response = await fetch(logoutEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new UnauthorizedError(data.error_description || data.error || 'Logout failed');
  }
}

module.exports = { login, refresh, logout };
