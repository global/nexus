const { z } = require('zod');
const service = require('../../controls/control.service');
const { safeHandler } = require('./helpers');
const { COMPLIANCE_STANDARD_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:Control tools, wrapping the same
 * control.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_controls',
    {
      title: 'List controls',
      description: 'List controls (safeguards or measures implemented to mitigate risk or satisfy a compliance requirement), optionally filtered by a compliance standard they support or a free-text search over name/description/control reference.',
      inputSchema: {
        supportsComplianceStandard: z.enum(COMPLIANCE_STANDARD_VALUES).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_control',
    {
      title: 'Get a control',
      description: 'Fetch a single control by its id.',
      inputSchema: {
        id: z.string().describe('The control\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
