# Claude Desktop Integration

This guide explains how to connect Claude Desktop to your Strapi Content MCP server.

## Prerequisites

1. Strapi application with the strapi-content-mcp plugin installed and running
2. Claude Desktop application installed
3. MCP endpoint accessible (default: `http://localhost:1337/api/strapi-content-mcp/mcp`)

## Configuration

### Step 1: Locate Claude Desktop Config File

The configuration file location depends on your operating system:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

### Step 2: Create or Edit Configuration

If the file doesn't exist, create it. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp"
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to apply the configuration.

## Configuration Options

### Basic Configuration

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp"
    }
  }
}
```

### With Authentication

If you've enabled authentication on the MCP endpoint:

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_STRAPI_API_TOKEN"
      }
    }
  }
}
```

To get an API token:
1. Open Strapi Admin Panel
2. Go to Settings > API Tokens
3. Create a new token with appropriate permissions
4. Copy the token to your config

### Custom Header Authentication

If using a custom authentication policy:

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp",
      "headers": {
        "X-MCP-Token": "your-secret-token"
      }
    }
  }
}
```

### Remote Server

For a remote Strapi instance:

```json
{
  "mcpServers": {
    "strapi-content": {
      "url": "https://your-strapi-server.com/api/strapi-content-mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_TOKEN"
      }
    }
  }
}
```

### Multiple Strapi Servers

You can connect to multiple Strapi instances:

```json
{
  "mcpServers": {
    "strapi-dev": {
      "url": "http://localhost:1337/api/strapi-content-mcp/mcp"
    },
    "strapi-staging": {
      "url": "https://staging.example.com/api/strapi-content-mcp/mcp",
      "headers": {
        "Authorization": "Bearer STAGING_TOKEN"
      }
    },
    "strapi-production": {
      "url": "https://cms.example.com/api/strapi-content-mcp/mcp",
      "headers": {
        "Authorization": "Bearer PROD_TOKEN"
      }
    }
  }
}
```

## Verify Connection

After restarting Claude Desktop:

1. Open a new conversation
2. Ask Claude: "What content types are available in Strapi?"
3. Claude should use the `list_content_types` tool and return your content types

## Usage Examples

Once connected, you can ask Claude to interact with your Strapi content:

### Exploring Content

> "List all content types in Strapi"

> "Show me the schema for the Article content type"

> "What components are available?"

### Reading Content

> "Find all published articles"

> "Get the article with documentId abc123"

> "Show me the 5 most recent blog posts with their authors"

> "Find products where price is greater than $100"

### Creating Content

> "Create a new article with title 'Getting Started with Strapi' and content 'This is a guide...'"

> "Add a new product called 'Widget' priced at $29.99"

### Updating Content

> "Update the article abc123 to change the title to 'Updated Title'"

> "Set the status of article xyz789 to published"

### Deleting Content

> "Delete the article with documentId abc123"

### Media Upload

> "Upload the image from https://example.com/photo.jpg to Strapi"

> "Upload this image and set its alt text to 'Product hero image'"

## Troubleshooting

### Connection Failed

**Symptom:** Claude can't connect to the MCP server

**Solutions:**
1. Verify Strapi is running: `curl http://localhost:1337/api/strapi-content-mcp/mcp`
2. Check the URL in your config matches the Strapi server
3. Ensure no firewall is blocking the connection
4. Check Strapi logs for errors

### Authentication Errors

**Symptom:** 401 or 403 errors

**Solutions:**
1. Verify your API token is valid and not expired
2. Check the token has the required permissions
3. Ensure the Authorization header format is correct: `Bearer TOKEN`

### Tools Not Available

**Symptom:** Claude doesn't recognize Strapi tools

**Solutions:**
1. Restart Claude Desktop after config changes
2. Verify the config file is valid JSON
3. Check the config file location is correct for your OS

### Timeout Errors

**Symptom:** Requests time out

**Solutions:**
1. Check Strapi server performance
2. Use pagination for large datasets
3. Reduce the amount of populated relations

### "Content type not found" Errors

**Symptom:** Tool returns content type not found

**Solutions:**
1. Use `list_content_types` to see available content types
2. Verify you're using the full UID format: `api::article.article`
3. Check the content type exists in Strapi admin

## Security Recommendations

1. **Always use authentication in production** - Don't expose the MCP endpoint without authentication
2. **Use HTTPS for remote connections** - Never send tokens over unencrypted connections
3. **Create dedicated API tokens** - Don't reuse tokens across different services
4. **Limit token permissions** - Only grant the permissions needed
5. **Rotate tokens regularly** - Update tokens periodically

## Logs and Debugging

Enable debug logging in the plugin to troubleshoot issues:

```typescript
// config/plugins.ts
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      logLevel: 'debug',
    },
  },
};
```

View logs in your Strapi console output.
