const { z } = require('zod');
const service = require('../../data-entities/dataEntity.service');
const { safeHandler } = require('./helpers');
const { DATA_SENSITIVITY_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:DataEntity tools, wrapping the same
 * dataEntity.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_data_entities',
    {
      title: 'List data entities',
      description: 'List data entities (business-recognised concepts of data, independent of implementation), optionally filtered by a data sensitivity classification or a free-text search over name/description. Cross-reference with an application\'s `dataEntities` field to find the data an application handles.',
      inputSchema: {
        hasDataSensitivity: z.enum(DATA_SENSITIVITY_VALUES).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_data_entity',
    {
      title: 'Get a data entity',
      description: 'Fetch a single data entity by its id.',
      inputSchema: {
        id: z.string().describe('The data entity\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
