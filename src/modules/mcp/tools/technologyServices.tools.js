const { z } = require('zod');
const service = require('../../technology-services/technologyService.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:TechnologyService tools, wrapping the same
 * technologyService.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_technology_services',
    {
      title: 'List technology services',
      description: 'List technology services (technical capabilities supporting application and infrastructure services), optionally filtered by a free-text search over name/description.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_technology_service',
    {
      title: 'Get a technology service',
      description: 'Fetch a single technology service by its id.',
      inputSchema: {
        id: z.string().describe('The technology service\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
