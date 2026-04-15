/**
 * Solana Client Module
 * 
 * Wrapper around @solana/web3.js with rate limiting and error handling.
 * All RPC calls go through the rate limiter to prevent API abuse.
 */

import { Connection, PublicKey, TransactionResponse, BlockResponse, ConfirmedSignatureInfo } from '@solana/web3.js';
import { rateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

interface SolanaClientConfig {
  rpcUrl: string;
  wsUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

/**
 * SolanaClient - Rate-limited Solana RPC client
 */
export class SolanaClient {
  private connection: Connection;
  private config: SolanaClientConfig;

  constructor(config: SolanaClientConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, {
      commitment: config.commitment || 'confirmed',
      wsEndpoint: config.wsUrl
    });
  }

  /**
   * Get account balance with rate limiting
   */
  async getBalance(publicKey: PublicKey | string): Promise<number> {
    const pubkey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
    
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getBalance(pubkey);
      },
      'getBalance'
    );
  }

  /**
   * Get transaction details with rate limiting
   */
  async getTransaction(signature: string): Promise<TransactionResponse | null> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
      },
      'getTransaction'
    );
  }

  /**
   * Get signatures for address with rate limiting and pagination
   */
  async getSignaturesForAddress(
    address: PublicKey | string,
    options?: { before?: string; until?: string; limit?: number }
  ): Promise<ConfirmedSignatureInfo[]> {
    const pubkey = typeof address === 'string' ? new PublicKey(address) : address;
    
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getSignaturesForAddress(pubkey, options);
      },
      'getSignaturesForAddress'
    );
  }

  /**
   * Get block details with rate limiting
   */
  async getBlock(slot: number): Promise<BlockResponse | null> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getBlock(slot, {
          maxSupportedTransactionVersion: 0
        });
      },
      `getBlock-${slot}`
    );
  }

  /**
   * Get latest blockhash with rate limiting
   */
  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getLatestBlockhash();
      },
      'getLatestBlockhash'
    );
  }

  /**
   * Get slot with rate limiting
   */
  async getSlot(): Promise<number> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getSlot();
      },
      'getSlot'
    );
  }

  /**
   * Get multiple accounts with rate limiting
   */
  async getMultipleAccounts(publicKeys: PublicKey[]): Promise<any[]> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        const response = await this.connection.getMultipleAccountsInfo(publicKeys);
        return response;
      },
      'getMultipleAccounts'
    );
  }

  /**
   * Get token accounts by owner with rate limiting
   */
  async getTokenAccountsByOwner(owner: PublicKey | string): Promise<any[]> {
    const pubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;
    
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        const response = await this.connection.getTokenAccountsByOwner(
          pubkey,
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );
        return response.value;
      },
      'getTokenAccountsByOwner'
    );
  }

  /**
   * Get parsed transaction with rate limiting
   */
  async getParsedTransaction(signature: string): Promise<any | null> {
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getParsedTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
      },
      'getParsedTransaction'
    );
  }

  /**
   * Get program accounts with rate limiting
   */
  async getProgramAccounts(programId: PublicKey | string): Promise<any[]> {
    const program = typeof programId === 'string' ? new PublicKey(programId) : programId;
    
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getProgramAccounts(program);
      },
      'getProgramAccounts'
    );
  }

  /**
   * Get account info with rate limiting
   */
  async getAccountInfo(publicKey: PublicKey | string): Promise<any | null> {
    const pubkey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
    
    return rateLimiter.execute(
      'solana-rpc',
      async () => {
        return await this.connection.getAccountInfo(pubkey);
      },
      'getAccountInfo'
    );
  }

  /**
   * Subscribe to account changes via WebSocket
   */
  async subscribeAccount(
    publicKey: PublicKey | string,
    callback: (accountInfo: any) => void
  ): Promise<number> {
    const pubkey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
    
    try {
      const subscriptionId = this.connection.onAccountChange(pubkey, callback);
      logger.info(`Subscribed to account ${pubkey.toString()}, subscription ID: ${subscriptionId}`);
      return subscriptionId;
    } catch (error) {
      logger.error(`Failed to subscribe to account ${pubkey.toString()}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from account changes
   */
  async unsubscribeAccount(subscriptionId: number): Promise<void> {
    try {
      await this.connection.removeAccountChangeListener(subscriptionId);
      logger.info(`Unsubscribed from account, subscription ID: ${subscriptionId}`);
    } catch (error) {
      logger.error(`Failed to unsubscribe from account ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Test connection to RPC
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getSlot();
      logger.info('Successfully connected to Solana RPC');
      return true;
    } catch (error) {
      logger.error('Failed to connect to Solana RPC:', error);
      return false;
    }
  }

  /**
   * Get rate limiter stats for Solana RPC
   */
  getRateLimitStats() {
    return rateLimiter.getStats();
  }
}

// Factory function to create client from environment
export function createSolanaClient(): SolanaClient {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const wsUrl = process.env.SOLANA_WS_URL;
  
  if (!rpcUrl) {
    throw new Error('SOLANA_RPC_URL environment variable is required');
  }

  return new SolanaClient({
    rpcUrl,
    wsUrl,
    commitment: 'confirmed'
  });
}
