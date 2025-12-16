import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const createTool = {
  name: 'create',
  description: 'Create a new document in a content type. This is a write operation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      uid: {
        type: 'string',
        description: "Content type UID (e.g., 'api::article.article')",
      },
      data: {
        type: 'object',
        description: 'The data for the new document. Must match the content type schema.',
      },
      locale: {
        type: 'string',
        description: 'Locale for i18n content',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published'],
        description: 'Initial document status',
      },
    },
    required: ['uid', 'data'],
  },
};

export async function handleCreate(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('create', args);
  const { uid, data, locale, status } = validatedArgs;

  // Validate content type exists
  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  if (!contentTypeService.isValidUid(uid)) {
    throw new Error(`Content type "${uid}" not found. Use list_content_types to see available content types.`);
  }

  const documentService = strapi.plugin('strapi-content-mcp').service('document');
  const result = await documentService.create(uid, data, { locale, status });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: true,
            data: result,
            uid,
            message: 'Document created successfully',
          },
          null,
          2
        ),
      },
    ],
  };
}
