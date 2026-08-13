const { z } = require('zod');
const service = require('../../roles/role.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:Role tools, wrapping the same role.service.js
 * used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_roles',
    {
      title: 'List roles',
      description: 'List roles (the function an actor performs, independent of who fulfils it, such as CTO or Application Owner), optionally filtered by a free-text search over name/description.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_role',
    {
      title: 'Get a role',
      description: 'Fetch a single role by its id.',
      inputSchema: {
        id: z.string().describe('The role\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
