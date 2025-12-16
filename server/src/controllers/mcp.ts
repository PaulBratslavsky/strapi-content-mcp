import type { Core } from '@strapi/strapi';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const mcpController = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Handle MCP requests (POST, GET, DELETE)
   * Creates a new server+transport per session for proper isolation
   */
  async handle(ctx: any) {
    const plugin = strapi.plugin('strapi-content-mcp') as any;

    if (!plugin.createMcpServer) {
      ctx.status = 503;
      ctx.body = {
        error: 'MCP plugin not initialized',
        message: 'The MCP plugin is not available. Check plugin configuration.',
      };
      return;
    }

    try {
      // Get or create session based on session ID header
      const sessionId = ctx.request.headers['mcp-session-id'] || randomUUID();
      let session = plugin.sessions.get(sessionId);

      if (!session) {
        // Create new server and transport for this session
        const server = plugin.createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
        });

        await server.connect(transport);

        session = { server, transport, createdAt: Date.now() };
        plugin.sessions.set(sessionId, session);

        strapi.log.debug(`[strapi-content-mcp] New session created: ${sessionId}`);
      }

      // Handle the request
      await session.transport.handleRequest(ctx.req, ctx.res, ctx.request.body);

      // Prevent Koa from handling response
      ctx.respond = false;
    } catch (error) {
      strapi.log.error('[strapi-content-mcp] Error handling MCP request', {
        error: error instanceof Error ? error.message : String(error),
        method: ctx.method,
        path: ctx.path,
      });

      if (!ctx.res.headersSent) {
        ctx.status = 500;
        ctx.body = {
          error: 'MCP request failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  },
});

export default mcpController;
