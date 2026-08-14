const { z } = require('zod');
const service = require('../../technology-dependencies/technologyDependency.service');
const { safeHandler } = require('./helpers');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../../common/vocabularies');

/**
 * Registers read-only apm:TechnologyDependency tools, wrapping the same
 * technologyDependency.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_technology_dependencies',
    {
      title: 'List technology dependencies',
      description: 'List directed dependencies between physical technology components, optionally filtered by upstream/downstream component id, protocol, or synchronicity. Use this to answer outage blast-radius questions like "what depends on technology component X" (filter by upstreamTechnologyComponent) — combine with list_physical_application_components (deployedOn) and list_applications to trace an infrastructure outage through to the applications and business capabilities it affects.',
      inputSchema: {
        upstreamTechnologyComponent: z.string().optional().describe('Upstream PhysicalTechnologyComponent id to filter by — the component being relied upon'),
        downstreamTechnologyComponent: z.string().optional().describe('Downstream PhysicalTechnologyComponent id to filter by — the component that consumes the upstream component'),
        usesProtocol: z.enum(DEPENDENCY_PROTOCOL_VALUES).optional(),
        hasSynchronicity: z.enum(SYNCHRONICITY_VALUES).optional(),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_technology_dependency',
    {
      title: 'Get a technology dependency',
      description: 'Fetch a single technology dependency by its id.',
      inputSchema: {
        id: z.string().describe('The technology dependency\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
