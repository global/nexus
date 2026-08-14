const { z } = require('zod');
const service = require('../../logical-application-components/logicalApplicationComponent.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:LogicalApplicationComponent tools, wrapping the
 * same logicalApplicationComponent.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_logical_application_components',
    {
      title: 'List logical application components',
      description: 'List logical application components (encapsulations of application functionality, independent of vendor or technology), optionally filtered by a free-text search over name/description.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_logical_application_component',
    {
      title: 'Get a logical application component',
      description: 'Fetch a single logical application component by its id.',
      inputSchema: {
        id: z.string().describe('The logical application component\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
