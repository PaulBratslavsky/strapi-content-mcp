export default {
  default: {
    enabled: true,
    logLevel: 'info' as const,
  },
  validator(config: { enabled?: boolean; logLevel?: string }) {
    const validLogLevels = ['error', 'warn', 'info', 'debug', 'trace'];
    if (config.logLevel && !validLogLevels.includes(config.logLevel)) {
      throw new Error(
        `Invalid logLevel "${config.logLevel}". Must be one of: ${validLogLevels.join(', ')}`
      );
    }
  },
};
