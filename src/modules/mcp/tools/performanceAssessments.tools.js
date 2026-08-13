const { z } = require('zod');
const service = require('../../performance-assessments/performanceAssessment.service');
const { safeHandler } = require('./helpers');

/**
 * Registers read-only apm:PerformanceAssessment tools, wrapping the same
 * performanceAssessment.service.js used by the REST controller.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
function register(server) {
  server.registerTool(
    'list_performance_assessments',
    {
      title: 'List performance assessments',
      description: 'List point-in-time business/technical fit evaluations of applications, optionally filtered by application id or assessing actor id. Use this to see how an application\'s fit scores trend across assessment cycles — the evidentiary basis behind its investment strategy classification (Tolerate/Invest/Migrate/Eliminate).',
      inputSchema: {
        assessesApplication: z.string().optional().describe('Application id to filter by'),
        assessedBy: z.string().optional().describe('Actor id (assessor) to filter by'),
      },
    },
    safeHandler((args) => service.findAll(args))
  );

  server.registerTool(
    'get_performance_assessment',
    {
      title: 'Get a performance assessment',
      description: 'Fetch a single performance assessment by its id.',
      inputSchema: {
        id: z.string().describe('The performance assessment\'s MongoDB id'),
      },
    },
    safeHandler(({ id }) => service.findById(id))
  );
}

module.exports = { register };
