import type { Core } from '@strapi/strapi';

export interface FindParams {
  filters?: Record<string, any>;
  populate?: string | string[] | Record<string, any>;
  fields?: string[];
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

export interface FindOneParams {
  populate?: string | string[] | Record<string, any>;
  fields?: string[];
  status?: 'draft' | 'published';
  locale?: string;
}

const documentService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Find multiple documents
   */
  async findMany(uid: string, params: FindParams = {}) {
    const { filters, populate, fields, sort, pagination, status, locale } = params;

    // Build query options - must use either page/pageSize OR start/limit, not both
    const queryOptions: Record<string, any> = {
      filters,
      populate,
      fields,
      sort,
      status,
      locale,
    };

    // Prefer page/pageSize pagination if provided
    if (pagination?.page !== undefined && pagination?.pageSize !== undefined) {
      queryOptions.page = pagination.page;
      queryOptions.pageSize = pagination.pageSize;
    } else if (pagination?.start !== undefined || pagination?.limit !== undefined) {
      // Use offset pagination
      if (pagination?.start !== undefined) queryOptions.start = pagination.start;
      if (pagination?.limit !== undefined) queryOptions.limit = pagination.limit;
    }

    return strapi.documents(uid as any).findMany(queryOptions);
  },

  /**
   * Find a single document by documentId
   */
  async findOne(uid: string, documentId: string, params: FindOneParams = {}) {
    const { populate, fields, status, locale } = params;

    return strapi.documents(uid as any).findOne({
      documentId,
      populate: populate as any,
      fields,
      status,
      locale,
    });
  },

  /**
   * Create a new document
   */
  async create(uid: string, data: Record<string, any>, options: { locale?: string; status?: 'draft' | 'published' } = {}) {
    return strapi.documents(uid as any).create({
      data,
      locale: options.locale,
      status: options.status,
    });
  },

  /**
   * Update an existing document
   */
  async update(uid: string, documentId: string, data: Record<string, any>, options: { locale?: string; status?: 'draft' | 'published' } = {}) {
    return strapi.documents(uid as any).update({
      documentId,
      data,
      locale: options.locale,
      status: options.status,
    });
  },

  /**
   * Delete a document
   */
  async delete(uid: string, documentId: string, options: { locale?: string } = {}) {
    return strapi.documents(uid as any).delete({
      documentId,
      locale: options.locale,
    });
  },

  /**
   * Count documents matching filters
   */
  async count(uid: string, filters?: Record<string, any>) {
    return strapi.documents(uid as any).count({
      filters,
    });
  },
});

export default documentService;
