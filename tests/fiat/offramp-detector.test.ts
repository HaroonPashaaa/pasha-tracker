/**
 * OffRamp Detector Tests
 */

import { OffRampDetector } from '../../fiat-layer/offramp-detector/offramp-detector';

describe('OffRampDetector', () => {
  let detector: OffRampDetector;

  beforeEach(() => {
    detector = new OffRampDetector();
  });

  it('should be defined', () => {
    expect(detector).toBeDefined();
  });

  it('should detect known off-ramp', () => {
    const pattern = {
      amount: 1000,
      timestamp: new Date(),
      fromWallet: 'sender123',
      toWallet: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d', // Known off-ramp
      tokenType: 'SOL'
    };

    const result = detector.analyzeTransaction(pattern);
    expect(result.isOffRamp).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should not flag normal transaction', () => {
    const pattern = {
      amount: 100,
      timestamp: new Date(),
      fromWallet: 'sender123',
      toWallet: 'randomWallet456',
      tokenType: 'SOL'
    };

    const result = detector.analyzeTransaction(pattern);
    expect(result.isOffRamp).toBe(false);
  });

  it('should add custom off-ramp address', () => {
    detector.addOffRampAddress('customAddress123', 'Custom_Offramp');
    const offramps = detector.getKnownOffRamps();
    expect(offramps.has('customAddress123')).toBe(true);
  });

  it('should analyze batch of transactions', () => {
    const transactions = [
      {
        amount: 1000,
        timestamp: new Date(),
        fromWallet: 'sender1',
        toWallet: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d',
        tokenType: 'SOL'
      },
      {
        amount: 100,
        timestamp: new Date(),
        fromWallet: 'sender2',
        toWallet: 'randomWallet',
        tokenType: 'SOL'
      }
    ];

    const results = detector.analyzeBatch(transactions);
    expect(results).toHaveLength(2);
    expect(results[0].isOffRamp).toBe(true);
    expect(results[1].isOffRamp).toBe(false);
  });
});
