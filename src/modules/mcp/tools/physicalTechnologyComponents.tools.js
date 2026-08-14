const { z } = require('zod');
const service = require('../../physical-technology-components/physicalTechnologyComponent.service');
const { safeHandler } = require('./helpers');
const { ENVIRONMENT_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:PhysicalTechnologyComponent tools, wrapping the
 * same physicalTechnologyComponent.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_physical_technology_components',
    {
      title: 'List physical technology components',
      description: 'List physical technology components (deployable technology products, such as servers or network devices, that realise a logical technology component), optionally filtered by environment, the logical component they realize, or a free-text search over name/description/assetIdentifier.',
      inputSchema: {
        hasEnvironment: z.enum(ENVIRONMENT_VALUES).optional(),
        realizesLogicalTechnologyComponent: z.string().optional().describe('LogicalTechnologyComponent id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_physical_technology_component',
    {
      title: 'Get a physical technology component',
      description: 'Fetch a single physical technology component by its id.',
      inputSchema: {
        id: z.string().describe('The physical technology component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
