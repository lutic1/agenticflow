/**
 * Logging Utility
 * Comprehensive logging for slide designer operations
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  timestamp: Date;
  message: string;
  context?: Record<string, unknown>;
  agent?: string;
}

/**
 * Logger for slide designer
 */
export class Logger {
  private logs: LogEntry[] = [];
  private minLevel: LogLevel = LogLevel.INFO;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>, agent?: string): void {
    this.log(LogLevel.DEBUG, message, context, agent);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>, agent?: string): void {
    this.log(LogLevel.INFO, message, context, agent);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>, agent?: string): void {
    this.log(LogLevel.WARN, message, context, agent);
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, unknown>, agent?: string): void {
    this.log(LogLevel.ERROR, message, context, agent);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    agent?: string
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date(),
      message,
      context,
      agent,
    };

    this.logs.push(entry);

    // Console output
    const levelStr = LogLevel[level];
    const agentStr = agent ? `[${agent}]` : '';
    const contextStr = context ? JSON.stringify(context) : '';

    const fullMessage = `[${levelStr}]${agentStr} ${message} ${contextStr}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage);
        break;
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by agent
   */
  getLogsByAgent(agent: string): LogEntry[] {
    return this.logs.filter(log => log.agent === agent);
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Get or create global logger
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(LogLevel.INFO);
  }
  return globalLogger;
}
