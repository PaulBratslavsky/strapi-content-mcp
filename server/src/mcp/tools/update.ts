import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';
import { sanitizeInput, sanitizeOutput } from '../utils/sanitize';

export const updateTool = {
  name: 'update',
  description: 'Update an existing document by its documentId. This is a write operation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      uid: {
        type: 'string',
        description: "Content type UID (e.g., 'api::article.article')",
      },
      documentId: {
        type: 'string',
        description: 'The document ID to update',
      },
      data: {
        type: 'object',
        description: 'The data to update. Only include fields you want to change.',
      },
      locale: {
        type: 'string',
        description: 'Locale for i18n content',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published'],
        description: 'New document status',
      },
    },
    required: ['uid', 'documentId', 'data'],
  },
};

export async function handleUpdate(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('update', args);
  const { uid, documentId, data, locale, status } = validatedArgs;

  // Validate content type exists
  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  if (!contentTypeService.isValidUid(uid)) {
    throw new Error(`Content type "${uid}" not found. Use list_content_types to see available content types.`);
  }

  const documentService = strapi.plugin('strapi-content-mcp').service('document');

  // Check if document exists
  const existing = await documentService.findOne(uid, documentId);
  if (!existing) {
    throw new Error(`Document with id "${documentId}" not found in "${uid}".`);
  }

  // Sanitize input data before updating
  const sanitizedData = await sanitizeInput(strapi, uid, data);

  const result = await documentService.update(uid, documentId, sanitizedData, { locale, status });

  // Sanitize output to remove private fields
  const sanitizedResult = await sanitizeOutput(strapi, uid, result);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: true,
            data: sanitizedResult,
            uid,
            documentId,
            message: 'Document updated successfully',
          },
          null,
          2
        ),
      },
    ],
  };
}
