const { z } = require('zod');
const service = require('../../resource-utilization-records/resourceUtilizationRecord.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:ResourceUtilizationRecord tools, wrapping the
 * same resourceUtilizationRecord.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_resource_utilization_records',
    {
      title: 'List resource utilization records',
      description: 'List resource utilization records (recorded measurements of actual resource consumption for a software product over a specific period, per ISO/IEC 19770-4), optionally filtered by the software product measured or the metric measured against. Use this together with list_software_entitlements (entitledQuantity, filtered by the same metric) to answer actual-usage-versus-entitlement questions.',
      inputSchema: {
        measuresProduct: z.string().optional().describe('SoftwareProduct id to filter by'),
        measuredAgainstMetric: z.string().optional().describe('Metric id to filter by'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_resource_utilization_record',
    {
      title: 'Get a resource utilization record',
      description: 'Fetch a single resource utilization record by its id.',
      inputSchema: {
        id: z.string().describe('The resource utilization record\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
