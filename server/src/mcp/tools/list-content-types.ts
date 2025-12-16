import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const listContentTypesTool = {
  name: 'list_content_types',
  description:
    'List all available content types in Strapi with their schemas, including field definitions and relationships.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [] as string[],
  },
};

export async function handleListContentTypes(strapi: Core.Strapi, args: unknown) {
  validateToolInput('list_content_types', args);

  const contentTypeService = strapi.plugin('strapi-content-mcp').service('content-type');
  const contentTypes = contentTypeService.getAll();

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            contentTypes,
            count: contentTypes.length,
            usage: {
              tip: 'Use the uid field when calling find_many, find_one, create, update, or delete tools',
              example: "find_many with uid: 'api::article.article'",
            },
          },
          null,
          2
        ),
      },
    ],
  };
}
