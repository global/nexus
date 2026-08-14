const { z } = require('zod');
const service = require('../../physical-application-components/physicalApplicationComponent.service');
const { safeHandler } = require('./helpers');
const { ENVIRONMENT_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:PhysicalApplicationComponent tools, wrapping the
 * same physicalApplicationComponent.service.js used by the REST
 * controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_physical_application_components',
    {
      title: 'List physical application components',
      description: 'List physical application components (deployable instances that realise a logical application component), optionally filtered by environment, the technology component they are deployed on, the logical component they realize, or a free-text search over name/description/assetIdentifier. Use `deployedOn` together with list_technology_dependencies to trace an infrastructure outage through to the applications it affects — cross-reference with an application\'s `deployments` field to find its physical instances.',
      inputSchema: {
        hasEnvironment: z.enum(ENVIRONMENT_VALUES).optional(),
        realizesLogicalComponent: z.string().optional().describe('LogicalApplicationComponent id to filter by'),
        deployedOn: z.string().optional().describe('PhysicalTechnologyComponent id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_physical_application_component',
    {
      title: 'Get a physical application component',
      description: 'Fetch a single physical application component by its id.',
      inputSchema: {
        id: z.string().describe('The physical application component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
