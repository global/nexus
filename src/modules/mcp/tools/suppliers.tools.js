const { z } = require('zod');
const service = require('../../suppliers/supplier.service');
const { safeHandler } = require('./helpers');
const { COMPLIANCE_STANDARD_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:Supplier tools, wrapping the same
 * supplier.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_suppliers',
    {
      title: 'List suppliers',
      description: 'List third-party suppliers, optionally filtered by a held certification/compliance standard or a free-text search over name/description.',
      inputSchema: {
        certifications: z.enum(COMPLIANCE_STANDARD_VALUES).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_supplier',
    {
      title: 'Get a supplier',
      description: 'Fetch a single supplier by its id.',
      inputSchema: {
        id: z.string().describe('The supplier\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
