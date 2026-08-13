const { z } = require('zod');
const service = require('../../documents/document.service');
const { safeHandler } = require('./helpers');
const { DOCUMENT_TYPE_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:Document tools, wrapping the same
 * document.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_documents',
    {
      title: 'List documents',
      description: 'List reference documents linked to applications (e.g. architecture or threat model documents), optionally filtered by document type or a free-text search over name/url. Cross-reference with an application\'s `documents` field to find the documents for a specific application.',
      inputSchema: {
        hasDocumentType: z.enum(DOCUMENT_TYPE_VALUES).optional(),
        search: z.string().optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_document',
    {
      title: 'Get a document',
      description: 'Fetch a single document by its id.',
      inputSchema: {
        id: z.string().describe('The document\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
