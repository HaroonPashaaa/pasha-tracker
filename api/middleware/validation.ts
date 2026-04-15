/**
 * Validation Middleware
 * 
 * Request validation using Joi.
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './error-handler';

/**
 * Validate request body
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      next(createError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR'));
      return;
    }

    req.body = value;
    next();
  };
}

/**
 * Validate request params
 */
export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      next(createError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR'));
      return;
    }

    req.params = value;
    next();
  };
}

/**
 * Validate request query
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      next(createError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR'));
      return;
    }

    req.query = value;
    next();
  };
}

/**
 * Common validation schemas
 */
export const schemas = {
  walletAddress: Joi.string().alphanum().min(32).max(44).required(),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),
  
  traceRequest: Joi.object({
    walletAddress: Joi.string().alphanum().min(32).max(44).required(),
    maxDepth: Joi.number().integer().min(1).max(20).default(10),
    includeExchanges: Joi.boolean().default(true),
    minAmount: Joi.number().min(0)
  }),
  
  bundleDetection: Joi.object({
    tokenAddress: Joi.string().alphanum().min(32).max(44).required(),
    timeWindow: Joi.string().valid('1h', '6h', '24h', '7d').default('24h'),
    minWallets: Joi.number().integer().min(2).default(3)
  })
};
