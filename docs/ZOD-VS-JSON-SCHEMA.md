# Zod vs JSON Schema for MCP Tools

This document compares two approaches for defining input schemas in MCP (Model Context Protocol) tools: plain JSON Schema objects and Zod schemas.

## Overview

| Aspect | JSON Schema | Zod |
|--------|-------------|-----|
| Runtime validation | Manual | Built-in |
| TypeScript types | Manual | Inferred via `z.infer` |
| Bundle size | 0 KB | ~50 KB |
| Dependencies | None | `zod`, `zod-to-json-schema` |
| Learning curve | Low | Medium |

## Side-by-Side Comparison: `find_many` Tool

### JSON Schema Approach (Current)

```typescript
export const findManyTool = {
  name: 'find_many',
  description: 'Query multiple documents from a content type...',
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
        description: 'Relations to populate',
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Fields to select',
      },
      includeContent: {
        type: 'boolean',
        description: 'Include large content fields. Default: false.',
      },
      sort: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Sort order',
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

// Types must be defined separately
interface FindManyInput {
  uid: string;
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
  fields?: string[];
  includeContent?: boolean;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  status?: 'draft' | 'published';
  locale?: string;
}
```

### Zod Approach

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define schema once - get validation AND types
const paginationSchema = z.object({
  page: z.number().describe('Page number (starts at 1)').optional(),
  pageSize: z.number().describe('Items per page').optional(),
  start: z.number().describe('Offset (alternative to page)').optional(),
  limit: z.number().describe('Max items (alternative to pageSize)').optional(),
});

const findManyInputSchema = z.object({
  uid: z.string().describe("Content type UID (e.g., 'api::article.article')"),
  filters: z.record(z.unknown()).describe('Filter conditions').optional(),
  populate: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.unknown()),
  ]).describe('Relations to populate').optional(),
  fields: z.array(z.string()).describe('Fields to select').optional(),
  includeContent: z.boolean().describe('Include large content fields').default(false),
  sort: z.union([
    z.string(),
    z.array(z.string()),
  ]).describe('Sort order').optional(),
  pagination: paginationSchema.describe('Pagination options').optional(),
  status: z.enum(['draft', 'published']).describe('Document status filter').optional(),
  locale: z.string().describe('Locale for i18n content').optional(),
});

// Type is automatically inferred
type FindManyInput = z.infer<typeof findManyInputSchema>;

// Tool definition
export const findManyTool = {
  name: 'find_many',
  description: 'Query multiple documents from a content type...',
  inputSchema: zodToJsonSchema(findManyInputSchema),
};

// Runtime validation in handler
export async function handleFindMany(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = findManyInputSchema.parse(args); // Throws on invalid input
  // validatedArgs is fully typed as FindManyInput
}
```

## When to Use Each Approach

### Use JSON Schema When:

- **MCP tools with trusted input** - LLM clients respect the schema; malformed input is rare
- **Simple schemas** - Few fields, no complex validation
- **Minimal dependencies** - Bundle size matters
- **Strapi context** - Strapi already validates on write operations

### Use Zod When:

- **User-facing APIs** - REST endpoints, form inputs, external data
- **Type inference needed** - Want TypeScript types derived from schema
- **Complex validation** - Regex patterns, custom rules, refinements
- **Data transformation** - Need to coerce/transform input values
- **Shared schemas** - Same schema used in frontend and backend
- **Config parsing** - Environment variables, JSON config files

## Validation Examples

### Zod Runtime Validation

```typescript
// Detailed error messages
try {
  findManyInputSchema.parse({ uid: 123 }); // Wrong type
} catch (e) {
  // ZodError: Expected string, received number at "uid"
}

// Safe parsing (doesn't throw)
const result = findManyInputSchema.safeParse(input);
if (!result.success) {
  console.log(result.error.flatten());
}
```

### Zod Transformations

```typescript
const schema = z.object({
  createdAfter: z.string().transform(s => new Date(s)),
  limit: z.string().transform(s => parseInt(s, 10)),
});
// Input: { createdAfter: "2024-01-01", limit: "10" }
// Output: { createdAfter: Date, limit: 10 }
```

## Recommendation for This Project

**Keep JSON Schema** for MCP tool definitions because:

1. MCP clients already validate input against the schema
2. Strapi validates data on write operations
3. No additional dependencies needed
4. Direct mapping to MCP's expected format

Consider Zod if you later add:
- REST API endpoints exposed outside MCP
- Complex input transformations
- Shared validation between client and server
