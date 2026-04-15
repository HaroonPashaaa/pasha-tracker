/**
 * Entity Profiler
 * 
 * Builds comprehensive profiles for wallets and entities.
 * Tracks behavior patterns, risk scores, and relationships.
 */

import { logger } from '../utils/logger';

interface WalletProfile {
  address: string;
  firstSeen: Date;
  lastSeen: Date;
  transactionCount: number;
  totalVolumeIn: number;
  totalVolumeOut: number;
  balance: number;
  labels: string[];
  riskScore: number;
  relatedWallets: string[];
  exchangeInteractions: ExchangeInteraction[];
  tokenHoldings: TokenHolding[];
  behaviorPatterns: BehaviorPattern[];
}

interface ExchangeInteraction {
  exchange: string;
  depositCount: number;
  withdrawalCount: number;
  totalDepositVolume: number;
  totalWithdrawalVolume: number;
  lastInteraction: Date;
}

interface TokenHolding {
  tokenAddress: string;
  tokenSymbol: string;
  balance: number;
  valueUsd: number;
  firstAcquired: Date;
}

interface BehaviorPattern {
  type: string;
  frequency: number;
  description: string;
}

/**
 * EntityProfiler - Builds wallet profiles and identifies entities
 */
export class EntityProfiler {
  private profiles: Map<string, WalletProfile>;

  constructor() {
    this.profiles = new Map();
  }

  /**
   * Get or create wallet profile
   */
  getProfile(address: string): WalletProfile {
    if (!this.profiles.has(address)) {
      this.profiles.set(address, this.createEmptyProfile(address));
    }
    return this.profiles.get(address)!;
  }

  /**
   * Create empty profile
   */
  private createEmptyProfile(address: string): WalletProfile {
    return {
      address,
      firstSeen: new Date(),
      lastSeen: new Date(),
      transactionCount: 0,
      totalVolumeIn: 0,
      totalVolumeOut: 0,
      balance: 0,
      labels: [],
      riskScore: 0,
      relatedWallets: [],
      exchangeInteractions: [],
      tokenHoldings: [],
      behaviorPatterns: []
    };
  }

  /**
   * Update profile with transaction data
   */
  updateFromTransaction(
    address: string,
    isIncoming: boolean,
    amount: number,
    counterparty: string,
    timestamp: Date
  ): void {
    const profile = this.getProfile(address);
    
    profile.transactionCount++;
    profile.lastSeen = timestamp;

    if (isIncoming) {
      profile.totalVolumeIn += amount;
    } else {
      profile.totalVolumeOut += amount;
    }

    // Update first seen if earlier
    if (timestamp < profile.firstSeen) {
      profile.firstSeen = timestamp;
    }

    // Add related wallet
    if (!profile.relatedWallets.includes(counterparty)) {
      profile.relatedWallets.push(counterparty);
    }

    logger.debug(`Updated profile for ${address}: ${isIncoming ? '+' : '-'}${amount}`);
  }

  /**
   * Add label to wallet
   */
  addLabel(address: string, label: string): void {
    const profile = this.getProfile(address);
    if (!profile.labels.includes(label)) {
      profile.labels.push(label);
      logger.info(`Added label '${label}' to ${address}`);
    }
  }

  /**
   * Update risk score
   */
  updateRiskScore(address: string, score: number, reason: string): void {
    const profile = this.getProfile(address);
    profile.riskScore = Math.min(1, Math.max(0, score));
    
    if (score > 0.7) {
      this.addLabel(address, 'high_risk');
    } else if (score > 0.4) {
      this.addLabel(address, 'medium_risk');
    }

    logger.info(`Updated risk score for ${address}: ${score} (${reason})`);
  }

  /**
   * Record exchange interaction
   */
  recordExchangeInteraction(
    address: string,
    exchange: string,
    isDeposit: boolean,
    amount: number
  ): void {
    const profile = this.getProfile(address);
    
    let interaction = profile.exchangeInteractions.find(
      ei => ei.exchange === exchange
    );

    if (!interaction) {
      interaction = {
        exchange,
        depositCount: 0,
        withdrawalCount: 0,
        totalDepositVolume: 0,
        totalWithdrawalVolume: 0,
        lastInteraction: new Date()
      };
      profile.exchangeInteractions.push(interaction);
    }

    if (isDeposit) {
      interaction.depositCount++;
      interaction.totalDepositVolume += amount;
    } else {
      interaction.withdrawalCount++;
      interaction.totalWithdrawalVolume += amount;
    }

    interaction.lastInteraction = new Date();
  }

  /**
   * Add behavior pattern
   */
  addBehaviorPattern(
    address: string,
    type: string,
    description: string
  ): void {
    const profile = this.getProfile(address);
    
    const existing = profile.behaviorPatterns.find(p => p.type === type);
    
    if (existing) {
      existing.frequency++;
    } else {
      profile.behaviorPatterns.push({
        type,
        frequency: 1,
        description
      });
    }
  }

  /**
   * Get profiles with specific label
   */
  getProfilesByLabel(label: string): WalletProfile[] {
    return Array.from(this.profiles.values())
      .filter(p => p.labels.includes(label));
  }

  /**
   * Get high risk profiles
   */
  getHighRiskProfiles(threshold: number = 0.7): WalletProfile[] {
    return Array.from(this.profiles.values())
      .filter(p => p.riskScore >= threshold);
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): WalletProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Clear all profiles
   */
  clear(): void {
    this.profiles.clear();
  }
}

export default EntityProfiler;
