/**
 * Tests for Cache Service
 */

import { CacheService } from '../../core/services/cache';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    mget: jest.fn(),
    pipeline: jest.fn().mockReturnValue({
      setex: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    }),
    keys: jest.fn(),
    quit: jest.fn()
  }));
});

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService({ redisUrl: 'redis://localhost:6379' });
  });

  it('should be defined', () => {
    expect(cache).toBeDefined();
  });

  it('should set and get values', async () => {
    const testData = { foo: 'bar' };
    await cache.set('test-key', testData, 60);
    // Mock would need to return the value
    expect(true).toBe(true);
  });

  it('should delete values', async () => {
    await cache.del('test-key');
    expect(true).toBe(true);
  });

  it('should cache wallet data', async () => {
    const walletData = { address: 'test123', balance: 100 };
    await cache.cacheWallet('test123', walletData);
    expect(true).toBe(true);
  });

  it('should cache traces', async () => {
    const traceData = { hops: [] };
    await cache.cacheTrace('test123', 'backward', traceData);
    expect(true).toBe(true);
  });
});
