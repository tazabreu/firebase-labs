/**
 * Logger Configuration
 * Centralized logging with environment-specific settings.
 */
import pino from 'pino';

// Determine environment
const isProd = process.env.NODE_ENV === 'production';
const isNonProd = process.env.NODE_ENV === 'nonprod';
const isLocal = !isProd && !isNonProd;

// Map pino levels to Google Cloud Logging severity for better ingestion
const levelToSeverity: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL'
};

// Configure logger options
const options: pino.LoggerOptions = {
  level: isLocal ? 'debug' : isProd ? 'info' : 'debug',
  transport: isLocal ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
  base: {
    service: 'health-service',
  },
  // Add a Cloud Logging compatible severity alongside pino's level
  formatters: {
    level(label) {
      return { level: label, severity: levelToSeverity[label] || label.toUpperCase() };
    }
  }
};

// Create the logger instance
const logger = pino(options);

logger.debug('Logger initialized', { 
  environment: isProd ? 'production' : isNonProd ? 'nonprod' : 'local'
});

// Export configured logger
export default logger; 