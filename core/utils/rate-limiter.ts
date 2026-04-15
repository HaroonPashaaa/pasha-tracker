/**
 * Rate Limiter Module
 * 
 * Implements comprehensive rate limiting for all external API calls.
 * Prevents API abuse and handles 429 errors with exponential backoff.
 */

import Bottleneck from 'bottleneck';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  minTime: number;           // Minimum time between requests (ms)
  maxConcurrent: number;     // Max concurrent requests
  reservoir?: number;        // Max requests per interval
  reservoirRefreshInterval?: number; // Refresh interval (ms)
}

interface ApiCallLog {
  timestamp: Date;
  endpoint: string;
  statusCode: number;
  retryCount: number;
  duration: number;
}

/**
 * RateLimiter - Manages API call rate limiting with queue and backoff
 */
export class RateLimiter {
  private limiters: Map<string, Bottleneck>;
  private callLogs: ApiCallLog[];
  private readonly maxLogSize = 1000;

  constructor() {
    this.limiters = new Map();
    this.callLogs = [];
  }

  /**
   * Create or get a rate limiter for a specific API
   */
  private getLimiter(apiName: string, config?: Partial<RateLimitConfig>): Bottleneck {
    if (!this.limiters.has(apiName)) {
      const defaultConfig: RateLimitConfig = {
        minTime: 200,  // 200ms between calls = 5 req/sec
        maxConcurrent: 2,
        reservoir: 300,  // 300 requests per minute
        reservoirRefreshInterval: 60 * 1000,  // 1 minute
        ...config
      };

      const limiter = new Bottleneck({
        minTime: defaultConfig.minTime,
        maxConcurrent: defaultConfig.maxConcurrent,
        reservoir: defaultConfig.reservoir,
        reservoirRefreshInterval: defaultConfig.reservoirRefreshInterval,
        
        // Exponential backoff on 429 errors
        retryCount: 3,
        retryDelay: (retryCount) => {
          const delay = Math.pow(2, retryCount) * 1000;  // 1s, 2s, 4s
          logger.warn(`Rate limit hit for ${apiName}, retrying in ${delay}ms (attempt ${retryCount})`);
          return delay;
        },
        
        // Retry on rate limit errors
        retryCondition: (error) => {
          const statusCode = error?.response?.status || error?.statusCode;
          return statusCode === 429 || statusCode === 503;
        }
      });

      // Event listeners for monitoring
      limiter.on('failed', async (error, jobInfo) => {
        const id = jobInfo.options.id;
        logger.error(`Job ${id} failed: ${error.message}`);
      });

      limiter.on('retry', (error, jobInfo) => {
        const id = jobInfo.options.id;
        logger.warn(`Retrying job ${id} after error: ${error.message}`);
      });

      this.limiters.set(apiName, limiter);
    }

    return this.limiters.get(apiName)!;
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(
    apiName: string,
    fn: () => Promise<T>,
    endpoint: string,
    config?: Partial<RateLimitConfig>
  ): Promise<T> {
    const limiter = this.getLimiter(apiName, config);
    const startTime = Date.now();
    let retryCount = 0;

    try {
      const result = await limiter.schedule(async () => {
        try {
          return await fn();
        } catch (error: any) {
          // Track retry count
          if (error?.response?.status === 429 || error?.statusCode === 429) {
            retryCount++;
          }
          throw error;
        }
      });

      // Log successful call
      this.logCall({
        timestamp: new Date(),
        endpoint,
        statusCode: 200,
        retryCount,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error: any) {
      // Log failed call
      this.logCall({
        timestamp: new Date(),
        endpoint,
        statusCode: error?.response?.status || error?.statusCode || 0,
        retryCount,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Log API call for monitoring
   */
  private logCall(log: ApiCallLog): void {
    this.callLogs.push(log);
    
    // Keep log size manageable
    if (this.callLogs.length > this.maxLogSize) {
      this.callLogs = this.callLogs.slice(-this.maxLogSize);
    }

    // Log slow calls
    if (log.duration > 5000) {
      logger.warn(`Slow API call to ${log.endpoint}: ${log.duration}ms`);
    }
  }

  /**
   * Get rate limiting statistics
   */
  getStats(): {
    totalCalls: number;
    failedCalls: number;
    averageDuration: number;
    retryRate: number;
  } {
    const total = this.callLogs.length;
    const failed = this.callLogs.filter(log => log.statusCode >= 400).length;
    const avgDuration = total > 0
      ? this.callLogs.reduce((sum, log) => sum + log.duration, 0) / total
      : 0;
    const retries = this.callLogs.filter(log => log.retryCount > 0).length;

    return {
      totalCalls: total,
      failedCalls: failed,
      averageDuration: Math.round(avgDuration),
      retryRate: total > 0 ? Math.round((retries / total) * 100) : 0
    };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): ApiCallLog[] {
    return this.callLogs.slice(-limit);
  }

  /**
   * Clear all limiters (useful for testing)
   */
  clear(): void {
    this.limiters.forEach(limiter => limiter.stop());
    this.limiters.clear();
    this.callLogs = [];
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();
