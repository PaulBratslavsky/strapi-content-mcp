import type { Core } from '@strapi/strapi';

export interface MediaMetadata {
  name?: string;
  caption?: string;
  alternativeText?: string;
}

export interface UploadResult {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: Record<string, any> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

const mediaService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Upload media from a URL
   */
  async uploadFromUrl(url: string, metadata: MediaMetadata = {}): Promise<UploadResult[]> {
    // Fetch the image from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Extract filename from URL
    const urlPath = new URL(url).pathname;
    const originalFilename = urlPath.split('/').pop() || 'uploaded-file';

    // Use metadata name if provided, otherwise use original filename
    const filename = metadata.name || originalFilename;

    // Get the upload service
    const uploadService = strapi.plugins.upload.services.upload;

    // Create file info for upload
    const fileInfo = {
      name: filename,
      caption: metadata.caption || null,
      alternativeText: metadata.alternativeText || null,
    };

    // Create a file-like object for the upload service
    const file = {
      name: filename,
      type: contentType,
      size: buffer.length,
      buffer,
    };

    // Upload the file
    const uploadedFiles = await uploadService.upload({
      data: { fileInfo },
      files: file,
    });

    return uploadedFiles;
  },

  /**
   * Upload media from a buffer
   */
  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: MediaMetadata = {}
  ): Promise<UploadResult[]> {
    const uploadService = strapi.plugins.upload.services.upload;

    const fileInfo = {
      name: metadata.name || filename,
      caption: metadata.caption || null,
      alternativeText: metadata.alternativeText || null,
    };

    const file = {
      name: filename,
      type: mimeType,
      size: buffer.length,
      buffer,
    };

    const uploadedFiles = await uploadService.upload({
      data: { fileInfo },
      files: file,
    });

    return uploadedFiles;
  },

  /**
   * Get media file by ID
   */
  async findOne(id: number) {
    return strapi.documents('plugin::upload.file').findOne({
      documentId: String(id),
    });
  },

  /**
   * Find media files
   */
  async findMany(params: {
    filters?: Record<string, any>;
    pagination?: { page?: number; pageSize?: number };
    sort?: string | string[];
  } = {}) {
    const { filters, pagination, sort } = params;

    return strapi.documents('plugin::upload.file').findMany({
      filters,
      ...(pagination?.page && pagination?.pageSize
        ? { page: pagination.page, pageSize: pagination.pageSize }
        : {}),
      sort,
    } as any);
  },

  /**
   * Delete media file by ID
   */
  async delete(id: number) {
    const uploadService = strapi.plugins.upload.services.upload;
    const file = await strapi.db.query('plugin::upload.file').findOne({
      where: { id },
    });

    if (!file) {
      throw new Error(`Media file with id ${id} not found`);
    }

    return uploadService.remove(file);
  },
});

export default mediaService;
