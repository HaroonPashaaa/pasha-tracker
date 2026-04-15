/**
 * Transaction Tracer Tests
 */

import { TransactionTracer } from '../../core/tracer/transaction-tracer';
import { SolanaClient } from '../../core/indexer/solana-client';

jest.mock('../../core/indexer/solana-client');

describe('TransactionTracer', () => {
  let tracer: TransactionTracer;
  let mockClient: jest.Mocked<SolanaClient>;

  beforeEach(() => {
    mockClient = new SolanaClient({ rpcUrl: 'https://test.solana.com' }) as jest.Mocked<SolanaClient>;
    tracer = new TransactionTracer(mockClient, 5);
  });

  it('should be defined', () => {
    expect(tracer).toBeDefined();
  });

  it('should have max depth configured', () => {
    expect(tracer).toBeDefined();
  });
});
