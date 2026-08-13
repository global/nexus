const { z } = require('zod');
const service = require('../../business-processes/businessProcess.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:BusinessProcess tools, wrapping the same
 * businessProcess.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_business_processes',
    {
      title: 'List business processes',
      description: 'List business processes (sequences of activities that realise one or more business functions), optionally filtered by the business function they realize or a free-text search over name/description.',
      inputSchema: {
        realizesFunction: z.string().optional().describe('BusinessFunction id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_business_process',
    {
      title: 'Get a business process',
      description: 'Fetch a single business process by its id.',
      inputSchema: {
        id: z.string().describe('The business process\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
