const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { registerAllTools } = require('./tools/registry');

/**
 * Creates a Nexus Insight MCP server exposing read-only tools over the same
 * service layer the REST API's controllers use.
 *
 * @returns {McpServer}
 */
function createMcpServer() {
  const server = new McpServer({
    name: 'nexus-insight',
    version: '1.0.0',
  });

  registerAllTools(server);

  return server;
}

module.exports = { createMcpServer };
