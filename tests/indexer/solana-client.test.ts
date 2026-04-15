/**
 * Tests for Solana Client
 */

import { SolanaClient } from '../../core/indexer/solana-client';

// Mock the rate limiter
jest.mock('../../core/utils/rate-limiter', () => ({
  rateLimiter: {
    execute: jest.fn((api, fn) => fn())
  }
}));

describe('SolanaClient', () => {
  let client: SolanaClient;

  beforeEach(() => {
    client = new SolanaClient({
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      commitment: 'confirmed'
    });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should test connection', async () => {
    // Mock successful connection
    const result = await client.testConnection();
    expect(typeof result).toBe('boolean');
  });

  it('should get rate limit stats', () => {
    const stats = client.getRateLimitStats();
    expect(stats).toHaveProperty('totalCalls');
    expect(stats).toHaveProperty('failedCalls');
  });
});
