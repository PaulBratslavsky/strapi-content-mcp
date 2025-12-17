# Strapi Content MCP

[![npm version](https://badge.fury.io/js/strapi-content-mcp.svg)](https://www.npmjs.com/package/strapi-content-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Strapi v5 plugin that exposes your content via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling AI assistants like Claude to interact directly with your Strapi content.

## Features

- **Direct Strapi Integration** - Uses Strapi's internal Document Service API with full sanitization
- **HTTP/SSE Transport** - Standard HTTP endpoint for MCP communication
- **8 MCP Tools** - Full CRUD operations plus media upload
- **Security First** - Input/output sanitization, route-level auth via Strapi policies
- **Strapi v5 Compatible** - Built for the latest Strapi version

## Installation

```bash
# Using npm
npm install strapi-content-mcp

# Using yarn
yarn add strapi-content-mcp
```

## Configuration

Add to your Strapi `config/plugins.ts` (or `config/plugins.js`):

```typescript
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      // Optional: Set log level (default: 'info')
      logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug' | 'trace'
    },
  },
};
```

Then rebuild and start Strapi:

```bash
yarn build
yarn develop
```

## Connecting Claude Desktop

Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strapi-content": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:1337/api/strapi-content-mcp/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop and start chatting with your Strapi content!

## Available Tools

| Tool | Description |
|------|-------------|
| `list_content_types` | List all content types with their schemas |
| `list_components` | List components with pagination |
| `find_many` | Query documents with filters, sort, pagination |
| `find_one` | Get single document by documentId |
| `create` | Create new document |
| `update` | Update existing document |
| `delete` | Delete document |
| `upload_media` | Upload media from URL |

## Example Usage

Once connected, ask Claude:

- "List all content types in Strapi"
- "Find all published articles"
- "Create a new blog post titled 'Hello World'"
- "Update article abc123 to change the title"
- "Upload this image to Strapi"

## Tool Examples

### Finding Documents

```
find_many with uid: "api::article.article"
- filters: { publishedAt: { $notNull: true } }
- sort: "createdAt:desc"
- pagination: { page: 1, pageSize: 10 }
- populate: ["author", "category"]
```

### Creating Documents

```
create with uid: "api::article.article"
- data: { title: "My Article", content: "Hello world" }
- status: "published"
```

## Security

This plugin includes several security measures:

- **Output Sanitization**: All data returned is sanitized to remove private fields
- **Input Sanitization**: All incoming data is sanitized before database writes
- **Fail-Closed**: If sanitization fails, operations are rejected (no unsanitized data exposed)

For production use, consider adding authentication:

```typescript
// config/plugins.ts
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      // Add route middleware for authentication
    },
  },
};
```

## Requirements

- Strapi v5.x
- Node.js 18+ (including Node.js 22, 24+)

## API Endpoint

The MCP endpoint is available at:
```
POST/GET/DELETE http://localhost:1337/api/strapi-content-mcp/mcp
```

## Troubleshooting

### Memory Issues

If you encounter heap memory errors during Strapi build:

```bash
NODE_OPTIONS='--max-old-space-size=8192' yarn build
NODE_OPTIONS='--max-old-space-size=8192' yarn develop
```

### Connection Issues

1. Ensure Strapi is running on the expected port
2. Check Claude Desktop config file syntax (valid JSON)
3. Restart Claude Desktop after config changes
4. Check Strapi logs for MCP-related errors

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT - see [LICENSE](./LICENSE) for details.

## Author

Paul Bratslavsky ([@PaulBratslavsky](https://github.com/PaulBratslavsky))
