const { z } = require('zod');
const service = require('../../metrics/metric.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:Metric tools, wrapping the same
 * metric.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_metrics',
    {
      title: 'List metrics',
      description: 'List metrics (the unit used to measure a software entitlement, such as per-user or per-device, per ISO/IEC 19770-3), optionally filtered by a free-text search over name/description.',
      inputSchema: {
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_metric',
    {
      title: 'Get a metric',
      description: 'Fetch a single metric by its id.',
      inputSchema: {
        id: z.string().describe('The metric\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
