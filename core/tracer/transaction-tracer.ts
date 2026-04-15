/**
 * Transaction Tracer Module
 * 
 * Reconstructs transaction paths through the Solana blockchain.
 * Traces funds from origin to destination through multiple hops.
 */

import { PublicKey } from '@solana/web3.js';
import { SolanaClient } from '../indexer/solana-client';
import { logger } from '../utils/logger';

interface TraceHop {
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  signature: string;
  token?: string;
}

interface TraceResult {
  originWallet: string;
  destinationWallet: string;
  hops: TraceHop[];
  totalAmount: number;
  duration: number;
  pathLength: number;
}

/**
 * TransactionTracer - Reconstructs money flow paths
 */
export class TransactionTracer {
  private client: SolanaClient;
  private maxDepth: number;
  private visitedWallets: Set<string>;

  constructor(client: SolanaClient, maxDepth: number = 10) {
    this.client = client;
    this.maxDepth = maxDepth;
    this.visitedWallets = new Set();
  }

  /**
   * Trace funds backward from a wallet to their origin
   */
  async traceBackward(
    walletAddress: string,
    targetDepth: number = this.maxDepth
  ): Promise<TraceResult | null> {
    logger.info(`Tracing backward from ${walletAddress}`);
    
    this.visitedWallets.clear();
    const hops: TraceHop[] = [];
    
    try {
      const currentWallet = new PublicKey(walletAddress);
      let depth = 0;
      let currentAddress = walletAddress;
      
      while (depth < targetDepth) {
        // Get incoming transactions
        const signatures = await this.client.getSignaturesForAddress(
          currentAddress,
          { limit: 10 }
        );
        
        if (signatures.length === 0) {
          logger.info(`No more transactions at depth ${depth}`);
          break;
        }
        
        // Find the largest incoming transfer
        let largestTx = null;
        let largestAmount = 0;
        
        for (const sigInfo of signatures) {
          if (this.visitedWallets.has(sigInfo.signature)) continue;
          
          const tx = await this.client.getTransaction(sigInfo.signature);
          if (!tx) continue;
          
          // Parse transaction to find incoming amount
          // This is simplified - real implementation would parse instructions
          const amount = this.parseIncomingAmount(tx, currentAddress);
          
          if (amount > largestAmount) {
            largestAmount = amount;
            largestTx = {
              signature: sigInfo.signature,
              amount,
              timestamp: new Date(sigInfo.blockTime! * 1000),
              source: this.parseSourceWallet(tx)
            };
          }
          
          this.visitedWallets.add(sigInfo.signature);
        }
        
        if (!largestTx || !largestTx.source) {
          break;
        }
        
        // Add hop
        hops.push({
          from: largestTx.source,
          to: currentAddress,
          amount: largestTx.amount,
          timestamp: largestTx.timestamp,
          signature: largestTx.signature
        });
        
        // Move to source wallet
        currentAddress = largestTx.source;
        depth++;
        
        // Check if we've reached a known origin (exchange, mining pool, etc.)
        if (this.isKnownOrigin(currentAddress)) {
          logger.info(`Reached known origin: ${currentAddress}`);
          break;
        }
      }
      
      if (hops.length === 0) {
        return null;
      }
      
      const firstHop = hops[0];
      const lastHop = hops[hops.length - 1];
      
      return {
        originWallet: lastHop.from,
        destinationWallet: firstHop.to,
        hops: hops.reverse(), // Show from origin to destination
        totalAmount: hops.reduce((sum, hop) => sum + hop.amount, 0) / hops.length,
        duration: firstHop.timestamp.getTime() - lastHop.timestamp.getTime(),
        pathLength: hops.length
      };
      
    } catch (error) {
      logger.error('Error in traceBackward:', error);
      return null;
    }
  }

