import type { Core } from '@strapi/strapi';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { tools, handleToolCall } from './tools';

/**
 * Create an MCP server instance configured with Strapi tools
 */
export function createMcpServer(strapi: Core.Strapi): Server {
  const server = new Server(
    {
      name: 'strapi-content-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register handler for listing available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    strapi.log.debug('[strapi-content-mcp] Listing tools');
    return { tools };
  });

  // Register handler for tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    strapi.log.debug(`[strapi-content-mcp] Tool call: ${request.params.name}`);
    return handleToolCall(strapi, request);
  });

  strapi.log.info('[strapi-content-mcp] MCP server created with tools:', {
    tools: tools.map((t) => t.name),
  });

  return server;
}
