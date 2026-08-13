const { z } = require('zod');
const service = require('../../applications/application.service');
const { safeHandler } = require('./helpers');
const {
  LIFECYCLE_STATUS_VALUES,
  CRITICALITY_TIER_VALUES,
  INVESTMENT_STRATEGY_VALUES,
  HOSTING_MODEL_VALUES,
  COMPLIANCE_STANDARD_VALUES,
} = require('../../../common/vocabularies');

/**
 * Registers read-only apm:Application tools, wrapping the same
 * application.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_applications',
    {
      title: 'List applications',
      description: 'List applications in the portfolio, optionally filtered by lifecycle status, criticality tier, investment strategy, hosting model, compliance standard, or a free-text search over name/description.',
      inputSchema: {
        lifecycleStatus: z.enum(LIFECYCLE_STATUS_VALUES).optional(),
        criticalityTier: z.enum(CRITICALITY_TIER_VALUES).optional(),
        investmentStrategy: z.enum(INVESTMENT_STRATEGY_VALUES).optional(),
        hostingModel: z.enum(HOSTING_MODEL_VALUES).optional(),
        complianceStandards: z.enum(COMPLIANCE_STANDARD_VALUES).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_application',
    {
      title: 'Get an application',
      description: 'Fetch a single application by its id.',
      inputSchema: {
        id: z.string().describe('The application\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );

  server.registerTool(
    'get_application_stats',
    {
      title: 'Application portfolio stats',
      description: 'Aggregate counts of applications by lifecycle status, criticality tier, and investment strategy, plus the total count.',
      inputSchema: {},
    },
    safeHandler(() => service.getStats())
  );
}

module.exports = { register };
