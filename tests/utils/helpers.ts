/**
 * Test Utilities
 * 
 * Helper functions for testing.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Create mock request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides
  } as Request;
}

/**
 * Create mock response object
 */
export function createMockResponse(): Response {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as Response;
}

/**
 * Create mock next function
 */
export function createMockNext(): NextFunction {
  return jest.fn();
}

/**
 * Create mock wallet data
 */
export function createMockWallet(overrides: any = {}) {
  return {
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    balance: 1000000000,
    labels: [],
    riskScore: 0.1,
    firstSeen: new Date(),
    lastUpdated: new Date(),
    ...overrides
  };
}

/**
 * Create mock transaction data
 */
export function createMockTransaction(overrides: any = {}) {
  return {
    signature: '5x7a...9k2m',
    slot: BigInt(123456789),
    timestamp: new Date(),
    amount: 1000000000,
    tokenType: 'SOL',
    fromAddress: 'from123',
    toAddress: 'to123',
    isOffRamp: false,
    offRampConfidence: 0,
    ...overrides
  };
}

/**
 * Create mock trace result
 */
export function createMockTraceResult(overrides: any = {}) {
  return {
    originWallet: 'origin123',
    destinationWallet: 'dest123',
    hops: [
      {
        from: 'origin123',
        to: 'intermediate',
        amount: 1000,
        timestamp: new Date(),
        signature: 'sig1'
      },
      {
        from: 'intermediate',
        to: 'dest123',
        amount: 990,
        timestamp: new Date(),
        signature: 'sig2'
      }
    ],
    totalAmount: 995,
    duration: 60000,
    pathLength: 2,
    ...overrides
  };
}

/**
 * Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock console methods during tests
 */
export function mockConsole(): { restore: () => void } {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();

  return {
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}
