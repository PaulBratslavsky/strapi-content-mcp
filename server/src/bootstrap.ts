import type { Core } from '@strapi/strapi';
import { createMcpServer } from './mcp/server';

const PLUGIN_ID = 'strapi-content-mcp';
const OAUTH_PLUGIN_ID = 'strapi-oauth-mcp-manager';

/**
 * Fallback auth middleware for when OAuth manager plugin is not installed.
 * Requires Bearer token (Strapi API token) for MCP endpoints.
 * This allows standalone use with Claude Desktop without OAuth.
 */
function createFallbackAuthMiddleware(strapi: Core.Strapi) {
  const mcpPath = `/api/${PLUGIN_ID}/mcp`;

  return async (ctx: any, next: () => Promise<void>) => {
    // Only apply to this plugin's MCP endpoint
    if (!ctx.path.startsWith(mcpPath)) {
      return next();
    }

    const authHeader = ctx.request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = {
        error: 'Unauthorized',
        message: 'Bearer token required. Provide a Strapi API token.',
      };
      return;
    }

    // Extract token and set it for the controller
    const token = authHeader.slice(7);
    ctx.state.strapiToken = token;
    ctx.state.authMethod = 'api-token';

    return next();
  };
}

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get(`plugin.${PLUGIN_ID}`, { enabled: true });

  if (!config.enabled) {
    strapi.log.info(`[${PLUGIN_ID}] Plugin disabled by configuration`);
    return;
  }

  // Store the server factory function - we'll create server+transport per session
  const plugin = strapi.plugin(PLUGIN_ID) as any;
  plugin.createMcpServer = () => createMcpServer(strapi);
  plugin.sessions = new Map(); // Track active sessions

  // Check if OAuth manager is installed
  // If not, use fallback auth middleware (API token only)
  const oauthPlugin = strapi.plugin(OAUTH_PLUGIN_ID);

  if (oauthPlugin) {
    // OAuth manager handles auth via convention-based middleware
    // Any /api/*/mcp route is automatically protected
    strapi.log.info(`[${PLUGIN_ID}] OAuth manager detected - OAuth + API token auth enabled`);
  } else {
    // No OAuth manager - use fallback auth
    const fallbackMiddleware = createFallbackAuthMiddleware(strapi);
    strapi.server.use(fallbackMiddleware);
    strapi.log.info(`[${PLUGIN_ID}] Using API token authentication (OAuth manager not installed)`);
  }

  strapi.log.info(`[${PLUGIN_ID}] MCP endpoint available at: /api/${PLUGIN_ID}/mcp`);
};

export default bootstrap;
