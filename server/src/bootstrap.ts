import type { Core } from '@strapi/strapi';
import { createMcpServer } from './mcp/server';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get('plugin.strapi-content-mcp', { enabled: true });

  if (!config.enabled) {
    strapi.log.info('[strapi-content-mcp] Plugin disabled by configuration');
    return;
  }

  // Store the server factory function - we'll create server+transport per session
  const plugin = strapi.plugin('strapi-content-mcp') as any;
  plugin.createMcpServer = () => createMcpServer(strapi);
  plugin.sessions = new Map(); // Track active sessions

  strapi.log.info('[strapi-content-mcp] MCP plugin initialized');
  strapi.log.info('[strapi-content-mcp] MCP endpoint available at: /api/strapi-content-mcp/mcp');
};

export default bootstrap;
