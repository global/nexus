const { z } = require('zod');
const service = require('../../locations/location.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:Location tools, wrapping the same
 * location.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_locations',
    {
      title: 'List locations',
      description: 'List locations (places where business activities are performed or architecture elements operate), optionally filtered by a free-text search over name/description/address.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_location',
    {
      title: 'Get a location',
      description: 'Fetch a single location by its id.',
      inputSchema: {
        id: z.string().describe('The location\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
