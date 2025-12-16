import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const findManyTool = {
  name: 'find_many',
  description:
    'Query multiple documents from a content type. Supports filtering, sorting, pagination, field selection, and population of relations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      uid: {
        type: 'string',
        description: "Content type UID (e.g., 'api::article.article')",
      },
      filters: {
        type: 'object',
        description: 'Filter conditions (e.g., { title: { $contains: "hello" } })',
      },
      populate: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
          { type: 'object' },
        ],
        description: 'Relations to populate (e.g., "*" for all, ["author", "category"], or { author: { fields: ["name"] } })',
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Fields to select (e.g., ["title", "content"])',
      },
      sort: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Sort order (e.g., "createdAt:desc" or ["title:asc", "createdAt:desc"])',
      },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Page number (starts at 1)' },
          pageSize: { type: 'number', description: 'Items per page' },
          start: { type: 'number', description: 'Offset (alternative to page)' },
          limit: { type: 'number', description: 'Max items (alternative to pageSize)' },
        },
        description: 'Pagination options',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published'],
        description: 'Document status filter',
      },
      locale: {
        type: 'string',
        description: 'Locale for i18n content',
      },
    },
    required: ['uid'],
  },
};

export async function handleFindMany(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('find_many', args);
  const { uid, ...params } = validatedArgs;

  // Validate content type exists
  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  if (!contentTypeService.isValidUid(uid)) {
    throw new Error(`Content type "${uid}" not found. Use list_content_types to see available content types.`);
  }

  const documentService = strapi.plugin('strapi-content-mcp').service('document');
  const results = await documentService.findMany(uid, params);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            data: results,
            count: Array.isArray(results) ? results.length : 0,
            uid,
          },
          null,
          2
        ),
      },
    ],
  };
}
