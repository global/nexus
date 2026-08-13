const { z } = require('zod');
const service = require('../../cost-records/costRecord.service');
const { safeHandler } = require('./helpers');
const { COST_CATEGORY_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:CostRecord tools, wrapping the same
 * costRecord.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_cost_records',
    {
      title: 'List cost records',
      description: 'List recorded costs incurred by applications, optionally filtered by application id, cost category, or fiscal year. Use this to answer total-cost-of-ownership questions — filter by incurredByApplication and sum costAmount, optionally grouped by hasCostCategory or fiscalYear.',
      inputSchema: {
        incurredByApplication: z.string().optional().describe('Application id to filter by'),
        hasCostCategory: z.enum(COST_CATEGORY_VALUES).optional(),
        fiscalYear: z.string().optional().describe('4-digit year, e.g. "2026"'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_cost_record',
    {
      title: 'Get a cost record',
      description: 'Fetch a single cost record by its id.',
      inputSchema: {
        id: z.string().describe('The cost record\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
