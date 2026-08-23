const { z } = require('zod');
const service = require('../../dependency-intelligence/dependencyIntelligence.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only Dependency Intelligence Engine (O4) tools, wrapping
 * the same dependencyIntelligence.service.js used by the REST controller
 * — breadth-first "blast radius" reachability plus depth-first circular-
 * dependency detection over the ApplicationDependency/TechnologyDependency
 * graphs.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'get_application_blast_radius',
    {
      title: 'Get an application\'s dependency blast radius',
      description: 'Breadth-first traversal of the ApplicationDependency graph from a given application: every application transitively downstream of it, with the shortest-hop-count distance to each, and whether the traversed subgraph contains a circular dependency. Use this to answer "what would be affected if this application went down?" questions.',
      inputSchema: {
        id: z.string().describe('The starting application\'s MongoDB id'),
        maxDepth: z.number().int().positive().optional().describe('Maximum number of hops to traverse; omit for the full, unbounded blast radius'),
      },
    },
    safeHandler(({ id, maxDepth }) => service.getApplicationBlastRadius(id, { maxDepth }))
  );

  server.registerTool(
    'get_technology_blast_radius',
    {
      title: 'Get a technology component\'s dependency blast radius',
      description: 'Breadth-first traversal of the TechnologyDependency graph from a given physical technology component: every component transitively downstream of it, with the shortest-hop-count distance to each, and whether the traversed subgraph contains a circular dependency. Use this to answer "what would be affected if this server/component had an outage?" questions.',
      inputSchema: {
        id: z.string().describe('The starting physical technology component\'s MongoDB id'),
        maxDepth: z.number().int().positive().optional().describe('Maximum number of hops to traverse; omit for the full, unbounded blast radius'),
      },
    },
    safeHandler(({ id, maxDepth }) => service.getTechnologyBlastRadius(id, { maxDepth }))
  );
}

module.exports = { register };
