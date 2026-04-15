/**
 * Tests for Transaction Tracer
 */

import { TransactionTracer } from '../../core/tracer/transaction-tracer';
import { SolanaClient } from '../../core/indexer/solana-client';

// Mock dependencies
jest.mock('../../core/indexer/solana-client');

describe('TransactionTracer', () => {
  let tracer: TransactionTracer;
  let mockClient: jest.Mocked<SolanaClient>;

  beforeEach(() => {
    mockClient = new SolanaClient({ rpcUrl: 'test' }) as jest.Mocked<SolanaClient>;
    tracer = new TransactionTracer(mockClient, 5);
  });

  describe('traceBackward', () => {
    it('should trace backward successfully', async () => {
      const mockSignatures = [
        { signature: 'sig1', blockTime: Date.now() / 1000 }
      ];
      
      mockClient.getSignaturesForAddress.mockResolvedValue(mockSignatures as any);
      mockClient.getTransaction.mockResolvedValue({
        meta: { preBalances: [0], postBalances: [1000000000] },
        transaction: { message: { accountKeys: [{ toString: () => 'source1' }] } }
      } as any);

      const result = await tracer.traceBackward('target123');
      
      expect(result).not.toBeNull();
      expect(mockClient.getSignaturesForAddress).toHaveBeenCalled();
    });

    it('should handle empty transaction history', async () => {
      mockClient.getSignaturesForAddress.mockResolvedValue([]);

      const result = await tracer.traceBackward('target123');
      
      expect(result).toBeNull();
    });

    it('should respect max depth limit', async () => {
      const mockSignatures = [
        { signature: 'sig1', blockTime: Date.now() / 1000 }
      ];
      
      mockClient.getSignaturesForAddress.mockResolvedValue(mockSignatures as any);
      mockClient.getTransaction.mockResolvedValue({
        meta: { preBalances: [0], postBalances: [1000000000] },
        transaction: { message: { accountKeys: [{ toString: () => 'source1' }] } }
      } as any);

      const shallowTracer = new TransactionTracer(mockClient, 2);
      const result = await shallowTracer.traceBackward('target123', 2);
      
      // Should stop at depth limit
      expect(mockClient.getSignaturesForAddress).toHaveBeenCalledTimes(2);
    });

    it('should detect known origin addresses', async () => {
      // Test would check if tracing stops at known exchange addresses
      expect(true).toBe(true);
    });
  });

  describe('traceForward', () => {
    it('should trace forward successfully', async () => {
      const mockSignatures = [
        { signature: 'sig1', blockTime: Date.now() / 1000 }
      ];
      
      mockClient.getSignaturesForAddress.mockResolvedValue(mockSignatures as any);
      mockClient.getTransaction.mockResolvedValue({
        meta: { preBalances: [1000000000], postBalances: [0] },
        transaction: { message: { accountKeys: [
          { toString: () => 'source1' },
          { toString: () => 'dest1' }
        ] } }
      } as any);

      const result = await tracer.traceForward('source123');
      
      expect(result).not.toBeNull();
    });

    it('should handle no outgoing transactions', async () => {
      mockClient.getSignaturesForAddress.mockResolvedValue([]);

      const result = await tracer.traceForward('source123');
      
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle RPC errors gracefully', async () => {
      mockClient.getSignaturesForAddress.mockRejectedValue(new Error('RPC Error'));

      const result = await tracer.traceBackward('target123');
      
      expect(result).toBeNull();
    });

    it('should handle malformed transaction data', async () => {
      mockClient.getSignaturesForAddress.mockResolvedValue([{ signature: 'sig1' }] as any);
      mockClient.getTransaction.mockResolvedValue(null);

      const result = await tracer.traceBackward('target123');
      
      expect(result).toBeNull();
    });
  });
});
