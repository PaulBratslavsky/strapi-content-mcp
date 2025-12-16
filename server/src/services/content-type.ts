import type { Core } from '@strapi/strapi';

export interface ContentTypeInfo {
  uid: string;
  apiID: string;
  schema: {
    singularName: string;
    pluralName: string;
    displayName: string;
    kind: string;
    attributes: Record<string, any>;
  };
  globalId: string;
  modelName: string;
}

const contentTypeService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get all content types from Strapi
   * Filters to only API content types (excludes admin, plugin, etc.)
   */
  getAll(): ContentTypeInfo[] {
    const contentTypes = strapi.contentTypes;
    const result: ContentTypeInfo[] = [];

    for (const [uid, contentType] of Object.entries(contentTypes)) {
      // Only include api:: content types (user-defined)
      if (uid.startsWith('api::')) {
        result.push({
          uid,
          apiID: contentType.info?.singularName || '',
          schema: {
            singularName: contentType.info?.singularName || '',
            pluralName: contentType.info?.pluralName || '',
            displayName: contentType.info?.displayName || '',
            kind: contentType.kind || 'collectionType',
            attributes: contentType.attributes || {},
          },
          globalId: contentType.globalId || '',
          modelName: contentType.modelName || '',
        });
      }
    }

    return result;
  },

  /**
   * Get a specific content type by UID
   */
  getByUid(uid: string): ContentTypeInfo | null {
    const contentType = strapi.contentTypes[uid];
    if (!contentType) {
      return null;
    }

    return {
      uid,
      apiID: contentType.info?.singularName || '',
      schema: {
        singularName: contentType.info?.singularName || '',
        pluralName: contentType.info?.pluralName || '',
        displayName: contentType.info?.displayName || '',
        kind: contentType.kind || 'collectionType',
        attributes: contentType.attributes || {},
      },
      globalId: contentType.globalId || '',
      modelName: contentType.modelName || '',
    };
  },

  /**
   * Check if a content type UID is valid
   */
  isValidUid(uid: string): boolean {
    return uid in strapi.contentTypes && uid.startsWith('api::');
  },
});

export default contentTypeService;
