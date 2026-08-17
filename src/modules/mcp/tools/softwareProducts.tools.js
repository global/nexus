const { z } = require('zod');
const service = require('../../software-products/softwareProduct.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:SoftwareProduct tools, wrapping the same
 * softwareProduct.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_software_products',
    {
      title: 'List software products',
      description: 'List software products (software assets identified via a SWID tag, per ISO/IEC 19770-2), optionally filtered by supplier, covering entitlement, or a free-text search over name/SWID tag id. Use this together with endOfLifeDate/endOfSupportDate on each result to answer end-of-life/end-of-support exposure questions.',
      inputSchema: {
        suppliedBy: z.string().optional().describe('Supplier id to filter by'),
        coveredByEntitlement: z.string().optional().describe('SoftwareEntitlement id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_software_product',
    {
      title: 'Get a software product',
      description: 'Fetch a single software product by its id.',
      inputSchema: {
        id: z.string().describe('The software product\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
