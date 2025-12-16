# MCP Tools Reference

This document describes all available MCP tools provided by the Strapi Content MCP plugin.

## Read Operations

These tools are safe to use and don't modify data.

### list_content_types

List all available content types in Strapi with their schemas.

**Parameters:** None

**Example Response:**
```json
{
  "contentTypes": [
    {
      "uid": "api::article.article",
      "apiID": "article",
      "schema": {
        "singularName": "article",
        "pluralName": "articles",
        "displayName": "Article",
        "kind": "collectionType",
        "attributes": {
          "title": { "type": "string", "required": true },
          "content": { "type": "richtext" },
          "author": { "type": "relation", "relation": "manyToOne", "target": "api::author.author" }
        }
      }
    }
  ],
  "count": 1
}
```

**Use Case:** Discover available content types before querying data.

---

### list_components

List all components with pagination support.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (starts at 1) |
| `pageSize` | number | 25 | Items per page (max 100) |
| `category` | string | - | Filter by component category |

**Example Request:**
```json
{
  "page": 1,
  "pageSize": 10,
  "category": "shared"
}
```

**Example Response:**
```json
{
  "data": [
    {
      "uid": "shared.seo",
      "category": "shared",
      "displayName": "SEO",
      "attributes": {
        "metaTitle": { "type": "string" },
        "metaDescription": { "type": "text" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "pageCount": 1
  },
  "categories": ["shared", "blocks"]
}
```

---

### find_many

Query multiple documents from a content type with filtering, sorting, and pagination.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | Yes | Content type UID (e.g., `api::article.article`) |
| `filters` | object | No | Filter conditions |
| `populate` | string/array/object | No | Relations to populate |
| `fields` | string[] | No | Fields to select |
| `sort` | string/string[] | No | Sort order |
| `pagination` | object | No | Pagination options |
| `status` | string | No | `draft` or `published` |
| `locale` | string | No | Locale for i18n content |

**Filter Examples:**

```json
// Exact match
{ "filters": { "title": "Hello World" } }

// Contains
{ "filters": { "title": { "$contains": "hello" } } }

// Greater than
{ "filters": { "price": { "$gt": 100 } } }

// Multiple conditions
{ "filters": { "$and": [{ "status": "published" }, { "price": { "$lt": 50 } }] } }
```

**Populate Examples:**

```json
// All relations
{ "populate": "*" }

// Specific relations
{ "populate": ["author", "category"] }

// Nested with field selection
{ "populate": { "author": { "fields": ["name", "email"] } } }
```

**Pagination Examples:**

```json
// Page-based
{ "pagination": { "page": 1, "pageSize": 10 } }

// Offset-based
{ "pagination": { "start": 0, "limit": 10 } }
```

**Sort Examples:**

```json
// Single field
{ "sort": "createdAt:desc" }

// Multiple fields
{ "sort": ["title:asc", "createdAt:desc"] }
```

**Full Example:**
```json
{
  "uid": "api::article.article",
  "filters": { "status": "published" },
  "populate": ["author", "category"],
  "fields": ["title", "slug", "publishedAt"],
  "sort": "publishedAt:desc",
  "pagination": { "page": 1, "pageSize": 10 }
}
```

---

### find_one

Get a single document by its documentId.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | Yes | Content type UID |
| `documentId` | string | Yes | The document ID |
| `populate` | string/array/object | No | Relations to populate |
| `fields` | string[] | No | Fields to select |
| `status` | string | No | `draft` or `published` |
| `locale` | string | No | Locale for i18n content |

**Example Request:**
```json
{
  "uid": "api::article.article",
  "documentId": "abc123def456",
  "populate": "*"
}
```

---

## Write Operations

These tools modify data. Use with caution.

### create

Create a new document in a content type.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | Yes | Content type UID |
| `data` | object | Yes | Document data |
| `locale` | string | No | Locale for i18n content |
| `status` | string | No | `draft` or `published` |

**Example Request:**
```json
{
  "uid": "api::article.article",
  "data": {
    "title": "My New Article",
    "content": "Article content here...",
    "slug": "my-new-article",
    "author": "author-document-id"
  },
  "status": "draft"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "xyz789",
    "title": "My New Article",
    "content": "Article content here...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Document created successfully"
}
```

---

### update

Update an existing document.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | Yes | Content type UID |
| `documentId` | string | Yes | Document ID to update |
| `data` | object | Yes | Fields to update |
| `locale` | string | No | Locale for i18n content |
| `status` | string | No | `draft` or `published` |

**Example Request:**
```json
{
  "uid": "api::article.article",
  "documentId": "abc123def456",
  "data": {
    "title": "Updated Title",
    "content": "Updated content..."
  }
}
```

**Note:** Only include fields you want to update. Other fields remain unchanged.

---

### delete

Delete a document by its documentId.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | string | Yes | Content type UID |
| `documentId` | string | Yes | Document ID to delete |
| `locale` | string | No | Delete only this locale version |

**Example Request:**
```json
{
  "uid": "api::article.article",
  "documentId": "abc123def456"
}
```

**Warning:** This permanently deletes the document. Use with caution.

---

### upload_media

Upload a media file from a URL to Strapi's media library.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the file to upload |
| `name` | string | No | Custom filename |
| `caption` | string | No | Caption for the media |
| `alternativeText` | string | No | Alt text for accessibility |

**Example Request:**
```json
{
  "url": "https://example.com/image.jpg",
  "name": "hero-image",
  "caption": "Hero image for homepage",
  "alternativeText": "A beautiful landscape"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "documentId": "media123",
    "name": "hero-image.jpg",
    "url": "/uploads/hero_image_abc123.jpg",
    "mime": "image/jpeg",
    "size": 125.5
  },
  "usage": {
    "tip": "Use the id or documentId to link this media to a content entry",
    "example": "update with data: { image: 42 }"
  }
}
```

**Linking Media to Content:**

After uploading, use the `update` tool to link the media:

```json
{
  "uid": "api::article.article",
  "documentId": "article-doc-id",
  "data": {
    "featuredImage": 42
  }
}
```

---

## Error Handling

All tools return errors in a consistent format:

```json
{
  "error": true,
  "message": "Content type \"api::invalid.invalid\" not found. Use list_content_types to see available content types.",
  "tool": "find_many"
}
```

Common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| Content type not found | Invalid UID | Use `list_content_types` to find correct UID |
| Document not found | Invalid documentId | Verify the document exists with `find_many` |
| Validation failed | Invalid input | Check parameter types and required fields |

---

## Best Practices

1. **Always start with `list_content_types`** to discover available content types and their schemas.

2. **Use `find_many` before `update` or `delete`** to verify the document exists and get the correct `documentId`.

3. **Populate relations sparingly** - only request the relations you need to reduce response size.

4. **Use pagination** for large datasets to avoid timeouts.

5. **Check field types** in the content type schema before creating or updating documents.
