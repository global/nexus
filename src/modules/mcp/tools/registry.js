const applicationsTools = require('./applications.tools');
const actorsTools = require('./actors.tools');
const organizationUnitsTools = require('./organizationUnits.tools');
const businessCapabilitiesTools = require('./businessCapabilities.tools');
const suppliersTools = require('./suppliers.tools');
const controlsTools = require('./controls.tools');
const findingsTools = require('./findings.tools');

const MODULES = [
  applicationsTools,
  actorsTools,
  organizationUnitsTools,
  businessCapabilitiesTools,
  suppliersTools,
  controlsTools,
  findingsTools,
];

/**
 * Registers every read-only tool from each domain module onto the given
 * McpServer instance.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function registerAllTools(server) {
  for (const mod of MODULES) {
    mod.register(server);
  }
}

module.exports = { registerAllTools };
