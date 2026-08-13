const { z } = require('zod');
const service = require('../../organization-units/organizationUnit.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:OrganizationUnit tools, wrapping the same
 * organizationUnit.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_organization_units',
    {
      title: 'List organization units',
      description: 'List organization units, optionally filtered by location id or a free-text search over name/description.',
      inputSchema: {
        location: z.string().optional().describe('Location id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_organization_unit',
    {
      title: 'Get an organization unit',
      description: 'Fetch a single organization unit by its id.',
      inputSchema: {
        id: z.string().describe('The organization unit\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
