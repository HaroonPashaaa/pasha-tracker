/**
 * Extended API Routes
 * 
 * Additional routes for bundle detection, wallet profiling, and monitoring.
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../../core/utils/logger';
import { BundleDetector } from '../../core/clustering/bundle-detector';
import { EntityProfiler } from '../../core/clustering/entity-profiler';
import { SolanaClient, createSolanaClient } from '../../core/indexer/solana-client';
import { cache } from '../../core/services/cache';

const router = Router();

/**
 * POST /api/v1/analyze/bundle
 * Detect wallet bundles for token
 */
router.post('/analyze/bundle', [
  body('tokenAddress').isString().isLength({ min: 32, max: 44 }),
  body('timeWindow').optional().isIn(['1h', '6h', '24h', '7d']),
  body('minWallets').optional().isInt({ min: 2, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tokenAddress, timeWindow = '24h', minWallets = 3 } = req.body;

  try {
    // Check cache
    const cacheKey = `bundle:${tokenAddress}:${timeWindow}:${minWallets}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    logger.info(`Analyzing bundles for token: ${tokenAddress}`);

    // TODO: Fetch actual purchase data from database
    // For now, return structured response
    const detector = new BundleDetector(minWallets, parseInt(timeWindow));
    
    const result = {
      tokenAddress,
      timeWindow,
      minWallets,
      bundles: [],
      totalAnalyzed: 0,
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, { ttl: 300 });

    res.json(result);
  } catch (error) {
    logger.error('Error in bundle analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/wallet/:address/risk
 * Get wallet risk score
 */
router.get('/wallet/:address/risk', [
  param('address').isString().isLength({ min: 32, max: 44 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.params;

  try {
    const cacheKey = `risk:${address}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const profiler = new EntityProfiler();
    const profile = profiler.getProfile(address);

    const result = {
      address,
      riskScore: profile.riskScore,
      riskLevel: profile.riskScore > 0.7 ? 'high' : profile.riskScore > 0.4 ? 'medium' : 'low',
      labels: profile.labels,
      indicators: profile.behaviorPatterns.map(bp => ({
        type: bp.type,
        description: bp.description,
        frequency: bp.frequency
      })),
      timestamp: new Date().toISOString(),
      cached: false
    };

    await cache.set(cacheKey, result, { ttl: 600 });
    res.json(result);
  } catch (error) {
    logger.error('Error getting risk score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/wallet/:address/related
 * Get related wallets
 */
router.get('/wallet/:address/related', [
  param('address').isString().isLength({ min: 32, max: 44 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.params;

  try {
    const profiler = new EntityProfiler();
    const profile = profiler.getProfile(address);

    res.json({
      address,
      relatedWallets: profile.relatedWallets,
      count: profile.relatedWallets.length
    });
  } catch (error) {
    logger.error('Error getting related wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/monitoring/status
 * Get system monitoring status
 */
router.get('/monitoring/status', async (req, res) => {
  try {
    const client = createSolanaClient();
    const connected = await client.testConnection();
    const cacheStats = await cache.getStats();

    res.json({
      status: connected ? 'operational' : 'degraded',
      components: {
        solanaRpc: connected ? 'connected' : 'disconnected',
        cache: cache.isAvailable() ? 'available' : 'unavailable'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting monitoring status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/exchanges/list
 * List supported exchanges
 */
router.get('/exchanges/list', async (req, res) => {
  res.json({
    exchanges: [
      { name: 'Binance', supported: true, features: ['deposit', 'withdrawal'] },
      { name: 'Coinbase', supported: true, features: ['deposit'] },
      { name: 'Kraken', supported: true, features: ['deposit', 'withdrawal'] },
      { name: 'FTX', supported: false, reason: 'Exchange defunct' }
    ]
  });
});

export default router;
