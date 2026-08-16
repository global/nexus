const { z } = require('zod');
const service = require('../../physical-data-components/physicalDataComponent.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:PhysicalDataComponent tools, wrapping the same
 * physicalDataComponent.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_physical_data_components',
    {
      title: 'List physical data components',
      description: 'List physical data components (implementation-specific realisations of a logical data component, such as a database or file), optionally filtered by the logical data component they realize or a free-text search over name/description.',
      inputSchema: {
        realizesLogicalDataComponent: z.string().optional().describe('LogicalDataComponent id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_physical_data_component',
    {
      title: 'Get a physical data component',
      description: 'Fetch a single physical data component by its id.',
      inputSchema: {
        id: z.string().describe('The physical data component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
