# Installation & Setup

## Prerequisites

- Strapi v5.x project
- Node.js 18 or higher
- yarn or npm

## Installation

### Option 1: Copy Plugin

Copy the plugin folder to your Strapi project's `src/plugins` directory:

```bash
cp -r strapi-content-mcp /path/to/your-strapi-project/src/plugins/
```

### Option 2: Link Plugin (Development)

For development, you can link the plugin:

```bash
cd /path/to/your-strapi-project
yarn link /path/to/strapi-content-mcp
```

### Option 3: npm/yarn Package

If published to npm:

```bash
yarn add strapi-content-mcp
# or
npm install strapi-content-mcp
```

## Configuration

### 1. Enable the Plugin

Create or edit `config/plugins.ts` in your Strapi project:

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

### 2. Build the Plugin

If using the plugin from source:

```bash
cd src/plugins/strapi-content-mcp
yarn install
yarn build
```

### 3. Rebuild Strapi

```bash
cd /path/to/your-strapi-project
yarn build
```

### 4. Start Strapi

```bash
yarn develop
```

## Verify Installation

Once Strapi starts, you should see in the logs:

```
[strapi-content-mcp] MCP plugin initialized
[strapi-content-mcp] MCP endpoint available at: /api/strapi-content-mcp/mcp
```

## Test the Endpoint

You can test the MCP endpoint is accessible:

```bash
# Check the endpoint responds
curl -I http://localhost:1337/api/strapi-content-mcp/mcp
```

The endpoint uses session-based connections, so a simple curl test won't show tools - use Claude Desktop to test full functionality.

## Troubleshooting

### Plugin not loading

1. Ensure the plugin is in the correct location (`src/plugins/strapi-content-mcp`)
2. Check that it's enabled in `config/plugins.ts`
3. Rebuild Strapi: `yarn build`

### MCP endpoint returns 404

1. Verify the plugin is loaded in Strapi logs
2. Check the route exists: `GET /api/strapi-content-mcp/mcp`
3. Ensure no conflicting routes in your Strapi app

### TypeScript errors

1. Ensure all dependencies are installed: `yarn install`
2. Build the plugin: `yarn build`
3. Check Node.js version is 18+

## Next Steps

- [Configure authentication](./CONFIGURATION.md#authentication)
- [Connect Claude Desktop](./CLAUDE-DESKTOP.md)
- [Explore available tools](./TOOLS.md)
