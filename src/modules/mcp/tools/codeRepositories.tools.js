const { z } = require('zod');
const service = require('../../code-repositories/codeRepository.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:CodeRepository tools, wrapping the same
 * codeRepository.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_code_repositories',
    {
      title: 'List code repositories',
      description: 'List source code repositories containing the implementation of applications, optionally filtered by a free-text search over name/url. Cross-reference with an application\'s `repositories` field to find the repositories for a specific application.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_code_repository',
    {
      title: 'Get a code repository',
      description: 'Fetch a single code repository by its id.',
      inputSchema: {
        id: z.string().describe('The code repository\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
