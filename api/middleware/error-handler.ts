/**
 * Error Handler Middleware
 * 
 * Centralized error handling for all routes.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log error
  logger.error('Request error:', {
    method: req.method,
    path: req.path,
    statusCode,
    message,
    code: err.code,
    stack: err.stack
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
    ...(err.code && { code: err.code })
  });
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
}

export default errorHandler;