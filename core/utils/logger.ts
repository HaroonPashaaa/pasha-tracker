/**
 * Logger Utility
 * 
 * Structured logging with Winston for monitoring and debugging.
 */

import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'pasha-tracker',
    environment: process.env.NODE_ENV || 'development'
  },
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : undefined
    }),
    
    // Write errors to error log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs to combined log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync('logs', { recursive: true });
} catch (error) {
  // Directory already exists
}

export default logger;
