const applicationsTools = require('./applications.tools');
const actorsTools = require('./actors.tools');
const organizationUnitsTools = require('./organizationUnits.tools');
const businessCapabilitiesTools = require('./businessCapabilities.tools');
const suppliersTools = require('./suppliers.tools');
const controlsTools = require('./controls.tools');
const findingsTools = require('./findings.tools');
const applicationDependenciesTools = require('./applicationDependencies.tools');
const costRecordsTools = require('./costRecords.tools');
const performanceAssessmentsTools = require('./performanceAssessments.tools');
const rolesTools = require('./roles.tools');
const applicationContactsTools = require('./applicationContacts.tools');
const locationsTools = require('./locations.tools');
const documentsTools = require('./documents.tools');
const codeRepositoriesTools = require('./codeRepositories.tools');
const businessFunctionsTools = require('./businessFunctions.tools');
const businessProcessesTools = require('./businessProcesses.tools');
const businessServicesTools = require('./businessServices.tools');

const MODULES = [
  applicationsTools,
  actorsTools,
  organizationUnitsTools,
  businessCapabilitiesTools,
  suppliersTools,
  controlsTools,
  findingsTools,
  applicationDependenciesTools,
  costRecordsTools,
  performanceAssessmentsTools,
  rolesTools,
  applicationContactsTools,
  locationsTools,
  documentsTools,
  codeRepositoriesTools,
  businessFunctionsTools,
  businessProcessesTools,
  businessServicesTools,
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
