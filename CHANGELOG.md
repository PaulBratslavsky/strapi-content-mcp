# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-16

### Added

- Initial release
- **8 MCP Tools**:
  - `list_content_types` - List all content types with schemas
  - `list_components` - List components with pagination
  - `find_many` - Query documents with filters, sort, pagination
  - `find_one` - Get single document by documentId
  - `create` - Create new document
  - `update` - Update existing document
  - `delete` - Delete document
  - `upload_media` - Upload media from URL
- HTTP/SSE transport via StreamableHTTPServerTransport
- Input sanitization for write operations
- Output sanitization for read operations
- Fail-closed security model (reject on sanitization failure)
- Session-based MCP server instances
- Strapi v5 Document Service API integration
- Configurable logging levels

### Security

- All output data is sanitized using Strapi's contentAPI sanitizer
- All input data is sanitized before database writes
- Operations fail safely if sanitization cannot be completed
