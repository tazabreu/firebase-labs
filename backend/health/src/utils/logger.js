/**
 * Logger Configuration
 * Centralized logging with environment-specific settings.
 */
const pino = require('pino');

// Determine environment
const isProd = process.env.NODE_ENV === 'production';
const isNonProd = process.env.NODE_ENV === 'nonprod';
const isLocal = !isProd && !isNonProd;

// Configure logger options
const options = {
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
};

// Create the logger instance
const logger = pino(options);

// Export configured logger
module.exports = logger; 