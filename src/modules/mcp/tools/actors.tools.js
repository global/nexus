const { z } = require('zod');
const service = require('../../actors/actor.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:Actor tools, wrapping the same actor.service.js
 * used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_actors',
    {
      title: 'List actors',
      description: 'List actors (people, organizations, or systems that participate in business activities), optionally filtered by role id, organization unit id, or a free-text search over name/description.',
      inputSchema: {
        role: z.string().optional().describe('Role id to filter by'),
        organizationUnit: z.string().optional().describe('OrganizationUnit id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_actor',
    {
      title: 'Get an actor',
      description: 'Fetch a single actor by its id.',
      inputSchema: {
        id: z.string().describe('The actor\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
