/**
 * Bundle Detector
 * 
 * Detects when multiple wallets are controlled by the same entity.
 * Identifies coordinated buying, bot networks, and airdrop farming.
 */

import { logger } from '../utils/logger';

interface TokenPurchase {
  walletAddress: string;
  tokenAddress: string;
  amount: number;
  timestamp: Date;
  signature: string;
}

interface WalletCluster {
  id: string;
  wallets: string[];
  confidence: number;
  indicators: ClusterIndicator[];
  totalVolume: number;
  firstPurchase: Date;
  lastPurchase: Date;
}

interface ClusterIndicator {
  type: 'timing' | 'pattern' | 'funding' | 'behavior';
  description: string;
  weight: number;
}

/**
 * BundleDetector - Identifies wallet clusters and coordinated activity
 */
export class BundleDetector {
  private minClusterSize: number;
  private timeWindow: number; // milliseconds
  private similarityThreshold: number;

  constructor(minClusterSize: number = 3, timeWindowHours: number = 24) {
    this.minClusterSize = minClusterSize;
    this.timeWindow = timeWindowHours * 60 * 60 * 1000;
    this.similarityThreshold = 0.7;
  }

  /**
   * Detect bundles for a specific token
   */
  async detectBundles(
    purchases: TokenPurchase[]
  ): Promise<WalletCluster[]> {
    logger.info(`Analyzing ${purchases.length} purchases for bundle detection`);

    if (purchases.length < this.minClusterSize) {
      return [];
    }

    const clusters: WalletCluster[] = [];
    const processedWallets = new Set<string>();

    // Group by time windows
    const timeGroups = this.groupByTimeWindow(purchases);

    for (const group of timeGroups) {
      if (group.length < this.minClusterSize) continue;

      // Find clusters within time group
      const cluster = this.analyzeCluster(group);
      
      if (cluster && cluster.confidence >= this.similarityThreshold) {
        // Check if any wallets already processed
        const newWallets = cluster.wallets.filter(w => !processedWallets.has(w));
        
        if (newWallets.length >= this.minClusterSize) {
          clusters.push(cluster);
          cluster.wallets.forEach(w => processedWallets.add(w));
        }
      }
    }

    return clusters;
  }

  /**
   * Group purchases by time window
   */
  private groupByTimeWindow(purchases: TokenPurchase[]): TokenPurchase[][] {
    const sorted = purchases.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const groups: TokenPurchase[][] = [];
    let currentGroup: TokenPurchase[] = [];
    let windowStart = sorted[0]?.timestamp.getTime() || 0;

    for (const purchase of sorted) {
      if (purchase.timestamp.getTime() - windowStart <= this.timeWindow) {
        currentGroup.push(purchase);
      } else {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [purchase];
        windowStart = purchase.timestamp.getTime();
      }
    }

    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }

  /**
   * Analyze a group for cluster indicators
   */
  private analyzeCluster(group: TokenPurchase[]): WalletCluster | null {
    const wallets = [...new Set(group.map(p => p.walletAddress))];
    
    if (wallets.length < this.minClusterSize) {
      return null;
    }

    const indicators: ClusterIndicator[] = [];
    let confidence = 0;

    // Check 1: Timing similarity
    const timingScore = this.calculateTimingScore(group);
    if (timingScore > 0.8) {
      indicators.push({
        type: 'timing',
        description: 'Purchases occurred within tight time window',
        weight: timingScore
      });
      confidence += timingScore * 0.3;
    }

    // Check 2: Amount similarity
    const patternScore = this.calculatePatternScore(group);
    if (patternScore > 0.7) {
      indicators.push({
        type: 'pattern',
        description: 'Similar purchase amounts detected',
        weight: patternScore
      });
      confidence += patternScore * 0.3;
    }

    // Check 3: Behavioral patterns
    const behaviorScore = this.calculateBehaviorScore(group);
    if (behaviorScore > 0.6) {
      indicators.push({
        type: 'behavior',
        description: 'Similar transaction patterns',
        weight: behaviorScore
      });
      confidence += behaviorScore * 0.4;
    }

    if (confidence < this.similarityThreshold) {
      return null;
    }

    const timestamps = group.map(p => p.timestamp.getTime());
    const totalVolume = group.reduce((sum, p) => sum + p.amount, 0);

    return {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wallets,
      confidence: Math.min(confidence, 1.0),
      indicators,
      totalVolume,
      firstPurchase: new Date(Math.min(...timestamps)),
      lastPurchase: new Date(Math.max(...timestamps))
    };
  }

  /**
   * Calculate timing similarity score
   */
  private calculateTimingScore(group: TokenPurchase[]): number {
    const timestamps = group.map(p => p.timestamp.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const range = maxTime - minTime;

    // Lower range = higher score
    const MAX_RANGE = 60 * 60 * 1000; // 1 hour
    return Math.max(0, 1 - (range / MAX_RANGE));
  }

  /**
   * Calculate pattern similarity score
   */
  private calculatePatternScore(group: TokenPurchase[]): number {
    const amounts = group.map(p => p.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower coefficient of variation = higher similarity
    const cv = stdDev / avg;
    return Math.max(0, 1 - cv);
  }

  /**
   * Calculate behavioral similarity score
   */
  private calculateBehaviorScore(group: TokenPurchase[]): number {
    // Check if wallets use similar gas prices, similar instruction patterns, etc.
    // Simplified for now - would need transaction details
    return 0.5; // Placeholder
  }

  /**
   * Calculate link score between specific wallets
   */
  calculateLinkScore(wallet1: string, wallet2: string, purchases: TokenPurchase[]): number {
    const w1Purchases = purchases.filter(p => p.walletAddress === wallet1);
    const w2Purchases = purchases.filter(p => p.walletAddress === wallet2);

    if (w1Purchases.length === 0 || w2Purchases.length === 0) {
      return 0;
    }

    // Check time correlation
    const timeCorrelations = [];
    for (const p1 of w1Purchases) {
      for (const p2 of w2Purchases) {
        const timeDiff = Math.abs(p1.timestamp.getTime() - p2.timestamp.getTime());
        const correlation = Math.max(0, 1 - (timeDiff / (60 * 60 * 1000))); // Within 1 hour
        timeCorrelations.push(correlation);
      }
    }

    return timeCorrelations.reduce((a, b) => a + b, 0) / timeCorrelations.length;
  }
}

export default BundleDetector;
