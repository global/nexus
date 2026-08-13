const { z } = require('zod');
const service = require('../../business-capabilities/businessCapability.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:BusinessCapability tools, wrapping the same
 * businessCapability.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_business_capabilities',
    {
      title: 'List business capabilities',
      description: 'List business capabilities, optionally filtered by parent capability id, capability level (1-3), or a free-text search over name/description.',
      inputSchema: {
        parentCapability: z.string().optional().describe('Parent BusinessCapability id to filter by'),
        capabilityLevel: z.number().int().min(1).max(3).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_business_capability',
    {
      title: 'Get a business capability',
      description: 'Fetch a single business capability by its id.',
      inputSchema: {
        id: z.string().describe('The business capability\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
