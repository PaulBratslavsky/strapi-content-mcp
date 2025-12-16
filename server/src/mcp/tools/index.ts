import type { Core } from '@strapi/strapi';

// Import tool definitions and handlers
import { listContentTypesTool, handleListContentTypes } from './list-content-types';
import { listComponentsTool, handleListComponents } from './list-components';
import { findManyTool, handleFindMany } from './find-many';
import { findOneTool, handleFindOne } from './find-one';
import { createTool, handleCreate } from './create';
import { updateTool, handleUpdate } from './update';
import { deleteTool, handleDelete } from './delete';
import { uploadMediaTool, handleUploadMedia } from './upload-media';

// Export all tool definitions
export const tools = [
  listContentTypesTool,
  listComponentsTool,
  findManyTool,
  findOneTool,
  createTool,
  updateTool,
  deleteTool,
  uploadMediaTool,
];

// Tool handler registry
const toolHandlers: Record<string, (strapi: Core.Strapi, args: unknown) => Promise<any>> = {
  list_content_types: handleListContentTypes,
  list_components: handleListComponents,
  find_many: handleFindMany,
  find_one: handleFindOne,
  create: handleCreate,
  update: handleUpdate,
  delete: handleDelete,
  upload_media: handleUploadMedia,
};

/**
 * Handle a tool call by delegating to the appropriate handler
 */
export async function handleToolCall(
  strapi: Core.Strapi,
  request: { params: { name: string; arguments?: Record<string, unknown> } }
) {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const startTime = Date.now();
  try {
    const result = await handler(strapi, args || {});
    const duration = Date.now() - startTime;

    // Log successful execution
    strapi.log.debug(`[strapi-content-mcp] Tool ${name} executed successfully in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed execution
    strapi.log.error(`[strapi-content-mcp] Tool ${name} failed after ${duration}ms`, {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              error: true,
              message: error instanceof Error ? error.message : String(error),
              tool: name,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
