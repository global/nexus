const { z } = require('zod');
const service = require('../../business-services/businessService.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:BusinessService tools, wrapping the same
 * businessService.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_business_services',
    {
      title: 'List business services',
      description: 'List business services (units of business functionality, exposed through a defined interface, that support a capability), optionally filtered by the capability they support or a free-text search over name/description.',
      inputSchema: {
        supportsCapability: z.string().optional().describe('BusinessCapability id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_business_service',
    {
      title: 'Get a business service',
      description: 'Fetch a single business service by its id.',
      inputSchema: {
        id: z.string().describe('The business service\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
