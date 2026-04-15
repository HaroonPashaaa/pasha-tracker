/**
 * Database Service
 *
 * High-level database operations using Prisma.
 */

import { PrismaClient, Wallet, Transaction, Bundle, ExchangeWallet } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * DatabaseService - Database operations wrapper
 */
export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
    });
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.prisma.$connect();
    logger.info('Connected to database');
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Disconnected from database');
  }

  // Wallet Operations

  /**
   * Get or create wallet
   */
  async getOrCreateWallet(address: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.upsert({
      where: { address },
      update: { lastUpdated: new Date() },
      create: { address }
    });
    return wallet;
  }

  /**
   * Get wallet by address
   */
  async getWallet(address: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { address },
      include: {
        transactionsSent: { take: 10, orderBy: { timestamp: 'desc' } },
        transactionsReceived: { take: 10, orderBy: { timestamp: 'desc' } }
      }
    });
  }

  /**
   * Update wallet labels
   */
  async updateWalletLabels(address: string, labels: string[]): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { address },
      data: { labels }
    });
  }

  // Transaction Operations

  /**
   * Create transaction
   */
  async createTransaction(data: {
    signature: string;
    slot: bigint;
    timestamp: Date;
    amount: number;
    tokenType: string;
    fromAddress: string;
    toAddress: string;
    isOffRamp?: boolean;
    offRampConfidence?: number;
  }): Promise<Transaction> {
    // Ensure wallets exist
    await this.getOrCreateWallet(data.fromAddress);
    await this.getOrCreateWallet(data.toAddress);

    return this.prisma.transaction.create({
      data: {
        signature: data.signature,
        slot: data.slot,
        timestamp: data.timestamp,
        amount: data.amount,
        tokenType: data.tokenType,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        isOffRamp: data.isOffRamp || false,
        offRampConfidence: data.offRampConfidence || 0
      }
    });
  }

  /**
   * Get transactions for wallet
   */
  async getWalletTransactions(
    address: string,
    options: { limit?: number; offset?: number; direction?: 'in' | 'out' | 'all' } = {}
  ): Promise<Transaction[]> {
    const { limit = 50, offset = 0, direction = 'all' } = options;

    let where: any = {};
    if (direction === 'in') {
      where = { toAddress: address };
    } else if (direction === 'out') {
      where = { fromAddress: address };
    } else {
      where = { OR: [{ fromAddress: address }, { toAddress: address }] };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });
  }

  // Bundle Operations

  /**
   * Create bundle
   */
  async createBundle(data: {
    tokenAddress: string;
    wallets: string[];
    confidence: number;
    totalVolume: number;
    firstPurchase: Date;
  }): Promise<Bundle> {
    return this.prisma.bundle.create({
      data: {
        tokenAddress: data.tokenAddress,
        wallets: data.wallets,
        confidence: data.confidence,
        totalVolume: data.totalVolume,
        firstPurchase: data.firstPurchase
      }
    });
  }

  /**
   * Get bundles for token
   */
  async getTokenBundles(tokenAddress: string, limit: number = 20): Promise<Bundle[]> {
    return this.prisma.bundle.findMany({
      where: { tokenAddress },
      orderBy: { detectedAt: 'desc' },
      take: limit
    });
  }

  // Exchange Wallet Operations

  /**
   * Get exchange wallet
   */
  async getExchangeWallet(address: string): Promise<ExchangeWallet | null> {
    return this.prisma.exchangeWallet.findUnique({
      where: { address }
    });
  }

  /**
   * Add exchange wallet
   */
  async addExchangeWallet(data: {
    address: string;
    exchange: string;
    walletType: string;
  }): Promise<ExchangeWallet> {
    return this.prisma.exchangeWallet.upsert({
      where: { address: data.address },
      update: {
        exchange: data.exchange,
        walletType: data.walletType,
        lastVerified: new Date()
      },
      create: {
        address: data.address,
        exchange: data.exchange,
        walletType: data.walletType
      }
    });
  }

  /**
   * Get wallets by exchange
   */
  async getExchangeWallets(exchange: string, walletType?: string): Promise<ExchangeWallet[]> {
    const where: any = { exchange };
    if (walletType) {
      where.walletType = walletType;
    }

    return this.prisma.exchangeWallet.findMany({ where });
  }

  // Statistics

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    wallets: number;
    transactions: number;
    bundles: number;
    exchangeWallets: number;
  }> {
    const [wallets, transactions, bundles, exchangeWallets] = await Promise.all([
      this.prisma.wallet.count(),
      this.prisma.transaction.count(),
      this.prisma.bundle.count(),
      this.prisma.exchangeWallet.count()
    ]);

    return { wallets, transactions, bundles, exchangeWallets };
  }
}

// Global instance
export const db = new DatabaseService();
export default DatabaseService;
