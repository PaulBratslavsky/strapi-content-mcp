import { z } from 'zod';

// Schema for list_content_types tool (no parameters needed)
export const ListContentTypesSchema = z.object({});

// Schema for list_components tool
export const ListComponentsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(25),
  category: z.string().optional(),
});

// Schema for find_many tool
export const FindManySchema = z.object({
  uid: z.string().min(1, 'Content type UID is required'),
  filters: z.record(z.string(), z.any()).optional(),
  populate: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.any())]).optional(),
  fields: z.array(z.string()).optional(),
  sort: z.union([z.string(), z.array(z.string())]).optional(),
  pagination: z
    .object({
      page: z.number().int().min(1).optional(),
      pageSize: z.number().int().min(1).max(100).optional(),
      start: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  locale: z.string().optional(),
});

// Schema for find_one tool
export const FindOneSchema = z.object({
  uid: z.string().min(1, 'Content type UID is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  populate: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.any())]).optional(),
  fields: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  locale: z.string().optional(),
});

// Schema for create tool
export const CreateSchema = z.object({
  uid: z.string().min(1, 'Content type UID is required'),
  data: z.record(z.string(), z.any()),
  locale: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

// Schema for update tool
export const UpdateSchema = z.object({
  uid: z.string().min(1, 'Content type UID is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  data: z.record(z.string(), z.any()),
  locale: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

// Schema for delete tool
export const DeleteSchema = z.object({
  uid: z.string().min(1, 'Content type UID is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  locale: z.string().optional(),
});

// Schema for upload_media tool
export const UploadMediaSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().optional(),
  caption: z.string().optional(),
  alternativeText: z.string().optional(),
});

// Type exports
export type ListContentTypesInput = z.infer<typeof ListContentTypesSchema>;
export type ListComponentsInput = z.infer<typeof ListComponentsSchema>;
export type FindManyInput = z.infer<typeof FindManySchema>;
export type FindOneInput = z.infer<typeof FindOneSchema>;
export type CreateInput = z.infer<typeof CreateSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;
export type DeleteInput = z.infer<typeof DeleteSchema>;
export type UploadMediaInput = z.infer<typeof UploadMediaSchema>;

// All schemas for easy lookup
export const ToolSchemas = {
  list_content_types: ListContentTypesSchema,
  list_components: ListComponentsSchema,
  find_many: FindManySchema,
  find_one: FindOneSchema,
  create: CreateSchema,
  update: UpdateSchema,
  delete: DeleteSchema,
  upload_media: UploadMediaSchema,
} as const;

type ToolName = keyof typeof ToolSchemas;

// Validation helper function
export function validateToolInput<T extends ToolName>(
  toolName: T,
  input: unknown
): z.infer<(typeof ToolSchemas)[T]> {
  const schema = ToolSchemas[toolName];
  const result = schema.safeParse(input);

  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });
    throw new Error(`Validation failed for ${toolName}:\n${errorMessages.join('\n')}`);
  }

  return result.data as z.infer<(typeof ToolSchemas)[T]>;
}
