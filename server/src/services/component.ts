import type { Core } from '@strapi/strapi';

export interface ComponentInfo {
  uid: string;
  category: string;
  displayName: string;
  attributes: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

const componentService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get all components with pagination
   */
  getAll(page: number = 1, pageSize: number = 25): PaginatedResult<ComponentInfo> {
    const components = strapi.components;
    const allComponents: ComponentInfo[] = [];

    for (const [uid, component] of Object.entries(components)) {
      allComponents.push({
        uid,
        category: component.category || '',
        displayName: component.info?.displayName || '',
        attributes: component.attributes || {},
      });
    }

    // Sort by category and displayName for consistent ordering
    allComponents.sort((a, b) => {
      const catCompare = a.category.localeCompare(b.category);
      if (catCompare !== 0) return catCompare;
      return a.displayName.localeCompare(b.displayName);
    });

    const total = allComponents.length;
    const pageCount = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allComponents.slice(start, end);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  },

  /**
   * Get a specific component by UID
   */
  getByUid(uid: string): ComponentInfo | null {
    const component = strapi.components[uid];
    if (!component) {
      return null;
    }

    return {
      uid,
      category: component.category || '',
      displayName: component.info?.displayName || '',
      attributes: component.attributes || {},
    };
  },

  /**
   * Get all components in a specific category
   */
  getByCategory(category: string): ComponentInfo[] {
    const components = strapi.components;
    const result: ComponentInfo[] = [];

    for (const [uid, component] of Object.entries(components)) {
      if (component.category === category) {
        result.push({
          uid,
          category: component.category || '',
          displayName: component.info?.displayName || '',
          attributes: component.attributes || {},
        });
      }
    }

    return result;
  },

  /**
   * Get all component categories
   */
  getCategories(): string[] {
    const components = strapi.components;
    const categories = new Set<string>();

    for (const component of Object.values(components)) {
      if (component.category) {
        categories.add(component.category);
      }
    }

    return Array.from(categories).sort();
  },

  /**
   * Check if a component UID is valid
   */
  isValidUid(uid: string): boolean {
    return uid in strapi.components;
  },
});

export default componentService;
