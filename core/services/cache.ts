/**
 * Cache Service
 * 
 * Redis-based caching layer.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { config } from '../config';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

class CacheService {
  private client: Redis | null = null;
  private defaultTTL = 300; // 5 minutes

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = new Redis(config.redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
      });
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.client = null;
    }
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!this.client) return;

    try {
      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      if (options.tags && options.tags.length > 0) {
        // Use Redis transaction for tagged cache
        const pipeline = this.client.pipeline();
        pipeline.setex(key, ttl, serialized);
        
        // Add to tag sets
        for (const tag of options.tags) {
          pipeline.sadd(`tag:${tag}`, key);
          pipeline.expire(`tag:${tag}`, ttl);
        }

        await pipeline.exec();
      } else {
        await this.client.setex(key, ttl, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateTag(tag: string): Promise<void> {
    if (!this.client) return;

    try {
      const keys = await this.client.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        const pipeline = this.client.pipeline();
        
        // Delete all keys
        pipeline.del(...keys);
        
        // Remove tag set
        pipeline.del(`tag:${tag}`);
        
        await pipeline.exec();
        logger.info(`Invalidated ${keys.length} keys for tag: ${tag}`);
      }
    } catch (error) {
      logger.error(`Cache invalidation error for tag ${tag}:`, error);
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<any> {
    if (!this.client) return null;

    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Cache stats error:', error);
      return null;
    }
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.flushall();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }
}

export const cache = new CacheService();
export default cache;
