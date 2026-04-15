/**
 * Tests for Rate Limiter
 */

import { RateLimiter } from '../../core/utils/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  afterEach(() => {
    rateLimiter.clear();
  });

  it('should execute function with rate limiting', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await rateLimiter.execute('test-api', mockFn, 'test-endpoint');
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should track API call stats', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    await rateLimiter.execute('test-api', mockFn, 'test-endpoint');
    await rateLimiter.execute('test-api', mockFn, 'test-endpoint');
    
    const stats = rateLimiter.getStats();
    expect(stats.totalCalls).toBe(2);
  });

  it('should handle errors gracefully', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(
      rateLimiter.execute('test-api', mockFn, 'test-endpoint')
    ).rejects.toThrow('API Error');
    
    const stats = rateLimiter.getStats();
    expect(stats.failedCalls).toBe(1);
  });
});
