# Strapi Content MCP

A Strapi v5 plugin that exposes your content via the Model Context Protocol (MCP), enabling AI assistants like Claude to interact directly with your Strapi content.

## Features

- **Direct Strapi Integration** - Uses Strapi's internal Document Service API
- **HTTP/SSE Transport** - Standard HTTP endpoint for MCP communication
- **8 MCP Tools** - Full CRUD operations plus media upload
- **Authentication Support** - Route-level auth via Strapi policies
- **Strapi v5 Compatible** - Built for the latest Strapi version

## Quick Start

### 1. Install

Copy to your Strapi project:

```bash
cp -r strapi-content-mcp /path/to/strapi/src/plugins/
```

### 2. Configure

Add to `config/plugins.ts`:

```typescript
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      logLevel: 'info',
    },
  },
};
```

### 3. Build & Start

```bash
yarn build
yarn develop
```

### 4. Connect Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp"
    }
  }
}
```

Restart Claude Desktop and start chatting with your Strapi content!

## Available Tools

| Tool | Description |
|------|-------------|
| `list_content_types` | List all content types with schemas |
| `list_components` | List components with pagination |
| `find_many` | Query documents with filters, sort, pagination |
| `find_one` | Get single document by ID |
| `create` | Create new document |
| `update` | Update existing document |
| `delete` | Delete document |
| `upload_media` | Upload media from URL |

## Documentation

- [Installation & Setup](./docs/SETUP.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Tools Reference](./docs/TOOLS.md)
- [Claude Desktop Integration](./docs/CLAUDE-DESKTOP.md)

## Example Usage

Once connected, ask Claude:

- "List all content types in Strapi"
- "Find all published articles"
- "Create a new blog post titled 'Hello World'"
- "Update article abc123 to change the title"
- "Upload this image to Strapi"

## Requirements

- Strapi v5.x
- Node.js 18+

## License

MIT

## Contributing

Contributions welcome! Please read the documentation before submitting PRs.
