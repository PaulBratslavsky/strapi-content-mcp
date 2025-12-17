import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';
import { sanitizeOutput } from '../utils/sanitize';

export const findOneTool = {
  name: 'find_one',
  description: 'Get a single document by its documentId. Supports field selection and population of relations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      uid: {
        type: 'string',
        description: "Content type UID (e.g., 'api::article.article')",
      },
      documentId: {
        type: 'string',
        description: 'The document ID to retrieve',
      },
      populate: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
          { type: 'object' },
        ],
        description: 'Relations to populate',
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Fields to select',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published'],
        description: 'Document status',
      },
      locale: {
        type: 'string',
        description: 'Locale for i18n content',
      },
    },
    required: ['uid', 'documentId'],
  },
};

export async function handleFindOne(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('find_one', args);
  const { uid, documentId, ...params } = validatedArgs;

  // Validate content type exists
  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  if (!contentTypeService.isValidUid(uid)) {
    throw new Error(`Content type "${uid}" not found. Use list_content_types to see available content types.`);
  }

  const documentService = strapi.plugin('strapi-content-mcp').service('document');
  const result = await documentService.findOne(uid, documentId, params);

  if (!result) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              error: 'Document not found',
              uid,
              documentId,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Sanitize output to remove private fields and apply permissions
  const sanitizedResult = await sanitizeOutput(strapi, uid, result);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            data: sanitizedResult,
            uid,
            documentId,
          },
          null,
          2
        ),
      },
    ],
  };
}
