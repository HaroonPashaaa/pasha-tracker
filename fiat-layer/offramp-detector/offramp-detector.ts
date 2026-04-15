/**
 * Fiat Off-Ramp Detector
 * 
 * Identifies when cryptocurrency is converted to fiat currency.
 * Detects exchange withdrawals, stablecoin burns, and known off-ramp patterns.
 */

import { logger } from '../../core/utils/logger';

interface OffRampIndicators {
  isOffRamp: boolean;
  confidence: number;
  type?: 'exchange_withdrawal' | 'stablecoin_burn' | 'bridge_to_fiat' | 'unknown';
  details?: string;
}

interface TransactionPattern {
  amount: number;
  timestamp: Date;
  fromWallet: string;
  toWallet: string;
  tokenType: string;
}

/**
 * OffRampDetector - Identifies fiat conversion points
 */
export class OffRampDetector {
  private knownOffRamps: Map<string, string>;
  private stablecoinContracts: Set<string>;

  constructor() {
    this.knownOffRamps = new Map();
    this.stablecoinContracts = new Set();
    this.initializeKnownOffRamps();
  }

  /**
   * Initialize database of known off-ramp addresses
   */
  private initializeKnownOffRamps(): void {
    // Major exchange withdrawal wallets
    const offRamps = [
      // Binance withdrawal wallets
      { address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d', name: 'Binance_Withdrawal_1' },
      { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', name: 'Binance_Withdrawal_2' },
      // Coinbase withdrawal wallets
      { address: 'H6dYE...sample', name: 'Coinbase_Withdrawal_1' },
      // Kraken withdrawal wallets
      { address: 'Kr3k3n...sample', name: 'Kraken_Withdrawal_1' },
    ];

    for (const ramp of offRamps) {
      this.knownOffRamps.set(ramp.address, ramp.name);
    }

    // Stablecoin contracts (burns = off-ramping)
    this.stablecoinContracts.add('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
    this.stablecoinContracts.add('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'); // USDT
  }

  /**
   * Analyze transaction for off-ramp indicators
   */
  analyzeTransaction(pattern: TransactionPattern): OffRampIndicators {
    logger.info(`Analyzing transaction: ${pattern.fromWallet} -> ${pattern.toWallet}`);

    // Check 1: Known off-ramp address
    if (this.knownOffRamps.has(pattern.toWallet)) {
      return {
        isOffRamp: true,
        confidence: 0.95,
        type: 'exchange_withdrawal',
        details: `Known off-ramp: ${this.knownOffRamps.get(pattern.toWallet)}`
      };
    }

    // Check 2: Large stablecoin transfer to exchange
    if (this.isLargeStablecoinToExchange(pattern)) {
      return {
        isOffRamp: true,
        confidence: 0.85,
        type: 'exchange_withdrawal',
        details: 'Large stablecoin transfer to exchange wallet'
      };
    }

    // Check 3: Stablecoin burn
    if (this.isStablecoinBurn(pattern)) {
      return {
        isOffRamp: true,
        confidence: 0.9,
        type: 'stablecoin_burn',
        details: 'Stablecoin burn detected'
      };
    }

    // Check 4: Cross-chain bridge to fiat-friendly chain
    if (this.isBridgeToFiatChain(pattern)) {
      return {
        isOffRamp: true,
        confidence: 0.7,
        type: 'bridge_to_fiat',
        details: 'Bridge transfer to fiat-friendly chain'
      };
    }

    return {
      isOffRamp: false,
      confidence: 0.0
    };
  }

  /**
   * Check if large stablecoin transfer to exchange
   */
  private isLargeStablecoinToExchange(pattern: TransactionPattern): boolean {
    const LARGE_AMOUNT_THRESHOLD = 10000; // $10k
    const stablecoins = ['USDC', 'USDT', 'BUSD'];
    
    if (!stablecoins.includes(pattern.tokenType)) {
      return false;
    }

    if (pattern.amount < LARGE_AMOUNT_THRESHOLD) {
      return false;
    }

    // Check if destination is known exchange deposit
    // This would check exchange-layer database
    return this.isExchangeDeposit(pattern.toWallet);
  }

  /**
   * Check if transaction is a stablecoin burn
   */
  private isStablecoinBurn(pattern: TransactionPattern): boolean {
    // Burns typically go to specific burn addresses
    const BURN_ADDRESSES = [
      '1nc1nerator11111111111111111111111111111111', // Common burn address
      'Burn111111111111111111111111111111111111111', // Another burn address
    ];

    return BURN_ADDRESSES.includes(pattern.toWallet);
  }

  /**
   * Check if transaction bridges to fiat-friendly chain
   */
  private isBridgeToFiatChain(pattern: TransactionPattern): boolean {
    // Bridge contract addresses
    const BRIDGE_CONTRACTS = [
      'worm2...', // Wormhole
      'allbr...', // Allbridge
    ];

    return BRIDGE_CONTRACTS.includes(pattern.toWallet);
  }

  /**
   * Check if wallet is exchange deposit
   */
  private isExchangeDeposit(address: string): boolean {
    // Would query exchange-layer database
    return false;
  }

  /**
   * Add new off-ramp address to database
   */
  addOffRampAddress(address: string, name: string): void {
    this.knownOffRamps.set(address, name);
    logger.info(`Added off-ramp address: ${name} (${address})`);
  }

  /**
   * Get all known off-ramp addresses
   */
  getKnownOffRamps(): Map<string, string> {
    return new Map(this.knownOffRamps);
  }

  /**
   * Analyze batch of transactions for off-ramp patterns
   */
  analyzeBatch(transactions: TransactionPattern[]): OffRampIndicators[] {
    return transactions.map(tx => this.analyzeTransaction(tx));
  }
}

export default OffRampDetector;
