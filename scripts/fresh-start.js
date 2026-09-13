#!/usr/bin/env node

/**
 * Simple script to start MongoDB and Keycloak, start the dev server if not already running,
 * reset and reseed the sample data, and register the Nexus MCP server with the Claude Code CLI.
 * 
 * Usage: npm run dev:fresh
 */

const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');

const REPO_ROOT = path.join(__dirname, '..');
const BASE_URL = 'http://localhost:3000';
const KEYCLOAK_URL = 'http://localhost:8080';

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd: REPO_ROOT, stdio: 'inherit' });
}

/** Polls `url` until it responds with a 2xx status, or throws after `timeoutMs`. */
async function waitFor(url, label, { timeoutMs = 60000, intervalMs = 1000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // Not up yet — connection refused while the service is still starting.
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

async function isServerUp() {
  try {
    const res = await fetch(BASE_URL);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Starting MongoDB...');
  run('docker', ['compose', '-f', 'mongo/docker-compose.yml', 'up', '-d']);

  console.log('Starting Keycloak...');
  run('docker', ['compose', '-f', 'keycloak/docker-compose.yml', 'up', '-d']);

  console.log('Waiting for Keycloak to import the nexus-insight realm...');
  if (!(await waitFor(`${KEYCLOAK_URL}/realms/nexus-insight`, 'Keycloak'))) {
    throw new Error('Timed out waiting for Keycloak — check `docker logs keycloak`.');
  }

  let ownServer = null;
  if (await isServerUp()) {
    console.log('API server is already running — reusing it for setup.');
  } else {
    console.log('Starting the dev server...');
    ownServer = spawn('node', ['server.js'], {
      cwd: REPO_ROOT,
      env: { ...process.env, NODE_ENV: 'dev' },
      stdio: 'inherit',
    });

    if (!(await waitFor(BASE_URL, 'the API server'))) {
      ownServer.kill();
      throw new Error('Timed out waiting for the API server to start.');
    }
  }

  try {
    console.log('Resetting and reseeding sample data...');
    run('node', ['ontology/seed-sample-data.js', '--reset']);

    console.log('Registering the Nexus MCP server with the Claude Code CLI...');
    try {
      run('node', ['scripts/connect-mcp.js']);
    } catch (err) {
      console.warn(`[warn] Could not register the MCP server (${err.message}) — is the \`claude\` CLI on PATH? Run \`npm run connect:mcp\` manually once it is.`);
    }
  } catch (err) {
    // Setup failed — don't leave an orphaned server process behind if we're the one who started it.
    if (ownServer) ownServer.kill();
    throw err;
  }

  console.log('\nDone — MongoDB and Keycloak are up, sample data is freshly seeded, and the Claude Code MCP connection is refreshed.');

  if (ownServer) {
    console.log('Dev server running at ' + BASE_URL + ' — press Ctrl+C to stop.');
    await new Promise((resolve) => ownServer.on('exit', resolve));
  }
}

main().catch((err) => {
  console.error(`\n[error] ${err.message}`);
  process.exitCode = 1;
});
