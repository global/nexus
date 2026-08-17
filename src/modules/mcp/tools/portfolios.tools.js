const { z } = require('zod');
const service = require('../../portfolios/portfolio.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:Portfolio tools, wrapping the same
 * portfolio.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_portfolios',
    {
      title: 'List portfolios',
      description: 'List portfolios (curated groupings of applications managed together for strategic, budgetary, or governance purposes), optionally filtered by owner, aligned business capability, a contained application, or a free-text search over name/description.',
      inputSchema: {
        portfolioOwner: z.string().optional().describe('Actor id to filter by'),
        alignsToCapability: z.string().optional().describe('BusinessCapability id to filter by'),
        containsApplication: z.string().optional().describe('Application id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_portfolio',
    {
      title: 'Get a portfolio',
      description: 'Fetch a single portfolio by its id.',
      inputSchema: {
        id: z.string().describe('The portfolio\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
