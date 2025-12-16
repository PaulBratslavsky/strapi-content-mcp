import type { Core } from '@strapi/strapi';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

export class McpLogger {
  private level: LogLevel;
  private strapi: Core.Strapi;

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
    const config = strapi.config.get('plugin.strapi-content-mcp', { logLevel: 'info' });
    this.level = (config.logLevel as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  private formatEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context: this.sanitizeContext(context) } : {}),
    };
  }

  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'jwt', 'api_key', 'secret', 'authorization', 'auth', 'credentials', 'key'];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => sanitize(item));
      }

      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatEntry(level, message, context);
    const prefix = `[strapi-content-mcp]`;

    switch (level) {
      case 'error':
        this.strapi.log.error(`${prefix} ${message}`, context);
        break;
      case 'warn':
        this.strapi.log.warn(`${prefix} ${message}`, context);
        break;
      case 'info':
        this.strapi.log.info(`${prefix} ${message}`, context);
        break;
      case 'debug':
        this.strapi.log.debug(`${prefix} ${message}`, context);
        break;
      case 'trace':
        // Strapi doesn't have trace, use debug
        this.strapi.log.debug(`${prefix} [TRACE] ${message}`, context);
        break;
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  trace(message: string, context?: Record<string, any>): void {
    this.log('trace', message, context);
  }

  /**
   * Log a tool execution
   */
  logToolExecution(toolName: string, args: unknown, duration: number, success: boolean, error?: Error): void {
    const context = {
      toolName,
      args: this.sanitizeContext(args as Record<string, any>),
      duration,
      success,
    };

    if (success) {
      this.info(`Tool executed: ${toolName}`, context);
    } else {
      this.error(`Tool failed: ${toolName}`, {
        ...context,
        error: error?.message,
      });
    }
  }
}

let loggerInstance: McpLogger | null = null;

export function createLogger(strapi: Core.Strapi): McpLogger {
  if (!loggerInstance) {
    loggerInstance = new McpLogger(strapi);
  }
  return loggerInstance;
}

export function getLogger(): McpLogger | null {
  return loggerInstance;
}
