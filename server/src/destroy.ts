import type { Core } from '@strapi/strapi';

const destroy = async ({ strapi }: { strapi: Core.Strapi }) => {
  try {
    const plugin = strapi.plugin('strapi-content-mcp') as any;

    // Close all active sessions
    if (plugin.sessions) {
      for (const [sessionId, session] of plugin.sessions) {
        try {
          if (session.server) await session.server.close();
          if (session.transport) await session.transport.close();
        } catch (e) {
          strapi.log.warn(`[strapi-content-mcp] Error closing session ${sessionId}`);
        }
      }
      plugin.sessions.clear();
      strapi.log.info('[strapi-content-mcp] All MCP sessions closed');
    }

    // Clear references
    plugin.createMcpServer = null;
    plugin.sessions = null;
  } catch (error) {
    strapi.log.error('[strapi-content-mcp] Error during cleanup', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default destroy;
