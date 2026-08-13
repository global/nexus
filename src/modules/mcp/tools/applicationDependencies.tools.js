const { z } = require('zod');
const service = require('../../application-dependencies/applicationDependency.service');
const { safeHandler } = require('./helpers');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:ApplicationDependency tools, wrapping the same
 * applicationDependency.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_application_dependencies',
    {
      title: 'List application dependencies',
      description: 'List directed dependencies between applications, optionally filtered by upstream/downstream application id, protocol, or synchronicity. Use this to answer blast-radius questions like "what depends on application X" (downstreamApplication filter is not needed — filter by upstreamApplication) or "what does application X depend on" (filter by downstreamApplication).',
      inputSchema: {
        upstreamApplication: z.string().optional().describe('Upstream Application id to filter by — the application being relied upon'),
        downstreamApplication: z.string().optional().describe('Downstream Application id to filter by — the application that consumes the upstream application'),
        usesProtocol: z.enum(DEPENDENCY_PROTOCOL_VALUES).optional(),
        hasSynchronicity: z.enum(SYNCHRONICITY_VALUES).optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_application_dependency',
    {
      title: 'Get an application dependency',
      description: 'Fetch a single application dependency by its id.',
      inputSchema: {
        id: z.string().describe('The application dependency\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
