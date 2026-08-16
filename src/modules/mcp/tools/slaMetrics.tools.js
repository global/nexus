const { z } = require('zod');
const service = require('../../sla-metrics/slaMetric.service');
const { safeHandler } = require('./helpers');
const { SLA_CATEGORY_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:SLAMetric tools, wrapping the same
 * slaMetric.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_sla_metrics',
    {
      title: 'List SLA metrics',
      description: 'List SLA metrics (individual measurable commitments such as availability or response time targets), optionally filtered by SLA category.',
      inputSchema: {
        hasSLACategory: z.enum(SLA_CATEGORY_VALUES).optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_sla_metric',
    {
      title: 'Get an SLA metric',
      description: 'Fetch a single SLA metric by its id.',
      inputSchema: {
        id: z.string().describe('The SLA metric\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
