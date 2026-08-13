const { z } = require('zod');
const service = require('../../business-functions/businessFunction.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:BusinessFunction tools, wrapping the same
 * businessFunction.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_business_functions',
    {
      title: 'List business functions',
      description: 'List business functions (units of business behaviour that deliver capability, independent of organisational structure), optionally filtered by a free-text search over name/description.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_business_function',
    {
      title: 'Get a business function',
      description: 'Fetch a single business function by its id.',
      inputSchema: {
        id: z.string().describe('The business function\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
