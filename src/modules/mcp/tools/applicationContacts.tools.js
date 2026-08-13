const { z } = require('zod');
const service = require('../../application-contacts/applicationContact.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:ApplicationContact tools, wrapping the same
 * applicationContact.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_application_contacts',
    {
      title: 'List application contacts',
      description: 'List assignments of actors to contact roles for applications (e.g. who is the CTO or Information Owner of a given application), optionally filtered by application id, contact actor id, or role id. Use this to answer "who are the accountable contacts for application X" questions.',
      inputSchema: {
        forApplication: z.string().optional().describe('Application id to filter by'),
        contactActor: z.string().optional().describe('Actor id to filter by'),
        contactRole: z.string().optional().describe('Role id to filter by'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_application_contact',
    {
      title: 'Get an application contact',
      description: 'Fetch a single application contact by its id.',
      inputSchema: {
        id: z.string().describe('The application contact\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
