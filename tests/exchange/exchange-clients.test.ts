/**
 * Exchange Client Tests
 */

import { BinanceClient } from '../../exchange-layer/api-connectors/binance-client';
import { CoinbaseClient } from '../../exchange-layer/api-connectors/coinbase-client';
import { KrakenClient } from '../../exchange-layer/api-connectors/kraken-client';

describe('BinanceClient', () => {
  let client: BinanceClient;

  beforeEach(() => {
    client = new BinanceClient({
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key'
    });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should verify address format', async () => {
    const result = await client.verifyDepositAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    expect(typeof result).toBe('boolean');
  });
});

describe('CoinbaseClient', () => {
  let client: CoinbaseClient;

  beforeEach(() => {
    client = new CoinbaseClient({
      apiKey: 'test-api-key',
      secret: 'test-secret'
    });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });
});

describe('KrakenClient', () => {
  let client: KrakenClient;

  beforeEach(() => {
    client = new KrakenClient({
      apiKey: 'test-api-key',
      secret: 'test-secret'
    });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });
});
