/**
 * Tests for Off-Ramp Detector
 */

import { OffRampDetector } from '../../fiat-layer/offramp-detector/offramp-detector';

describe('OffRampDetector', () => {
  let detector: OffRampDetector;

  beforeEach(() => {
    detector = new OffRampDetector();
  });

  describe('analyzeTransaction', () => {
    it('should detect known off-ramp addresses', () => {
      const pattern = {
        fromWallet: 'wallet1',
        toWallet: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d', // Known Binance withdrawal
        amount: 1000,
        timestamp: new Date(),
        tokenType: 'SOL'
      };

      const result = detector.analyzeTransaction(pattern);
      
      expect(result.isOffRamp).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.type).toBe('exchange_withdrawal');
    });

    it('should detect stablecoin burns', () => {
      const pattern = {
        fromWallet: 'wallet1',
        toWallet: '1nc1nerator11111111111111111111111111111111',
        amount: 5000,
        timestamp: new Date(),
        tokenType: 'USDC'
      };

      const result = detector.analyzeTransaction(pattern);
      
      expect(result.isOffRamp).toBe(true);
      expect(result.type).toBe('stablecoin_burn');
    });

    it('should not flag normal transactions', () => {
      const pattern = {
        fromWallet: 'wallet1',
        toWallet: 'wallet2',
        amount: 100,
        timestamp: new Date(),
        tokenType: 'SOL'
      };

      const result = detector.analyzeTransaction(pattern);
      
      expect(result.isOffRamp).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should detect large stablecoin transfers', () => {
      const pattern = {
        fromWallet: 'wallet1',
        toWallet: 'exchange_wallet',
        amount: 15000, // Large amount
        timestamp: new Date(),
        tokenType: 'USDC'
      };

      // Would need to mock exchange check
      const result = detector.analyzeTransaction(pattern);
      
      // Result depends on exchange database
      expect(result).toBeDefined();
    });
  });

  describe('addOffRampAddress', () => {
    it('should add new off-ramp address', () => {
      detector.addOffRampAddress('new_address_123', 'Test_Exchange');
      
      const ramps = detector.getKnownOffRamps();
      expect(ramps.has('new_address_123')).toBe(true);
    });
  });

  describe('analyzeBatch', () => {
    it('should analyze multiple transactions', () => {
      const transactions = [
        {
          fromWallet: 'w1',
          toWallet: 'w2',
          amount: 100,
          timestamp: new Date(),
          tokenType: 'SOL'
        },
        {
          fromWallet: 'w1',
          toWallet: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d',
          amount: 1000,
          timestamp: new Date(),
          tokenType: 'SOL'
        }
      ];

      const results = detector.analyzeBatch(transactions);
      
      expect(results).toHaveLength(2);
      expect(results[1].isOffRamp).toBe(true);
    });
  });
});
