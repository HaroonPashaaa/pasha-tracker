/**
 * Error Handler Middleware
 * 
 * Centralized error handling for Express.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Create API error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
}

/**
 * Global error handler
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    code,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: {
      message: isDev ? message : 'Something went wrong',
      code,
      ...(isDev && { stack: err.stack })
    }
  });
}
