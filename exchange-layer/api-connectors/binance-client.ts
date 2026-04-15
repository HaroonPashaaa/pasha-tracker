/**
 * Binance API Connector
 * 
 * Connects to Binance API for wallet verification and market data.
 * All calls go through rate limiter.
 */

import axios, { AxiosInstance } from 'axios';
import { rateLimiter } from '../../core/utils/rate-limiter';
import { logger } from '../../core/utils/logger';

interface BinanceConfig {
  apiKey: string;
  secretKey: string;
  baseURL?: string;
}

interface DepositAddress {
  address: string;
  tag?: string;
  network: string;
  coin: string;
}

/**
 * BinanceClient - Rate-limited Binance API client
 */
export class BinanceClient {
  private client: AxiosInstance;
  private config: BinanceConfig;

  constructor(config: BinanceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.binance.com',
      headers: {
        'X-MBX-APIKEY': config.apiKey
      },
      timeout: 30000
    });
  }

  /**
   * Verify if a wallet address belongs to Binance
   */
  async verifyDepositAddress(address: string, coin: string = 'SOL'): Promise<boolean> {
    return rateLimiter.execute(
      'binance-api',
      async () => {
        try {
          // Binance doesn't have a direct API to check if address belongs to them
          // This would require their internal database or heuristic analysis
          // For now, check against known patterns
          return this.isKnownBinancePattern(address);
        } catch (error) {
          logger.error('Error verifying Binance address:', error);
          return false;
        }
      },
      'verifyDepositAddress',
      { minTime: 200, maxConcurrent: 1 }
    );
  }

  /**
   * Get deposit address for a coin
   */
  async getDepositAddress(coin: string, network: string): Promise<DepositAddress | null> {
    return rateLimiter.execute(
      'binance-api',
      async () => {
        try {
          const timestamp = Date.now();
          const queryString = `coin=${coin}&network=${network}&timestamp=${timestamp}`;
          
          const response = await this.client.get(`/sapi/v1/capital/deposit/address?${queryString}`);
          
          if (response.data && response.data.address) {
            return {
              address: response.data.address,
              tag: response.data.tag,
              network: response.data.network,
              coin: response.data.coin
            };
          }
          return null;
        } catch (error) {
          logger.error('Error getting Binance deposit address:', error);
          return null;
        }
      },
      'getDepositAddress',
      { minTime: 200, maxConcurrent: 1 }
    );
  }

  /**
   * Check if address matches known Binance patterns
   */
  private isKnownBinancePattern(address: string): boolean {
    // Binance hot wallets often have specific patterns
    // This is a simplified check - real implementation would use a database
    const knownBinancePrefixes = [
      '7xKX', '8ZxP', '9YqR'  // Example prefixes
    ];
    
    return knownBinancePrefixes.some(prefix => address.startsWith(prefix));
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{ status: number; msg: string } | null> {
    return rateLimiter.execute(
      'binance-api',
      async () => {
        try {
          const response = await this.client.get('/sapi/v1/system/status');
          return response.data;
        } catch (error) {
          logger.error('Error getting Binance system status:', error);
          return null;
        }
      },
      'getSystemStatus',
      { minTime: 200, maxConcurrent: 1 }
    );
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getSystemStatus();
      if (status && status.status === 0) {
        logger.info('Successfully connected to Binance API');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to connect to Binance API:', error);
      return false;
    }
  }
}

export default BinanceClient;
