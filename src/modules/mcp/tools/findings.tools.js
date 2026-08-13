const { z } = require('zod');
const service = require('../../findings/finding.service');
const { safeHandler } = require('./helpers');
const { FINDING_CATEGORY_VALUES, FINDING_STATUS_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:Finding tools, wrapping the same
 * finding.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_findings',
    {
      title: 'List findings',
      description: 'List findings (vulnerabilities, technical/business risks, or control gaps), optionally filtered by category, status, the affected application id, or a free-text search over the finding details/CVE id.',
      inputSchema: {
        findingCategory: z.enum(FINDING_CATEGORY_VALUES).optional(),
        findingStatus: z.enum(FINDING_STATUS_VALUES).optional(),
        application: z.string().optional().describe('Application id to filter by'),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_finding',
    {
      title: 'Get a finding',
      description: 'Fetch a single finding by its id.',
      inputSchema: {
        id: z.string().describe('The finding\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
