# Configuration

## Plugin Configuration

Configure the plugin in your Strapi project's `config/plugins.ts`:

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

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable the MCP server |
| `logLevel` | string | `'info'` | Logging verbosity level |

### Log Levels

Available log levels (from least to most verbose):

- `error` - Only errors
- `warn` - Errors and warnings
- `info` - General information (default)
- `debug` - Detailed debug information
- `trace` - Very detailed trace information

Example with debug logging:

```typescript
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      logLevel: 'debug',
    },
  },
};
```

## Authentication

By default, the MCP endpoint is publicly accessible. For production, you should enable authentication.

### Option 1: API Token Authentication

Edit `server/src/routes/content-api.ts` in the plugin:

```typescript
export default [
  {
    method: 'POST',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      auth: {
        scope: ['find', 'findOne', 'create', 'update', 'delete'],
      },
    },
  },
  {
    method: 'GET',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      auth: {
        scope: ['find', 'findOne'],
      },
    },
  },
  {
    method: 'DELETE',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      auth: {
        scope: ['find'],
      },
    },
  },
];
```

Then create an API token in Strapi Admin:
1. Go to Settings > API Tokens
2. Create a new token with appropriate permissions
3. Use the token in your MCP client

### Option 2: Admin Authentication

For admin-only access:

```typescript
export default [
  {
    method: 'POST',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  // ... other routes
];
```

### Option 3: Custom Policy

Create a custom policy for MCP-specific authentication:

```typescript
// src/policies/mcp-auth.ts
export default (policyContext, config, { strapi }) => {
  const token = policyContext.request.header['x-mcp-token'];

  if (token === process.env.MCP_SECRET_TOKEN) {
    return true;
  }

  return false;
};
```

Then use it in routes:

```typescript
config: {
  policies: ['global::mcp-auth'],
}
```

## Environment-Specific Configuration

### Development

```typescript
// config/env/development/plugins.ts
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      logLevel: 'debug',
    },
  },
};
```

### Production

```typescript
// config/env/production/plugins.ts
export default {
  'strapi-content-mcp': {
    enabled: true,
    config: {
      logLevel: 'warn',
    },
  },
};
```

## Disabling the Plugin

To disable the plugin entirely:

```typescript
export default {
  'strapi-content-mcp': {
    enabled: false,
  },
};
```

Or remove it from the configuration file.

## CORS Configuration

If accessing the MCP endpoint from a different origin, configure CORS in `config/middlewares.ts`:

```typescript
export default [
  // ... other middlewares
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'https://your-app.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-MCP-Token'],
    },
  },
];
```
