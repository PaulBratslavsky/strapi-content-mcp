export default [
  {
    method: 'POST',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      policies: [],
      auth: false, // Set to true or add policies for authentication
    },
  },
  {
    method: 'GET',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'DELETE',
    path: '/mcp',
    handler: 'mcp.handle',
    config: {
      policies: [],
      auth: false,
    },
  },
];
