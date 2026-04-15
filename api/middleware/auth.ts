/**
 * JWT Authentication Middleware
 * 
 * Validates JWT tokens for protected routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../core/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: string;
  };
}

/**
 * Verify JWT token from Authorization header
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error('JWT_SECRET not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tier: decoded.tier
    };
    next();
  } catch (error) {
    logger.warn('Invalid JWT token:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require specific tier access
 */
export function requireTier(tiers: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!tiers.includes(req.user.tier)) {
      res.status(403).json({ 
        error: 'Insufficient tier',
        required: tiers,
        current: req.user.tier
      });
      return;
    }

    next();
  };
}

export default authMiddleware;