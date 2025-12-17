import type { Core } from '@strapi/strapi';

/**
 * Sanitize output data using Strapi's content API sanitizer
 * This removes private fields, applies field-level permissions, and filters based on auth
 *
 * SECURITY: Throws an error if sanitization fails - never returns unsanitized data
 */
export async function sanitizeOutput(
  strapi: Core.Strapi,
  uid: string,
  data: any,
  auth?: { credentials?: any; ability?: any }
): Promise<any> {
  if (!data) return data;

  const contentType = strapi.contentType(uid as any);
  if (!contentType) {
    throw new Error(`Content type "${uid}" not found. Cannot sanitize output.`);
  }

  try {
    const sanitized = await strapi.contentAPI.sanitize.output(data, contentType, { auth });
    return sanitized;
  } catch (error) {
    strapi.log.error('[strapi-content-mcp] Output sanitization failed', {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Failed to sanitize output for "${uid}". Data not returned for security.`);
  }
}

/**
 * Sanitize input data before writing to database
 *
 * SECURITY: Throws an error if sanitization fails - never writes unsanitized data
 */
export async function sanitizeInput(
  strapi: Core.Strapi,
  uid: string,
  data: any,
  auth?: { credentials?: any; ability?: any }
): Promise<any> {
  if (!data) return data;

  const contentType = strapi.contentType(uid as any);
  if (!contentType) {
    throw new Error(`Content type "${uid}" not found. Cannot sanitize input.`);
  }

  try {
    const sanitized = await strapi.contentAPI.sanitize.input(data, contentType, { auth });
    return sanitized;
  } catch (error) {
    strapi.log.error('[strapi-content-mcp] Input sanitization failed', {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Failed to sanitize input for "${uid}". Write operation aborted for security.`);
  }
}

/**
 * Sanitize query parameters (filters, populate, fields, sort)
 *
 * SECURITY: Throws an error if sanitization fails - never executes unsanitized queries
 */
export async function sanitizeQuery(
  strapi: Core.Strapi,
  uid: string,
  query: any,
  auth?: { credentials?: any; ability?: any }
): Promise<any> {
  if (!query) return query;

  const contentType = strapi.contentType(uid as any);
  if (!contentType) {
    throw new Error(`Content type "${uid}" not found. Cannot sanitize query.`);
  }

  try {
    const sanitized = await strapi.contentAPI.sanitize.query(query, contentType, { auth });
    return sanitized;
  } catch (error) {
    strapi.log.error('[strapi-content-mcp] Query sanitization failed', {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Failed to sanitize query for "${uid}". Query not executed for security.`);
  }
}
