/**
 * Seed Exchange Wallets
 * 
 * Populates database with known exchange wallet addresses.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exchangeWallets = [
  // Binance
  { address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBw9KHKiUtR8d', exchange: 'Binance', walletType: 'hot' },
  { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', exchange: 'Binance', walletType: 'hot' },
  
  // Coinbase
  { address: 'CoinbaseHot1Example1111111111111111111111111', exchange: 'Coinbase', walletType: 'hot' },
  
  // Kraken  
  { address: 'KrakenHot1Example111111111111111111111111111', exchange: 'Kraken', walletType: 'hot' },
  
  // FTX (historical)
  { address: 'FTXHot1Example111111111111111111111111111111', exchange: 'FTX', walletType: 'hot' },
];

async function seedExchanges() {
  console.log('Seeding exchange wallets...');
  
  for (const wallet of exchangeWallets) {
    await prisma.exchangeWallet.upsert({
      where: { address: wallet.address },
      update: { 
        exchange: wallet.exchange, 
        walletType: wallet.walletType,
        lastVerified: new Date()
      },
      create: {
        address: wallet.address,
        exchange: wallet.exchange,
        walletType: wallet.walletType
      }
    });
  }
  
  console.log(`Seeded ${exchangeWallets.length} exchange wallets`);
}

seedExchanges()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
