/**
 * Coinbase API Connector
 * 
 * Connects to Coinbase API for wallet verification.
 */

import axios, { AxiosInstance } from 'axios';
import { rateLimiter } from '../../core/utils/rate-limiter';
import { logger } from '../../core/utils/logger';

interface CoinbaseConfig {
  apiKey: string;
  secret: string;
}

/**
 * CoinbaseClient - Rate-limited Coinbase API client
 */
export class CoinbaseClient {
  private client: AxiosInstance;
  private config: CoinbaseConfig;

  constructor(config: CoinbaseConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.coinbase.com/v2',
      headers: {
        'CB-ACCESS-KEY': config.apiKey,
        'CB-VERSION': '2024-01-01'
      },
      timeout: 30000
    });
  }

  /**
   * Verify if address belongs to Coinbase
   */
  async verifyAddress(address: string): Promise<boolean> {
    return rateLimiter.execute(
      'coinbase-api',
      async () => {
        try {
          // Coinbase doesn't expose deposit address verification publicly
          // Would need to check against known database
          return this.checkKnownCoinbaseAddresses(address);
        } catch (error) {
          logger.error('Error verifying Coinbase address:', error);
          return false;
        }
      },
      'verifyAddress',
      { minTime: 200, maxConcurrent: 1 }
    );
  }

  /**
   * Check against known Coinbase addresses
   */
  private checkKnownCoinbaseAddresses(address: string): boolean {
    // This would check against a database of known Coinbase addresses
    const knownAddresses = [
      // Would be populated from exchange database
    ];
    return knownAddresses.includes(address);
  }

  /**
   * Get current user info (requires auth)
   */
  async getUser(): Promise<any | null> {
    return rateLimiter.execute(
      'coinbase-api',
      async () => {
        try {
          const response = await this.client.get('/user');
          return response.data;
        } catch (error) {
          logger.error('Error getting Coinbase user:', error);
          return null;
        }
      },
      'getUser',
      { minTime: 200, maxConcurrent: 1 }
    );
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const user = await this.getUser();
      if (user) {
        logger.info('Successfully connected to Coinbase API');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to connect to Coinbase API:', error);
      return false;
    }
  }
}

export default CoinbaseClient;
