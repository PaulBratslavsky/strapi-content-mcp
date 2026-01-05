import type { Core } from '@strapi/strapi';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const PLUGIN_ID = 'strapi-content-mcp';

// Session timeout: 4 hours (Strapi Cloud may restart, so keep reasonable)
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000;

/**
 * Check if a session has expired
 */
function isSessionExpired(session: { createdAt: number }): boolean {
  return Date.now() - session.createdAt > SESSION_TIMEOUT_MS;
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(plugin: any, strapi: Core.Strapi): void {
  let cleaned = 0;
  for (const [sessionId, session] of plugin.sessions.entries()) {
    if (isSessionExpired(session)) {
      try {
        session.server.close();
      } catch {
        // Ignore close errors
      }
      plugin.sessions.delete(sessionId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    strapi.log.debug(`[${PLUGIN_ID}] Cleaned up ${cleaned} expired sessions`);
  }
}

/**
 * MCP Controller
 *
 * Handles MCP (Model Context Protocol) requests.
 * Authentication is handled by middleware (OAuth manager or fallback) which sets:
 * - ctx.state.strapiToken: The Strapi API token to use
 * - ctx.state.authMethod: 'oauth' or 'api-token'
 */
const mcpController = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Handle MCP requests (POST, GET, DELETE)
   * Authentication is handled by middleware
   * Creates a new server+transport per session for proper isolation
   */
  async handle(ctx: any) {
    const plugin = strapi.plugin(PLUGIN_ID) as any;

    if (!plugin.createMcpServer) {
      ctx.status = 503;
      ctx.body = {
        error: 'MCP plugin not initialized',
        message: 'The MCP plugin is not available. Check plugin configuration.',
      };
      return;
    }

    // Periodically clean up expired sessions (roughly every 100 requests)
    if (Math.random() < 0.01) {
      cleanupExpiredSessions(plugin, strapi);
    }

    try {
      // Get session ID from header
      const requestedSessionId = ctx.request.headers['mcp-session-id'];
      let session = requestedSessionId ? plugin.sessions.get(requestedSessionId) : null;

      // Check if session exists and is not expired
      if (session && isSessionExpired(session)) {
        strapi.log.debug(`[${PLUGIN_ID}] Session expired, removing: ${requestedSessionId}`);
        try {
          session.server.close();
        } catch {
          // Ignore close errors
        }
        plugin.sessions.delete(requestedSessionId);
        session = null;
      }

      // If client sent a session ID but session doesn't exist, return error to force re-init
      if (requestedSessionId && !session) {
        ctx.status = 400;
        ctx.body = {
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Session expired or invalid. Please reinitialize the connection.',
          },
          id: null,
        };
        return;
      }

      // Create new session if none exists
      if (!session) {
        const sessionId = randomUUID();
        const server = plugin.createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
        });

        await server.connect(transport);

        session = { server, transport, createdAt: Date.now(), strapiToken: ctx.state.strapiToken };
        plugin.sessions.set(sessionId, session);

        strapi.log.debug(`[${PLUGIN_ID}] New session created: ${sessionId} (auth: ${ctx.state.authMethod})`);
      }

      // Handle the request
      await session.transport.handleRequest(ctx.req, ctx.res, ctx.request.body);

      // Prevent Koa from handling response
      ctx.respond = false;
    } catch (error) {
      strapi.log.error(`[${PLUGIN_ID}] Error handling MCP request`, {
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
