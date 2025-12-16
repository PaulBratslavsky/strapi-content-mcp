import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const listComponentsTool = {
  name: 'list_components',
  description:
    'List all components in Strapi with pagination support. Components are reusable field groups that can be used across content types.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      page: {
        type: 'number',
        description: 'Page number (starts at 1)',
        default: 1,
      },
      pageSize: {
        type: 'number',
        description: 'Number of items per page (max 100)',
        default: 25,
      },
      category: {
        type: 'string',
        description: 'Filter by component category',
      },
    },
    required: [] as string[],
  },
};

export async function handleListComponents(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('list_components', args);
  const { page = 1, pageSize = 25, category } = validatedArgs;

  const componentService = strapi.plugin('strapi-content-mcp').service('component');

  if (category) {
    const components = componentService.getByCategory(category);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              data: components,
              category,
              count: components.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const result = componentService.getAll(page, pageSize);
  const categories = componentService.getCategories();

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            ...result,
            categories,
          },
          null,
          2
        ),
      },
    ],
  };
}
