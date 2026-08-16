const { z } = require('zod');
const service = require('../../logical-data-components/logicalDataComponent.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:LogicalDataComponent tools, wrapping the same
 * logicalDataComponent.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_logical_data_components',
    {
      title: 'List logical data components',
      description: 'List logical data components (structured groupings of data entities, independent of implementation), optionally filtered by a data entity they encapsulate or a free-text search over name/description.',
      inputSchema: {
        encapsulatesDataEntity: z.string().optional().describe('DataEntity id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_logical_data_component',
    {
      title: 'Get a logical data component',
      description: 'Fetch a single logical data component by its id.',
      inputSchema: {
        id: z.string().describe('The logical data component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
