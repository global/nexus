const { z } = require('zod');
const service = require('../../service-level-agreements/serviceLevelAgreement.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:ServiceLevelAgreement tools, wrapping the same
 * serviceLevelAgreement.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_service_level_agreements',
    {
      title: 'List service level agreements',
      description: 'List service level agreements, optionally filtered by the application they apply to.',
      inputSchema: {
        appliesToApplication: z.string().optional().describe('Application id to filter by'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_service_level_agreement',
    {
      title: 'Get a service level agreement',
      description: 'Fetch a single service level agreement by its id.',
      inputSchema: {
        id: z.string().describe('The service level agreement\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
