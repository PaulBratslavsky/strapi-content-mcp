# Strapi Content MCP Plugin

A Strapi v5 plugin that exposes your Strapi content via the Model Context Protocol (MCP), enabling AI assistants like Claude to interact directly with your content.

## Overview

This plugin creates an MCP server that runs within your Strapi application, providing AI assistants with tools to:

- List and explore content types and components
- Query content with filters, sorting, and pagination
- Create, update, and delete content entries
- Upload media files

## Features

- **Direct Strapi Integration**: Uses Strapi's internal APIs for optimal performance
- **HTTP/SSE Transport**: Accessible via standard HTTP endpoints
- **Strapi v5 Compatible**: Built for Strapi v5's Document Service API
- **Authentication Support**: Configurable route-level authentication via Strapi policies
- **8 MCP Tools**: Comprehensive content management capabilities

## Quick Start

1. Install the plugin in your Strapi project
2. Configure in `config/plugins.ts`
3. Start Strapi
4. Connect Claude Desktop to `http://localhost:1337/api/strapi-content-mcp/mcp`

## Documentation

- [Installation & Setup](./SETUP.md)
- [Configuration Options](./CONFIGURATION.md)
- [MCP Tools Reference](./TOOLS.md)
- [Claude Desktop Integration](./CLAUDE-DESKTOP.md)

## Available Tools

| Tool | Description |
|------|-------------|
| `list_content_types` | List all content types with their schemas |
| `list_components` | List all components with pagination |
| `find_many` | Query multiple documents with filters |
| `find_one` | Get a single document by ID |
| `create` | Create a new document |
| `update` | Update an existing document |
| `delete` | Delete a document |
| `upload_media` | Upload media from URL |

## Requirements

- Strapi v5.x
- Node.js 18+

## License

MIT
