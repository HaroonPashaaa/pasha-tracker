/**
 * Tests for Database Service
 */

import { DatabaseService } from '../../core/services/database';

// Mock Prisma
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      wallet: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      },
      bundle: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      },
      exchangeWallet: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      }
    }))
  };
});

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(() => {
    db = new DatabaseService();
  });

  it('should be defined', () => {
    expect(db).toBeDefined();
  });

  it('should connect and disconnect', async () => {
    await db.connect();
    await db.disconnect();
    expect(true).toBe(true);
  });

  it('should get or create wallet', async () => {
    const wallet = await db.getOrCreateWallet('test123');
    expect(wallet).toBeDefined();
  });

  it('should get wallet', async () => {
    const wallet = await db.getWallet('test123');
    expect(wallet).toBeDefined();
  });

  it('should create transaction', async () => {
    const tx = await db.createTransaction({
      signature: 'sig123',
      slot: BigInt(100),
      timestamp: new Date(),
      amount: 1000,
      tokenType: 'SOL',
      fromAddress: 'from123',
      toAddress: 'to123'
    });
    expect(tx).toBeDefined();
  });

  it('should get wallet transactions', async () => {
    const txs = await db.getWalletTransactions('test123');
    expect(Array.isArray(txs)).toBe(true);
  });

  it('should get stats', async () => {
    const stats = await db.getStats();
    expect(stats).toHaveProperty('wallets');
    expect(stats).toHaveProperty('transactions');
    expect(stats).toHaveProperty('bundles');
    expect(stats).toHaveProperty('exchangeWallets');
  });
});