  /**
   * Trace funds forward from a wallet to their destination
   */
  async traceForward(
    walletAddress: string,
    targetDepth: number = this.maxDepth
  ): Promise<TraceResult | null> {
    logger.info(`Tracing forward from ${walletAddress}`);
    
    this.visitedWallets.clear();
    const hops: TraceHop[] = [];
    
    try {
      let currentAddress = walletAddress;
      let depth = 0;
      
      while (depth < targetDepth) {
        // Get outgoing transactions
        const signatures = await this.client.getSignaturesForAddress(
          currentAddress,
          { limit: 10 }
        );
        
        if (signatures.length === 0) {
          break;
        }
        
        // Find the largest outgoing transfer
        let largestTx = null;
        let largestAmount = 0;
        
        for (const sigInfo of signatures) {
          if (this.visitedWallets.has(sigInfo.signature)) continue;
          
          const tx = await this.client.getTransaction(sigInfo.signature);
          if (!tx) continue;
          
          const amount = this.parseOutgoingAmount(tx, currentAddress);
          
          if (amount > largestAmount) {
            largestAmount = amount;
            largestTx = {
              signature: sigInfo.signature,
              amount,
              timestamp: new Date(sigInfo.blockTime! * 1000),
              destination: this.parseDestinationWallet(tx)
            };
          }
          
          this.visitedWallets.add(sigInfo.signature);
        }
        
        if (!largestTx || !largestTx.destination) {
          break;
        }
        
        hops.push({
          from: currentAddress,
          to: largestTx.destination,
          amount: largestTx.amount,
          timestamp: largestTx.timestamp,
          signature: largestTx.signature
        });
        
        currentAddress = largestTx.destination;
        depth++;
        
        // Check if we reached a known destination (exchange, etc.)
        if (this.isKnownDestination(currentAddress)) {
          logger.info(`Reached known destination: ${currentAddress}`);
          break;
        }
      }
      
      if (hops.length === 0) {
        return null;
      }
      
      const firstHop = hops[0];
      const lastHop = hops[hops.length - 1];
      
      return {
        originWallet: firstHop.from,
        destinationWallet: lastHop.to,
        hops,
        totalAmount: hops.reduce((sum, hop) => sum + hop.amount, 0) / hops.length,
        duration: lastHop.timestamp.getTime() - firstHop.timestamp.getTime(),
        pathLength: hops.length
      };
      
    } catch (error) {
      logger.error('Error in traceForward:', error);
      return null;
    }
  }

  /**
   * Parse incoming amount from transaction
   */
  private parseIncomingAmount(tx: any, walletAddress: string): number {
    // Simplified parsing - real implementation would decode instructions
    try {
      const postBalance = tx.meta?.postBalances?.[0] || 0;
      const preBalance = tx.meta?.preBalances?.[0] || 0;
      return (postBalance - preBalance) / 1e9; // Convert lamports to SOL
    } catch {
      return 0;
    }
  }

  /**
   * Parse outgoing amount from transaction
   */
  private parseOutgoingAmount(tx: any, walletAddress: string): number {
    try {
      const preBalance = tx.meta?.preBalances?.[0] || 0;
      const postBalance = tx.meta?.postBalances?.[0] || 0;
      return (preBalance - postBalance) / 1e9;
    } catch {
      return 0;
    }
  }

  /**
   * Parse source wallet from transaction
   */
  private parseSourceWallet(tx: any): string | null {
    try {
      return tx.transaction?.message?.accountKeys?.[0]?.toString() || null;
    } catch {
      return null;
    }
  }

  /**
   * Parse destination wallet from transaction
   */
  private parseDestinationWallet(tx: any): string | null {
    try {
      const keys = tx.transaction?.message?.accountKeys;
      return keys?.[keys.length - 1]?.toString() || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if wallet is a known origin (mining pool, etc.)
   */
  private isKnownOrigin(walletAddress: string): boolean {
    // TODO: Check against known origin database
    const knownOrigins = [
      // Mining pools, faucets, etc.
    ];
    return knownOrigins.includes(walletAddress);
  }

  /**
   * Check if wallet is a known destination (exchange, etc.)
   */
  private isKnownDestination(walletAddress: string): boolean {
    // TODO: Check against exchange database
    const knownDestinations = [
      '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', // Example
    ];
    return knownDestinations.includes(walletAddress);
  }
}

export default TransactionTracer;
