/**
 * Configuration Module
 * 
 * Centralized configuration management with validation.
 */

import Joi from 'joi';
import { logger } from '../utils/logger';

interface AppConfig {
  // Server
  port: number;
  nodeEnv: string;
  
  // Solana
  solanaRpcUrl: string;
  solanaWsUrl?: string;
  heliusApiKey?: string;
  
  // Database
  databaseUrl: string;
  redisUrl: string;
  
  // Security
  jwtSecret: string;
  apiRateLimit: number;
  
  // Rate Limiting
  rateLimitDelayMs: number;
  maxRetries: number;
  backoffMultiplier: number;
  maxRequestsPerMinute: number;
  
  // Exchange APIs
  binanceApiKey?: string;
  binanceSecret?: string;
  coinbaseApiKey?: string;
  coinbaseSecret?: string;
  krakenApiKey?: string;
  krakenSecret?: string;
  
  // Features
  enableRealtime: boolean;
  enableHistorical: boolean;
  enableClustering: boolean;
  enableExchangeLayer: boolean;
  
  // Monitoring
  logLevel: string;
  metricsEnabled: boolean;
  metricsPort: number;
}

const configSchema = Joi.object({
  port: Joi.number().default(3000),
  nodeEnv: Joi.string().valid('development', 'production', 'test').default('development'),
  
  solanaRpcUrl: Joi.string().uri().required(),
  solanaWsUrl: Joi.string().uri().optional(),
  heliusApiKey: Joi.string().optional(),
  
  databaseUrl: Joi.string().uri().required(),
  redisUrl: Joi.string().uri().required(),
  
  jwtSecret: Joi.string().min(32).required(),
  apiRateLimit: Joi.number().default(60),
  
  rateLimitDelayMs: Joi.number().default(200),
  maxRetries: Joi.number().default(3),
  backoffMultiplier: Joi.number().default(2),
  maxRequestsPerMinute: Joi.number().default(300),
  
  binanceApiKey: Joi.string().optional(),
  binanceSecret: Joi.string().optional(),
  coinbaseApiKey: Joi.string().optional(),
  coinbaseSecret: Joi.string().optional(),
  krakenApiKey: Joi.string().optional(),
  krakenSecret: Joi.string().optional(),
  
  enableRealtime: Joi.boolean().default(true),
  enableHistorical: Joi.boolean().default(true),
  enableClustering: Joi.boolean().default(true),
  enableExchangeLayer: Joi.boolean().default(true),
  
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  metricsEnabled: Joi.boolean().default(true),
  metricsPort: Joi.number().default(9090)
});

/**
 * Load and validate configuration
 */
export function loadConfig(): AppConfig {
  const rawConfig = {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV,
    
    solanaRpcUrl: process.env.SOLANA_RPC_URL,
    solanaWsUrl: process.env.SOLANA_WS_URL,
    heliusApiKey: process.env.HELIUS_API_KEY,
    
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    
    jwtSecret: process.env.JWT_SECRET,
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '60'),
    
    rateLimitDelayMs: parseInt(process.env.RATE_LIMIT_DELAY_MS || '200'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    backoffMultiplier: parseInt(process.env.BACKOFF_MULTIPLIER || '2'),
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '300'),
    
    binanceApiKey: process.env.BINANCE_API_KEY,
    binanceSecret: process.env.BINANCE_SECRET_KEY,
    coinbaseApiKey: process.env.COINBASE_API_KEY,
    coinbaseSecret: process.env.COINBASE_SECRET,
    krakenApiKey: process.env.KRAKEN_API_KEY,
    krakenSecret: process.env.KRAKEN_SECRET,
    
    enableRealtime: process.env.ENABLE_REALTIME !== 'false',
    enableHistorical: process.env.ENABLE_HISTORICAL !== 'false',
    enableClustering: process.env.ENABLE_CLUSTERING !== 'false',
    enableExchangeLayer: process.env.ENABLE_EXCHANGE_LAYER !== 'false',
    
    logLevel: process.env.LOG_LEVEL,
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090')
  };
  
  const { error, value } = configSchema.validate(rawConfig);
  
  if (error) {
    logger.error('Configuration validation failed:', error.message);
    throw new Error(`Invalid configuration: ${error.message}`);
  }
  
  logger.info('Configuration loaded successfully');
  return value;
}

// Global config instance
export const config = loadConfig();
export default config;
