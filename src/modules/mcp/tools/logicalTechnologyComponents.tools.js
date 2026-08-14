const { z } = require('zod');
const service = require('../../logical-technology-components/logicalTechnologyComponent.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:LogicalTechnologyComponent tools, wrapping the
 * same logicalTechnologyComponent.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_logical_technology_components',
    {
      title: 'List logical technology components',
      description: 'List logical technology components (encapsulations of technology infrastructure, independent of vendor or product), optionally filtered by the technology service they provide or a free-text search over name/description.',
      inputSchema: {
        providesTechnologyService: z.string().optional().describe('TechnologyService id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_logical_technology_component',
    {
      title: 'Get a logical technology component',
      description: 'Fetch a single logical technology component by its id.',
      inputSchema: {
        id: z.string().describe('The logical technology component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
