/**
 * Validation Schemas
 * 
 * Joi schemas for API input validation.
 */

import Joi from 'joi';

// Wallet schemas
export const walletAddressSchema = Joi.string()
  .length(44)
  .pattern(/^[A-HJ-NP-Za-km-z1-9]+$/)
  .required()
  .messages({
    'string.length': 'Wallet address must be 44 characters',
    'string.pattern.base': 'Invalid Solana address format'
  });

export const traceRequestSchema = Joi.object({
  walletAddress: walletAddressSchema,
  maxDepth: Joi.number().integer().min(1).max(20).default(10),
  includeExchanges: Joi.boolean().default(true),
  includeOffRamps: Joi.boolean().default(true)
});

// Bundle schemas
export const bundleDetectSchema = Joi.object({
  tokenAddress: walletAddressSchema,
  timeWindow: Joi.string().valid('1h', '24h', '7d', '30d').default('24h'),
  minWallets: Joi.number().integer().min(2).max(100).default(3),
  minVolume: Joi.number().positive().default(1000)
});

export const bundleAnalyzeSchema = Joi.object({
  wallets: Joi.array()
    .items(walletAddressSchema)
    .min(2)
    .max(50)
    .required(),
  depth: Joi.number().integer().min(1).max(5).default(2)
});

// Exchange schemas
export const exchangeVerifySchema = Joi.object({
  address: walletAddressSchema
});

export const exchangeSubmitSchema = Joi.object({
  address: walletAddressSchema,
  exchange: Joi.string().min(2).max(50).required(),
  walletType: Joi.string().valid('hot', 'cold', 'deposit', 'withdrawal').required(),
  evidence: Joi.string().min(10).max(1000).required()
});

// Pagination schemas
export const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

// User schemas
export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
    })
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Transaction filter schemas
export const transactionFilterSchema = Joi.object({
  walletAddress: walletAddressSchema,
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  tokenType: Joi.string().valid('SOL', 'USDC', 'USDT', 'BUSD'),
  minAmount: Joi.number().positive(),
  maxAmount: Joi.number().positive().greater(Joi.ref('minAmount')),
  direction: Joi.string().valid('in', 'out', 'all').default('all')
});

// WebSocket message schemas
export const wsAuthSchema = Joi.object({
  action: Joi.string().valid('auth').required(),
  token: Joi.string().required()
});

export const wsSubscribeSchema = Joi.object({
  action: Joi.string().valid('subscribe').required(),
  walletAddress: walletAddressSchema
});

export const wsUnsubscribeSchema = Joi.object({
  action: Joi.string().valid('unsubscribe').required(),
  walletAddress: walletAddressSchema
});
