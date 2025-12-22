import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';
import { sanitizeOutput } from '../utils/sanitize';

// Fields that are typically large and should be excluded in summary mode
const LARGE_CONTENT_FIELDS = ['content', 'blocks', 'body', 'richText', 'markdown', 'html', 'rawContent'];

export const findManyTool = {
  name: 'find_many',
  description:
    'Query multiple documents from a content type. By default, returns summary fields only (excludes large content fields like "content", "blocks", "body"). Set includeContent=true to get full content. Use find_one for single document with full content.',
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
        description: 'Fields to select (e.g., ["title", "content"]). If specified, includeContent is ignored.',
      },
      includeContent: {
        type: 'boolean',
        description: 'Set to true to include large content fields (content, blocks, body). Default: false. Warning: may cause context overflow with multiple documents.',
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

/**
 * Recursively removes large content fields from an object
 */
function stripLargeFields(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripLargeFields);
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip large content fields
      if (LARGE_CONTENT_FIELDS.includes(key)) {
        continue;
      }
      result[key] = stripLargeFields(value);
    }
    return result;
  }

  return obj;
}

export async function handleFindMany(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('find_many', args);
  const { uid, includeContent, ...params } = validatedArgs;

  // Validate content type exists
  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  if (!contentTypeService.isValidUid(uid)) {
    throw new Error(`Content type "${uid}" not found. Use list_content_types to see available content types.`);
  }

  const documentService = strapi.plugin('strapi-content-mcp').service('document');
  const results = await documentService.findMany(uid, params);

  // Sanitize output to remove private fields and apply permissions
  let sanitizedResults = await sanitizeOutput(strapi, uid, results);

  // Strip large content fields unless explicitly requested or fields are specified
  const shouldStripContent = !includeContent && !params.fields;
  if (shouldStripContent) {
    sanitizedResults = stripLargeFields(sanitizedResults);
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            data: sanitizedResults,
            count: Array.isArray(sanitizedResults) ? sanitizedResults.length : 0,
            uid,
            ...(shouldStripContent && { note: 'Large content fields excluded. Use includeContent=true or find_one for full content.' }),
          },
          null,
          2
        ),
      },
    ],
  };
}
