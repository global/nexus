#!/usr/bin/env node

/**
 * Registers the Nexus Insight MCP server  with the Claude Code CLI, authenticated as a real
 * Keycloak realm user, so `claude mcp add` gets a genuine bearer token
 * instead of a placeholder.
 *
 * Requires the dev server, MongoDB, and Keycloak all running
 * (`npm run mongo`, `npm run keycloak`, `npm run env:dev`) and the Claude
 * Code CLI (`claude`) on PATH.
 *
 * Usage:
 *   node scripts/connect-mcp.js                         # logs in as alice.admin (admin role)
 *   node scripts/connect-mcp.js --user=bob.manager       # or any realm-export.json test user
 *   node scripts/connect-mcp.js --scope=user             # passed straight through to `claude mcp add`
 *   node scripts/connect-mcp.js --name=nexus-viewer --user=carol.viewer
 *
 */

const { execFileSync } = require('node:child_process');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const MCP_URL = process.env.MCP_URL || `${BASE_URL}/mcp`;
const DEFAULT_PASSWORD = 'Passw0rd!';

/** Parses `--key=value` / `--flag` CLI arguments into a plain object. */
function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=');
    args[key] = value ?? true;
  }
  return args;
}

/**
 * Exchanges a username/password for a token pair via the app's own
 * /api/auth/login endpoint.
 *
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Login failed for "${username}": ${res.status} ${text}`);
  return JSON.parse(text);
}

function run(command, cmdArgs, options = {}) {
  console.log(`$ ${command} ${cmdArgs.join(' ')}`);
  return execFileSync(command, cmdArgs, { stdio: 'inherit', ...options });
}

/** Formats a duration in seconds as e.g. "4m 30s" or "1h 5m" — `expiresIn` here is short (~5 min), so a bare hour count would misleadingly round to 0. */
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const username = args.user || process.env.MCP_USERNAME || 'alice.admin';
  const password = args.password || process.env.MCP_PASSWORD || DEFAULT_PASSWORD;
  const serverName = args.name || 'nexus';
  const scope = args.scope || 'user';

  console.log(`Logging in as ${username} against ${BASE_URL}...`);
  const { accessToken, expiresIn } = await login(username, password);
  console.log(`Got a token (expires in ~${formatDuration(expiresIn)}).`);

  try {
    execFileSync('claude', ['mcp', 'remove', serverName, '--scope', scope], { stdio: 'ignore' });
  } catch {
    console.log("Nothing registered under this name/scope yet — fine");
  }

  run('claude', [
    'mcp', 'add',
    '--transport', 'http',
    serverName,
    MCP_URL,
    '--header', `Authorization: Bearer ${accessToken}`,
    '--scope', scope,
  ]);

  console.log(`\nRegistered "${serverName}" -> ${MCP_URL} as ${username} (scope: ${scope}).`);
  console.log(`Token expires in ~${formatDuration(expiresIn)}; re-run this script to refresh it.`);
  console.log('Verify with: claude mcp list');
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
