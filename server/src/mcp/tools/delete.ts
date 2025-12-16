import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const deleteTool = {
  name: 'delete',
  description: 'Delete a document by its documentId. This is a destructive write operation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      uid: {
        type: 'string',
        description: "Content type UID (e.g., 'api::article.article')",
      },
      documentId: {
        type: 'string',
        description: 'The document ID to delete',
      },
      locale: {
        type: 'string',
        description: 'Locale for i18n content (deletes only this locale version)',
      },
    },
    required: ['uid', 'documentId'],
  },
};

export async function handleDelete(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('delete', args);
  const { uid, documentId, locale } = validatedArgs;

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

  const result = await documentService.delete(uid, documentId, { locale });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: true,
            data: result,
            uid,
            documentId,
            message: 'Document deleted successfully',
          },
          null,
          2
        ),
      },
    ],
  };
}
