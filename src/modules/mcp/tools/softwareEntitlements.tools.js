const { z } = require('zod');
const service = require('../../software-entitlements/softwareEntitlement.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:SoftwareEntitlement tools, wrapping the same
 * softwareEntitlement.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_software_entitlements',
    {
      title: 'List software entitlements',
      description: 'List software entitlements (the legal usage rights held for a software asset, per ISO/IEC 19770-3, expressed as a quantity against a metric), optionally filtered by the metric they are measured against.',
      inputSchema: {
        measuredByMetric: z.string().optional().describe('Metric id to filter by'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_software_entitlement',
    {
      title: 'Get a software entitlement',
      description: 'Fetch a single software entitlement by its id.',
      inputSchema: {
        id: z.string().describe('The software entitlement\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
