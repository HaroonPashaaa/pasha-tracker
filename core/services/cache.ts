/**
 * Cache Service
 * 
 * Redis-based caching for frequently accessed data.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface CacheConfig {
  redisUrl: string;
  defaultTTL?: number;
}

/**
 * CacheService - Redis wrapper with utility methods
 */
export class CacheService {
  private client: Redis;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.client = new Redis(config.redisUrl);
    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.client.setex(key, expiry, serialized);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple values
   */
  async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      const values = await this.client.mget(keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values
   */
  async mset(entries: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
      const pipeline = this.client.pipeline();
      
      for (const entry of entries) {
        const serialized = JSON.stringify(entry.value);
        const ttl = entry.ttl || this.defaultTTL;
        pipeline.setex(entry.key, ttl, serialized);
      }
      
      await pipeline.exec();
    } catch (error) {
      logger.error('Cache mset error:', error);
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        logger.info(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache clear pattern error:', error);
    }
  }

  /**
   * Cache wallet data
   */
  async cacheWallet(address: string, data: any, ttl: number = 300): Promise<void> {
    const key = `wallet:${address}`;
    await this.set(key, data, ttl);
  }

  /**
   * Get cached wallet
   */
  async getCachedWallet(address: string): Promise<any | null> {
    const key = `wallet:${address}`;
    return this.get(key);
  }

  /**
   * Cache transaction trace
   */
  async cacheTrace(address: string, type: string, data: any, ttl: number = 600): Promise<void> {
    const key = `trace:${type}:${address}`;
    await this.set(key, data, ttl);
  }

  /**
   * Get cached trace
   */
  async getCachedTrace(address: string, type: string): Promise<any | null> {
    const key = `trace:${type}:${address}`;
    return this.get(key);
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Factory function
export function createCacheService(): CacheService {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }
  return new CacheService({ redisUrl });
}

export default CacheService;
